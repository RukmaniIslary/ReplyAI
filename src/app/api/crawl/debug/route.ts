import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export async function GET() {
  const results: Record<string, string> = {}

  // Check env vars
  results.supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING'
  results.supabase_anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
  results.supabase_service = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? (process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith('postgresql') ? 'WRONG (postgres DSN)' : 'SET')
    : 'MISSING'
  results.gemini_key = process.env.OPENAI_API_KEY ? `SET (starts with ${process.env.OPENAI_API_KEY.slice(0, 5)})` : 'MISSING'

  // Test Supabase connection
  try {
    const sb = createServiceClient()
    const { error } = await sb.from('agents').select('id').limit(1)
    results.supabase_connection = error ? `ERROR: ${error.message}` : 'OK'
  } catch (e) {
    results.supabase_connection = `EXCEPTION: ${e instanceof Error ? e.message : String(e)}`
  }

  // Test Gemini embedding
  try {
    const genAI = new GoogleGenerativeAI(process.env.OPENAI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' })
    const result = await model.embedContent({
      content: { parts: [{ text: 'test' }], role: 'user' },
      outputDimensionality: 768,
    } as Parameters<typeof model.embedContent>[0])
    results.gemini_embedding = `OK — ${result.embedding.values.length} dimensions`
  } catch (e) {
    results.gemini_embedding = `ERROR: ${e instanceof Error ? e.message : String(e)}`
  }

  // Test fetch a URL
  try {
    const res = await fetch('https://example.com', {
      headers: { 'User-Agent': 'Raysef-Crawler/1.0' },
      signal: AbortSignal.timeout(10000),
    })
    results.fetch_test = `OK — status ${res.status}`
  } catch (e) {
    results.fetch_test = `ERROR: ${e instanceof Error ? e.message : String(e)}`
  }

  return NextResponse.json(results, { status: 200 })
}
