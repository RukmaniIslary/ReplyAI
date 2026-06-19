import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import * as cheerio from 'cheerio'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Raysef-Crawler/1.0' },
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.text()
}

function chunkText(text: string, maxLen = 1000): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/)
  const chunks: string[] = []
  let current = ''

  for (const sentence of sentences) {
    if ((current + ' ' + sentence).length > maxLen) {
      if (current) chunks.push(current.trim())
      current = sentence
    } else {
      current = current ? current + ' ' + sentence : sentence
    }
  }
  if (current) chunks.push(current.trim())
  return chunks.filter((c) => c.length > 50)
}

export async function POST(req: NextRequest) {
  try {
    const serviceSupabase = createServiceClient()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { agentId, url } = await req.json()
    if (!agentId || !url) {
      return NextResponse.json({ error: 'Missing agentId or url.' }, { status: 400 })
    }

    // Verify agent belongs to user
    const { data: agent } = await serviceSupabase
      .from('agents')
      .select('id')
      .eq('id', agentId)
      .eq('user_id', user.id)
      .single()

    if (!agent) return NextResponse.json({ error: 'Agent not found.' }, { status: 404 })

    // Create source record
    const { data: source } = await serviceSupabase
      .from('sources')
      .insert({ agent_id: agentId, type: 'url', url, status: 'processing' })
      .select()
      .single()

    try {
      const html = await fetchPage(url)
      const $ = cheerio.load(html)

      // Remove noise
      $('script, style, nav, footer, header, .cookie-banner, #cookie').remove()

      const text = $('body').text().replace(/\s+/g, ' ').trim()
      const chunks = chunkText(text)

      // Generate embeddings and store chunks
      const genAI = new GoogleGenerativeAI(process.env.OPENAI_API_KEY!)
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' })

      let inserted = 0
      for (const chunk of chunks) {
        const result = await model.embedContent(chunk)
        const embedding = result.embedding.values

        await serviceSupabase.from('chunks').insert({
          agent_id: agentId,
          source_id: source!.id,
          content: chunk,
          embedding,
        })
        inserted++
      }

      await serviceSupabase
        .from('sources')
        .update({ status: 'ready', chunk_count: inserted })
        .eq('id', source!.id)

      return NextResponse.json({ success: true, chunks: inserted })
    } catch (err) {
      await serviceSupabase
        .from('sources')
        .update({ status: 'error' })
        .eq('id', source!.id)
      throw err
    }
  } catch (err) {
    console.error('Crawl error:', err)
    return NextResponse.json({ error: 'Failed to crawl URL.' }, { status: 500 })
  }
}
