import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceClient()

    const { agentId, sessionId, message, pageUrl } = await req.json()

    if (!agentId || !message) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    // Load agent
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent not found.' }, { status: 404 })
    }

    // Check conversation limit
    const { data: profile } = await supabase
      .from('profiles')
      .select('conversations_used, conversations_limit, plan')
      .eq('id', agent.user_id)
      .single()

    if (
      profile &&
      profile.conversations_limit !== -1 &&
      profile.conversations_used >= profile.conversations_limit
    ) {
      const fallback =
        agent.escalation_email
          ? `I've reached my conversation limit for this month. Please email us at ${agent.escalation_email} for help.`
          : "I've reached my conversation limit for this month. Please check back soon."
      return NextResponse.json({ reply: fallback })
    }

    // Get or create conversation
    let conversationId: string
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('session_id', sessionId)
      .eq('agent_id', agentId)
      .single()

    if (existing) {
      conversationId = existing.id
    } else {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ agent_id: agentId, session_id: sessionId, page_url: pageUrl, status: 'open' })
        .select()
        .single()
      conversationId = newConv!.id

      // Increment usage
      await supabase
        .from('profiles')
        .update({ conversations_used: (profile?.conversations_used ?? 0) + 1 })
        .eq('id', agent.user_id)
    }

    // Save user message
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: message,
    })

    // Initialize Gemini
    const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'AI API key not configured.' }, { status: 500 })
    const genAI = new GoogleGenerativeAI(apiKey)
    const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' })
    const embeddingResult = await embeddingModel.embedContent(message)
    const embedding = embeddingResult.embedding.values

    const { data: chunks } = await supabase.rpc('match_chunks', {
      query_embedding: embedding,
      match_agent_id: agentId,
      match_count: 5,
    })

    const context = chunks?.map((c: { content: string }) => c.content).join('\n\n') || ''

    // Get recent messages for context
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(10)

    const history = (recentMessages || []).reverse()

    // Generate AI response
    const chatModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const systemPrompt = `${agent.system_prompt}

Knowledge base context:
${context || 'No specific context found. Answer based on general knowledge about the business.'}

Instructions:
- Answer based on the knowledge base context above.
- If the answer is not in the context, say you do not have that information and offer to escalate.
- Keep answers concise and helpful.
- Do not make up information.`

    const chatHistory = history.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const chat = chatModel.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I will answer based on the knowledge base provided.' }] },
        ...chatHistory,
      ],
    })

    const result = await chat.sendMessage(message)
    const reply = result.response.text()

    // Save assistant message
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: reply,
    })

    return NextResponse.json({ reply, conversationId })
  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
