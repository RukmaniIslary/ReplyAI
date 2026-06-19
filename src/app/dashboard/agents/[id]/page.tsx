import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Code2 } from 'lucide-react'
import { AgentConfigClient } from '@/components/dashboard/AgentConfigClient'

export default async function AgentDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: agent } = await supabase
    .from('agents')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user!.id)
    .single()

  if (!agent) notFound()

  const { data: sources } = await supabase
    .from('sources')
    .select('*')
    .eq('agent_id', agent.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/agents" className="text-neutral-400 hover:text-white">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
          <p className="text-sm text-neutral-400">Configure your AI agent.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/agents/${agent.id}/embed`} className="btn-secondary gap-2 text-sm py-2">
            <Code2 size={14} />
            Get embed code
          </Link>
        </div>
      </div>

      <AgentConfigClient agent={agent} sources={sources || []} />
    </div>
  )
}
