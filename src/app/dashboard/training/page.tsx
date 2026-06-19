import { createClient } from '@/lib/supabase/server'
import { TrainingClient } from '@/components/dashboard/TrainingClient'

export default async function TrainingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: agents } = await supabase.from('agents').select('id, name').eq('user_id', user!.id)
  const agentIds = agents?.map((a) => a.id) || []
  const { data: sources } = agentIds.length
    ? await supabase.from('sources').select('*').in('agent_id', agentIds).order('created_at', { ascending: false })
    : { data: [] }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Training</h1>
        <p className="mt-1 text-sm text-neutral-400">Add URLs and documents to train your AI agents.</p>
      </div>
      <TrainingClient agents={agents || []} sources={sources || []} />
    </div>
  )
}
