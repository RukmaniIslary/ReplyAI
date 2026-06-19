'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewAgentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    welcome_message: 'Hi! How can I help you today?',
    system_prompt: 'You are a helpful customer support agent. Answer questions based on the provided knowledge base. If you cannot find the answer, politely say so and offer to escalate.',
    widget_color: '#a3e635',
    escalation_email: '',
  })

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Session expired. Please sign in again.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.from('agents').insert({
      user_id: user.id,
      ...form,
      is_active: true,
    }).select().single()

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(`/dashboard/agents/${data.id}`)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/agents" className="text-neutral-400 hover:text-white">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">New agent</h1>
          <p className="text-sm text-neutral-400">Configure your AI support agent.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="card space-y-5">
          <h2 className="font-semibold text-white">Basic settings</h2>

          <div>
            <label className="label">Agent name</label>
            <input className="input" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Support Bot" required />
          </div>

          <div>
            <label className="label">Welcome message</label>
            <input className="input" value={form.welcome_message} onChange={(e) => update('welcome_message', e.target.value)} placeholder="Hi! How can I help you today?" required />
          </div>

          <div>
            <label className="label">Escalation email</label>
            <input className="input" type="email" value={form.escalation_email} onChange={(e) => update('escalation_email', e.target.value)} placeholder="support@yourcompany.com" />
            <p className="mt-1 text-xs text-neutral-500">When the AI cannot answer, it will offer to email this address.</p>
          </div>

          <div>
            <label className="label">Widget color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.widget_color}
                onChange={(e) => update('widget_color', e.target.value)}
                className="h-10 w-16 cursor-pointer rounded border border-neutral-700 bg-neutral-900 p-1"
              />
              <input className="input" value={form.widget_color} onChange={(e) => update('widget_color', e.target.value)} placeholder="#a3e635" />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-white">AI instructions</h2>
          <div>
            <label className="label">System prompt</label>
            <textarea
              className="input min-h-32 resize-y"
              value={form.system_prompt}
              onChange={(e) => update('system_prompt', e.target.value)}
              rows={5}
            />
            <p className="mt-1 text-xs text-neutral-500">Instructions that shape how your agent responds.</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link href="/dashboard/agents" className="btn-secondary">Cancel</Link>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create agent'}
          </button>
        </div>
      </form>
    </div>
  )
}
