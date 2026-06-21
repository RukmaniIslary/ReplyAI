import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
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

// Simple keyword search — no embeddings needed
function findRelevantChunks(chunks: { content: string }[], query: string, limit = 5): string[] {
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  
  const scored = chunks.map(chunk => {
    const text = chunk.content.toLowerCase()
    const score = words.reduce((acc, word) => {
      const count = (text.match(new RegExp(word, 'g')) || []).length
      return acc + count
    }, 0)
    return { content: chunk.content, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .filter(c => c.score > 0)
    .map(c => c.content)
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { agentId, sessionId, message, pageUrl } = await req.json()

    if (!agentId || !message) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400, headers: CORS })
    }

    const { data: agent, error: agentError } = await supabase
      .from('agents').select('*').eq('id', agentId).single()

    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent not found.' }, { status: 404, headers: CORS })
    }

    // Check conversation limit
    const { data: profile } = await supabase
      .from('profiles')
      .select('conversations_used, conversations_limit, plan')
      .eq('id', agent.user_id).single()

    if (profile && profile.conversations_limit !== -1 && profile.conversations_limit > 0 &&
        profile.conversations_used >= profile.conversations_limit) {
      const fallback = agent.escalation_email
        ? `Conversation limit reached. Please email ${agent.escalation_email}.`
        : "Conversation limit reached. Please check back soon."
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

    // Get all chunks for this agent and do keyword search
    const { data: allChunks } = await supabase
      .from('chunks')
      .select('content')
      .eq('agent_id', agentId)

    const relevantChunks = findRelevantChunks(allChunks || [], message)
    const context = relevantChunks.join('\n\n')

    // Get recent chat history
    const { data: recentMessages } = await supabase
      .from('messages').select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(11)

    const history = (recentMessages || []).reverse().slice(0, -1)

    // Generate response with Groq
    const groqKey = process.env.GROQ_API_KEY
    if (!groqKey) {
      return NextResponse.json({ error: 'AI not configured.' }, { status: 500, headers: CORS })
    }

    const groq = new Groq({ apiKey: groqKey })

    const systemPrompt = `${agent.system_prompt}

${context ? `Knowledge base:\n${context}` : 'No knowledge base loaded yet. Ask the user to set up training data.'}

Rules:
- Answer only from the knowledge base above.
- If the answer is not in the knowledge base, say you do not have that info and offer to escalate.
- Keep answers short, clear and helpful.
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

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    // Save reply
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
