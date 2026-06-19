import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Bot, Plus, Code2, Settings } from 'lucide-react'

export default async function AgentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: agents } = await supabase
    .from('agents')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agents</h1>
          <p className="mt-1 text-sm text-neutral-400">Create an agent, train it, then paste one line of code on your website.</p>
        </div>
        <Link href="/dashboard/agents/new" className="btn-primary">
          <Plus size={16} />
          New agent
        </Link>
      </div>

      {agents && agents.length > 0 ? (
        <div className="space-y-4">
          {agents.map((agent) => (
            <div key={agent.id} className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${agent.widget_color}20` }}
                  >
                    <Bot size={18} style={{ color: agent.widget_color || '#a3e635' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{agent.name}</p>
                    <p className="text-xs text-neutral-500 truncate">{agent.welcome_message}</p>
                  </div>
                </div>
                <span className="badge-green flex-shrink-0">Active</span>
              </div>

              {/* Action buttons — embed is primary */}
              <div className="mt-4 flex items-center gap-3">
                <Link
                  href={`/dashboard/agents/${agent.id}/embed`}
                  className="btn-primary flex-1 text-center gap-2 py-2.5"
                >
                  <Code2 size={14} />
                  Get embed code
                </Link>
                <Link
                  href={`/dashboard/agents/${agent.id}`}
                  className="btn-secondary gap-2 py-2.5 px-4"
                >
                  <Settings size={14} />
                  Configure
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-800 py-20 text-center">
          <Bot size={40} className="mb-4 text-neutral-700" />
          <h2 className="text-lg font-semibold text-white">No agents yet</h2>
          <p className="mt-1 text-sm text-neutral-500 max-w-xs">
            Create your first AI agent, train it on your website, then paste one line of code to go live.
          </p>
          <Link href="/dashboard/agents/new" className="btn-primary mt-6">
            <Plus size={16} />
            Create your first agent
          </Link>
        </div>
      )}
    </div>
  )
}
