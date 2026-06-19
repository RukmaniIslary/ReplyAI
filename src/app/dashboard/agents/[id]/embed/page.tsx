import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { EmbedPageClient } from '@/components/dashboard/EmbedPageClient'

export default async function EmbedPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: agent } = await supabase
    .from('agents')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user!.id)
    .single()

  if (!agent) notFound()

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://raysef.com').replace(/\/$/, '')
  const embedCode = `<script src="${appUrl}/api/widget/${agent.id}" async></script>`

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/agents/${agent.id}`} className="text-neutral-400 hover:text-white">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Embed code</h1>
          <p className="text-sm text-neutral-400">{agent.name} — copy one line, paste anywhere</p>
        </div>
      </div>

      <EmbedPageClient agent={agent} embedCode={embedCode} appUrl={appUrl} />
    </div>
  )
}
