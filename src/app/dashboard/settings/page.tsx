import { createClient } from '@/lib/supabase/server'
import { SettingsClient } from '@/components/dashboard/SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-neutral-400">Manage your account settings.</p>
      </div>
      <SettingsClient profile={profile} userEmail={user!.email!} />
    </div>
  )
}
