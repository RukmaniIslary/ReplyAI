import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import * as cheerio from 'cheerio'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Raysef-Crawler/1.0)',
      'Accept': 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

function extractText($: ReturnType<typeof cheerio.load>): string {
  $('script, style, noscript, nav, footer, header, aside, iframe, svg, img').remove()
  $('[class*="cookie"], [class*="banner"], [class*="popup"], [id*="cookie"]').remove()
  const text = $('body').text()
  return text.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim()
}

function chunkText(text: string, maxLen = 800): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/)
  const chunks: string[] = []
  let current = ''
  for (const sentence of sentences) {
    const candidate = current ? current + ' ' + sentence : sentence
    if (candidate.length > maxLen) {
      if (current.length > 50) chunks.push(current.trim())
      current = sentence
    } else {
      current = candidate
    }
  }
  if (current.length > 50) chunks.push(current.trim())
  return chunks.slice(0, 150)
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { agentId, url } = await req.json()
    if (!agentId || !url) return NextResponse.json({ error: 'Missing agentId or url.' }, { status: 400 })

    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return NextResponse.json({ error: 'Only HTTP/HTTPS URLs are supported.' }, { status: 400 })
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL format.' }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()

    const { data: agent } = await serviceSupabase
      .from('agents').select('id').eq('id', agentId).eq('user_id', user.id).single()
    if (!agent) return NextResponse.json({ error: 'Agent not found.' }, { status: 404 })

    const { data: existing } = await serviceSupabase
      .from('sources').select('id, status').eq('agent_id', agentId).eq('url', url).single()

    if (existing?.status === 'ready') {
      return NextResponse.json({ error: 'Already crawled. Delete it first to re-crawl.' }, { status: 409 })
    }

    let sourceId: string
    if (existing) {
      sourceId = existing.id
      await serviceSupabase.from('sources').update({ status: 'processing', chunk_count: 0 }).eq('id', sourceId)
      await serviceSupabase.from('chunks').delete().eq('source_id', sourceId)
    } else {
      const { data: source, error: sourceError } = await serviceSupabase
        .from('sources')
        .insert({ agent_id: agentId, type: 'url', url, status: 'processing' })
        .select().single()
      if (sourceError || !source) throw new Error('Failed to create source record')
      sourceId = source.id
    }

    try {
      const html = await fetchPage(url)
      const $ = cheerio.load(html)
      const text = extractText($)

      if (text.length < 100) {
        await serviceSupabase.from('sources').update({ status: 'error' }).eq('id', sourceId)
        return NextResponse.json({ error: 'Page has no readable content.' }, { status: 400 })
      }

      const chunks = chunkText(text)
      if (chunks.length === 0) {
        await serviceSupabase.from('sources').update({ status: 'error' }).eq('id', sourceId)
        return NextResponse.json({ error: 'Could not extract text chunks.' }, { status: 400 })
      }

      // Store chunks WITHOUT embeddings — use keyword search in chat
      const rows = chunks.map(content => ({
        agent_id: agentId,
        source_id: sourceId,
        content,
        embedding: null,
      }))

      const { error: insertError } = await serviceSupabase.from('chunks').insert(rows)
      if (insertError) throw new Error(`Failed to store chunks: ${insertError.message}`)

      await serviceSupabase
        .from('sources')
        .update({ status: 'ready', chunk_count: chunks.length })
        .eq('id', sourceId)

      return NextResponse.json({ success: true, chunks: chunks.length })

    } catch (err) {
      await serviceSupabase.from('sources').update({ status: 'error' }).eq('id', sourceId)
      const msg = err instanceof Error ? err.message : 'Unknown error'
      return NextResponse.json({ error: `Crawl failed: ${msg}` }, { status: 500 })
    }

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
