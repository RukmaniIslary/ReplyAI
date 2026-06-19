import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Code2 } from 'lucide-react'
import { EmbedCopyButton } from '@/components/dashboard/EmbedCopyButton'

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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://raysef.io'
  const embedCode = `<script src="${appUrl}/api/widget/${agent.id}" async></script>`

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/agents/${agent.id}`} className="text-neutral-400 hover:text-white">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Embed widget</h1>
          <p className="text-sm text-neutral-400">Add {agent.name} to your website.</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Code2 size={16} className="text-lime-400" />
          <h2 className="font-semibold text-white">Your embed code</h2>
        </div>
        <p className="text-sm text-neutral-400 mb-4">
          Paste this one line of code before the closing <code className="text-lime-400">&lt;/body&gt;</code> tag on your website.
        </p>

        <div className="rounded-lg bg-neutral-900 border border-neutral-700 p-4 font-mono text-sm text-lime-400 break-all">
          {embedCode}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <EmbedCopyButton code={embedCode} />
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-white mb-3">Platform guides</h2>
        <div className="space-y-3 text-sm text-neutral-400">
          <div>
            <p className="font-medium text-white">Shopify</p>
            <p>Go to Online Store &rarr; Themes &rarr; Edit code &rarr; layout/theme.liquid. Paste before <code>&lt;/body&gt;</code>.</p>
          </div>
          <div>
            <p className="font-medium text-white">WordPress</p>
            <p>Use a plugin like &ldquo;Insert Headers and Footers&rdquo; and paste in the footer section.</p>
          </div>
          <div>
            <p className="font-medium text-white">Webflow</p>
            <p>Go to Project Settings &rarr; Custom Code &rarr; Footer Code. Paste the script.</p>
          </div>
          <div>
            <p className="font-medium text-white">Any HTML site</p>
            <p>Paste the script tag anywhere inside your HTML before the closing body tag.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
