import { createClient } from '@/lib/supabase/server'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default async function ConversationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: agents } = await supabase.from('agents').select('id').eq('user_id', user!.id)
  const agentIds = agents?.map((a) => a.id) || []

  const { data: conversations } = agentIds.length
    ? await supabase
        .from('conversations')
        .select('*, agents(name)')
        .in('agent_id', agentIds)
        .order('created_at', { ascending: false })
        .limit(50)
    : { data: [] }

  const statusColors: Record<string, string> = {
    open: 'badge-lime',
    resolved: 'badge-green',
    escalated: 'badge-red',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Conversations</h1>
        <p className="mt-1 text-sm text-neutral-400">
          All customer conversations across your agents.
        </p>
      </div>

      {conversations && conversations.length > 0 ? (
        <div className="space-y-2">
          {conversations.map((conv: { id: string; page_url?: string; created_at: string; status: string; agents?: { name: string } }) => (
            <Link
              key={conv.id}
              href={`/dashboard/conversations/${conv.id}`}
              className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950 px-5 py-4 transition-colors hover:border-neutral-700 hover:bg-neutral-900/50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <MessageSquare size={15} className="flex-shrink-0 text-neutral-500" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {conv.page_url || 'Unknown page'}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {conv.agents?.name} &middot; {new Date(conv.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={statusColors[conv.status] || 'badge-lime'}>
                {conv.status}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-800 py-20 text-center">
          <MessageSquare size={40} className="mb-4 text-neutral-700" />
          <h2 className="text-lg font-semibold text-white">No conversations yet</h2>
          <p className="mt-1 text-sm text-neutral-500">Once customers chat with your agent, conversations will appear here.</p>
        </div>
      )}
    </div>
  )
}
