import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Bot, Plus, Code2 } from 'lucide-react'

export default async function AgentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: agents } = await supabase.from('agents').select('*').eq('user_id', user!.id).order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agents</h1>
          <p className="mt-1 text-sm text-neutral-400">Manage your AI support agents.</p>
        </div>
        <Link href="/dashboard/agents/new" className="btn-primary">
          <Plus size={16} />
          New agent
        </Link>
      </div>

      {agents && agents.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <div key={agent.id} className="card flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${agent.widget_color}20` }}
                  >
                    <Bot size={18} style={{ color: agent.widget_color || '#a3e635' }} />
                  </div>
                  <div>
                    <p className="font-medium text-white">{agent.name}</p>
                    <p className="text-xs text-neutral-500">Created {new Date(agent.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="badge-green">Active</span>
              </div>

              <p className="text-sm text-neutral-400 line-clamp-2">{agent.welcome_message}</p>

              <div className="flex items-center gap-2">
                <Link href={`/dashboard/agents/${agent.id}`} className="btn-secondary flex-1 text-center text-xs py-2 px-3">
                  Configure
                </Link>
                <Link href={`/dashboard/agents/${agent.id}/embed`} className="btn-ghost text-xs gap-1.5 border border-neutral-800 rounded-lg px-3 py-2">
                  <Code2 size={12} />
                  Embed
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-800 py-20 text-center">
          <Bot size={40} className="mb-4 text-neutral-700" />
          <h2 className="text-lg font-semibold text-white">No agents yet</h2>
          <p className="mt-1 text-sm text-neutral-500">Create your first AI support agent to get started.</p>
          <Link href="/dashboard/agents/new" className="btn-primary mt-6">
            <Plus size={16} />
            Create agent
          </Link>
        </div>
      )}
    </div>
  )
}
