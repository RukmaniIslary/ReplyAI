import { createClient } from '@/lib/supabase/server'
import { BillingClient } from '@/components/dashboard/BillingClient'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="mt-1 text-sm text-neutral-400">Manage your subscription and payment method.</p>
      </div>
      <BillingClient profile={profile} />
    </div>
  )
}
