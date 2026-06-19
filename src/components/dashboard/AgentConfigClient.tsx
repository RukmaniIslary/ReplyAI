'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Save, Globe, Loader2, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import type { Agent, Source } from '@/lib/types'

export function AgentConfigClient({ agent, sources }: { agent: Agent; sources: Source[] }) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: agent.name,
    welcome_message: agent.welcome_message,
    system_prompt: agent.system_prompt,
    widget_color: agent.widget_color,
    escalation_email: agent.escalation_email || '',
  })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const [crawlUrl, setCrawlUrl] = useState('')
  const [crawling, setCrawling] = useState(false)
  const [crawlResult, setCrawlResult] = useState<{ success?: boolean; message?: string } | null>(null)
  const [localSources, setLocalSources] = useState<Source[]>(sources)

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function saveAgent(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveMsg('')
    const supabase = createClient()
    const { error } = await supabase.from('agents').update(form).eq('id', agent.id)
    if (!error) {
      setSaveMsg('Saved.')
      router.refresh()
    } else {
      setSaveMsg(error.message)
    }
    setSaving(false)
  }

  async function crawl(e: React.FormEvent) {
    e.preventDefault()
    if (!crawlUrl) return
    setCrawling(true)
    setCrawlResult(null)
    const res = await fetch('/api/crawl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: agent.id, url: crawlUrl }),
    })
    const data = await res.json()
    if (data.success) {
      setCrawlResult({ success: true, message: `Done — ${data.chunks} knowledge chunks created.` })
      setCrawlUrl('')
      setLocalSources((prev) => [{
        id: crypto.randomUUID(),
        agent_id: agent.id,
        type: 'url',
        url: crawlUrl,
        filename: null,
        status: 'ready',
        chunk_count: data.chunks,
        created_at: new Date().toISOString(),
      }, ...prev])
    } else {
      setCrawlResult({ success: false, message: data.error || 'Failed to crawl URL.' })
    }
    setCrawling(false)
  }

  async function deleteSource(sourceId: string) {
    const supabase = createClient()
    await supabase.from('sources').delete().eq('id', sourceId)
    setLocalSources((prev) => prev.filter((s) => s.id !== sourceId))
  }

  const statusColor: Record<string, string> = {
    ready: 'text-green-400',
    processing: 'text-yellow-400',
    error: 'text-red-400',
    pending: 'text-neutral-400',
  }

  return (
    <div className="space-y-5">
      {/* Config form */}
      <form onSubmit={saveAgent} className="card space-y-5">
        <h2 className="font-semibold text-white">Agent settings</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Agent name</label>
            <input className="input" value={form.name} onChange={(e) => update('name', e.target.value)} required />
          </div>
          <div>
            <label className="label">Escalation email</label>
            <input className="input" type="email" value={form.escalation_email} onChange={(e) => update('escalation_email', e.target.value)} placeholder="support@yourcompany.com" />
          </div>
        </div>

        <div>
          <label className="label">Welcome message</label>
          <input className="input" value={form.welcome_message} onChange={(e) => update('welcome_message', e.target.value)} required />
        </div>

        <div>
          <label className="label">Widget color</label>
          <div className="flex items-center gap-3">
            <input type="color" value={form.widget_color} onChange={(e) => update('widget_color', e.target.value)} className="h-10 w-16 cursor-pointer rounded border border-neutral-700 bg-neutral-900 p-1" />
            <input className="input" value={form.widget_color} onChange={(e) => update('widget_color', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">AI instructions (system prompt)</label>
          <textarea className="input min-h-28 resize-y" value={form.system_prompt} onChange={(e) => update('system_prompt', e.target.value)} rows={4} />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary gap-2">
            <Save size={14} />
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          {saveMsg && <span className="text-sm text-lime-400">{saveMsg}</span>}
        </div>
      </form>

      {/* Crawler */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3">
          <Globe size={16} className="text-lime-400" />
          <h2 className="font-semibold text-white">Train on a URL</h2>
        </div>

        <form onSubmit={crawl} className="flex items-center gap-3">
          <input
            className="input flex-1"
            type="url"
            placeholder="https://yourwebsite.com/faq"
            value={crawlUrl}
            onChange={(e) => setCrawlUrl(e.target.value)}
            required
          />
          <button type="submit" disabled={crawling} className="btn-primary gap-2 whitespace-nowrap">
            {crawling ? <><Loader2 size={14} className="animate-spin" />Crawling...</> : <><Globe size={14} />Crawl URL</>}
          </button>
        </form>

        {crawlResult && (
          <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${crawlResult.success ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
            {crawlResult.success ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {crawlResult.message}
          </div>
        )}

        {localSources.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <p className="text-xs text-neutral-500 uppercase tracking-widest">Knowledge sources ({localSources.length})</p>
            {localSources.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <Globe size={12} className="flex-shrink-0 text-neutral-500" />
                  <span className="text-xs text-neutral-300 truncate">{s.url || s.filename}</span>
                </div>
                <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                  {s.chunk_count > 0 && <span className="text-xs text-neutral-500">{s.chunk_count} chunks</span>}
                  <span className={`text-xs font-medium capitalize ${statusColor[s.status]}`}>{s.status}</span>
                  <button onClick={() => deleteSource(s.id)} className="text-neutral-600 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
