import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'

export const dynamic = 'force-dynamic'

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

      // Increment usage — non-blocking
      void (async () => {
        try {
          const { error: rpcError } = await supabase.rpc('increment_conversations', { user_id: agent.user_id })
          if (rpcError) {
            await supabase.from('profiles')
              .update({ conversations_used: (profile?.conversations_used ?? 0) + 1 })
              .eq('id', agent.user_id)
          }
        } catch { /* non-critical */ }
      })()
    }

    // Save user message
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: message,
    })

    // Embed query using Gemini (for vector search)
    const geminiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY
    let context = ''

    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey)
        const embeddingModel = genAI.getGenerativeModel({ model: 'embedding-001' })
        const embeddingResult = await embeddingModel.embedContent(message)
        const embedding = embeddingResult.embedding.values

        const { data: chunks } = await supabase.rpc('match_chunks', {
          query_embedding: embedding,
          match_agent_id: agentId,
          match_count: 5,
        })
        context = chunks?.map((c: { content: string }) => c.content).join('\n\n') || ''
      } catch {
        // Embedding failed — continue without context
      }
    }

    // Get recent messages for chat history
    const { data: recentMessages } = await supabase
      .from('messages').select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(11)

    const history = (recentMessages || []).reverse().slice(0, -1)

    // Generate response using Groq (free, fast)
    const groqKey = process.env.GROQ_API_KEY
    let reply = ''

    if (groqKey) {
      const groq = new Groq({ apiKey: groqKey })

      const systemPrompt = `${agent.system_prompt}

${context ? `Knowledge base:\n${context}` : 'No knowledge base loaded yet.'}

Rules:
- Answer only from the knowledge base above.
- If not in context, say you do not have that info and offer to escalate.
- Keep answers short and helpful.
- Never make up information.`

      const messages: Groq.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...history.map((m: { role: string; content: string }) => ({
          role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
          content: m.content,
        })),
        { role: 'user', content: message },
      ]

      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages,
        max_tokens: 500,
        temperature: 0.3,
      })

      reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    } else if (geminiKey) {
      // Fallback to Gemini if no Groq key
      const genAI = new GoogleGenerativeAI(geminiKey)
      const chatModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })

      const chat = chatModel.startChat({
        history: [
          { role: 'user', parts: [{ text: `${agent.system_prompt}\n\nKnowledge base:\n${context}` }] },
          { role: 'model', parts: [{ text: 'Understood.' }] },
          ...history.map((m: { role: string; content: string }) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
        ],
      })
      const result = await chat.sendMessage(message)
      reply = result.response.text()

    } else {
      return NextResponse.json({ error: 'No AI API key configured.' }, { status: 500, headers: CORS })
    }

    // Save assistant reply
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: reply,
    })

    return NextResponse.json({ reply, conversationId }, { headers: CORS })
  } catch (err) {
    console.error('Chat error:', err)
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500, headers: CORS })
  }
}
