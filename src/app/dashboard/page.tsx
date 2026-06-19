import { createClient } from '@/lib/supabase/server'
import { MessageSquare, Bot, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
  const { data: agents } = await supabase.from('agents').select('*').eq('user_id', user!.id)
  const agentIds = agents?.map((a: { id: string }) => a.id) || []
  const { count: conversationCount } = agentIds.length
    ? await supabase.from('conversations').select('*', { count: 'exact', head: true }).in('agent_id', agentIds)
    : { count: 0 }

  const stats = [
    {
      label: 'Conversations this month',
      value: profile?.conversations_used ?? 0,
      sub: `of ${profile?.conversations_limit === -1 ? 'Unlimited' : profile?.conversations_limit ?? 500}`,
      icon: MessageSquare,
    },
    {
      label: 'Active agents',
      value: agents?.length ?? 0,
      sub: 'deployed',
      icon: Bot,
    },
    {
      label: 'Total conversations',
      value: conversationCount ?? 0,
      sub: 'all time',
      icon: TrendingUp,
    },
    {
      label: 'Avg. response time',
      value: '< 2s',
      sub: 'AI response',
      icon: Clock,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Welcome back, {profile?.full_name?.split(' ')[0] ?? 'there'}.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-500">{stat.label}</p>
              <stat.icon size={14} className="text-neutral-600" />
            </div>
            <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
            <p className="mt-1 text-xs text-neutral-500">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-sm font-semibold text-white">Quick actions</h2>
          <div className="space-y-2">
            <Link href="/dashboard/agents/new" className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-300 transition-colors hover:border-lime-400/30 hover:text-white">
              <span>Create a new agent</span>
              <span className="text-lime-400">+</span>
            </Link>
            <Link href="/dashboard/training" className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-300 transition-colors hover:border-lime-400/30 hover:text-white">
              <span>Train on a URL</span>
              <span className="text-lime-400">+</span>
            </Link>
            <Link href="/dashboard/billing" className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-300 transition-colors hover:border-lime-400/30 hover:text-white">
              <span>Manage subscription</span>
              <span className="text-neutral-500">→</span>
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 text-sm font-semibold text-white">Your agents</h2>
          {agents && agents.length > 0 ? (
            <ul className="space-y-2">
              {agents.slice(0, 4).map((agent: { id: string; name: string; widget_color?: string }) => (
                <li key={agent.id}>
                  <Link href={`/dashboard/agents/${agent.id}`} className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 transition-colors hover:border-lime-400/30">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: agent.widget_color || '#a3e635' }}
                    />
                    <span className="flex-1 text-sm text-neutral-300">{agent.name}</span>
                    <span className="badge-green text-xs">Active</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-800 py-8 text-center">
              <Bot size={24} className="mb-2 text-neutral-600" />
              <p className="text-sm text-neutral-500">No agents yet</p>
              <Link href="/dashboard/agents/new" className="mt-3 text-sm text-lime-400 hover:underline">
                Create your first agent
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
