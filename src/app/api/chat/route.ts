import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

// CORS headers — required for cross-domain widget requests
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { agentId, sessionId, message, pageUrl } = await req.json()

    if (!agentId || !message) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400, headers: CORS })
    }

    // Load agent
    const { data: agent, error: agentError } = await supabase
      .from('agents').select('*').eq('id', agentId).single()

    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent not found.' }, { status: 404, headers: CORS })
    }

    // Check conversation limit
    const { data: profile } = await supabase
      .from('profiles')
      .select('conversations_used, conversations_limit, plan')
      .eq('id', agent.user_id)
      .single()

    if (profile && profile.conversations_limit !== -1 && profile.conversations_limit > 0 &&
        profile.conversations_used >= profile.conversations_limit) {
      const fallback = agent.escalation_email
        ? `I've reached my conversation limit. Please email ${agent.escalation_email} for help.`
        : "I've reached my conversation limit. Please check back soon."
      return NextResponse.json({ reply: fallback }, { headers: CORS })
    }

    // Get or create conversation
    let conversationId: string
    const { data: existing } = await supabase
      .from('conversations').select('id')
      .eq('session_id', sessionId).eq('agent_id', agentId).single()

    if (existing) {
      conversationId = existing.id
    } else {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({ agent_id: agentId, session_id: sessionId, page_url: pageUrl, status: 'open' })
        .select().single()

      if (convError || !newConv) {
        return NextResponse.json({ error: 'Failed to create conversation.' }, { status: 500, headers: CORS })
      }
      conversationId = newConv.id

      // Atomic increment
      await supabase.rpc('increment_conversations', { user_id: agent.user_id })
    }

    // Save user message
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: message,
    })

    // Get recent messages BEFORE the one we just inserted for context
    const { data: recentMessages } = await supabase
      .from('messages').select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(11)

    const history = (recentMessages || []).reverse().slice(0, -1) // exclude just-inserted message

    // Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'AI not configured.' }, { status: 500, headers: CORS })
    }
    const genAI = new GoogleGenerativeAI(apiKey)

    // Embed query for vector search
    const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' })
    const embeddingResult = await embeddingModel.embedContent(message)
    const embedding = embeddingResult.embedding.values

    const { data: chunks } = await supabase.rpc('match_chunks', {
      query_embedding: embedding,
      match_agent_id: agentId,
      match_count: 5,
    })

    const context = chunks?.map((c: { content: string }) => c.content).join('\n\n') || ''

    // Generate response
    const chatModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const systemPrompt = `${agent.system_prompt}

Knowledge base:
${context || 'No specific context found. Be honest and offer to escalate if unsure.'}

Rules:
- Answer only from the knowledge base above.
- If not in context, say you do not have that info and offer to escalate.
- Keep answers short and helpful.
- Never make up information.`

    const chatHistory = history.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const chat = chatModel.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I will answer based on the knowledge base only.' }] },
        ...chatHistory,
      ],
    })

    const result = await chat.sendMessage(message)
    const reply = result.response.text()

    // Save assistant reply
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: reply,
    })

    return NextResponse.json({ reply, conversationId }, { headers: CORS })
  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500, headers: CORS })
  }
}
