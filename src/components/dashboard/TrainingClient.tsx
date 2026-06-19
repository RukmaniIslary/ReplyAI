'use client'

import { useState } from 'react'
import { Globe, CheckCircle, XCircle, Loader2, BookOpen } from 'lucide-react'
import type { Agent, Source } from '@/lib/types'

export function TrainingClient({ agents, sources }: { agents: Pick<Agent, 'id' | 'name'>[]; sources: Source[] }) {
  const [agentId, setAgentId] = useState(agents[0]?.id || '')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null)
  const [localSources, setLocalSources] = useState<Source[]>(sources)

  async function crawlUrl(e: React.FormEvent) {
    e.preventDefault()
    if (!agentId || !url) return
    setLoading(true)
    setResult(null)

    const res = await fetch('/api/crawl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, url }),
    })
    const data = await res.json()

    if (data.success) {
      setResult({ success: true, message: `Crawled successfully — ${data.chunks} knowledge chunks created.` })
      setUrl('')
      // Optimistically add to list
      setLocalSources((prev) => [{
        id: crypto.randomUUID(),
        agent_id: agentId,
        type: 'url',
        url,
        filename: null,
        status: 'ready',
        chunk_count: data.chunks,
        created_at: new Date().toISOString(),
      }, ...prev])
    } else {
      setResult({ success: false, message: data.error || 'Failed to crawl URL.' })
    }
    setLoading(false)
  }

  const statusColor: Record<string, string> = {
    ready: 'text-green-400',
    processing: 'text-yellow-400',
    error: 'text-red-400',
    pending: 'text-neutral-400',
  }

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <Globe size={18} className="text-lime-400" />
          <h2 className="font-semibold text-white">Crawl a website URL</h2>
        </div>

        <form onSubmit={crawlUrl} className="space-y-4">
          {agents.length > 1 && (
            <div>
              <label className="label">Agent</label>
              <select
                className="input"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
              >
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="label">Website URL</label>
            <input
              className="input"
              type="url"
              placeholder="https://yourwebsite.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <p className="mt-1 text-xs text-neutral-500">
              Raysef will crawl this page and extract all text content to train your agent.
            </p>
          </div>

          {result && (
            <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
              result.success ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {result.success ? <CheckCircle size={14} /> : <XCircle size={14} />}
              {result.message}
            </div>
          )}

          <button type="submit" disabled={loading || !agentId} className="btn-primary">
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Crawling...</>
            ) : (
              <><Globe size={14} /> Crawl URL</>
            )}
          </button>
        </form>
      </div>

      {/* Sources list */}
      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <BookOpen size={18} className="text-lime-400" />
          <h2 className="font-semibold text-white">Knowledge sources ({localSources.length})</h2>
        </div>

        {localSources.length > 0 ? (
          <div className="space-y-2">
            {localSources.map((source) => (
              <div key={source.id} className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Globe size={14} className="flex-shrink-0 text-neutral-500" />
                  <span className="text-sm text-neutral-300 truncate">{source.url || source.filename}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  {source.chunk_count > 0 && (
                    <span className="text-xs text-neutral-500">{source.chunk_count} chunks</span>
                  )}
                  <span className={`text-xs font-medium capitalize ${statusColor[source.status] || 'text-neutral-400'}`}>
                    {source.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-800 py-10 text-center">
            <BookOpen size={28} className="mb-2 text-neutral-700" />
            <p className="text-sm text-neutral-500">No training sources yet. Crawl a URL to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
