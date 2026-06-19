'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User, Lock, Trash2, LogOut } from 'lucide-react'
import type { Profile } from '@/lib/types'

export function SettingsClient({ profile, userEmail }: { profile: Profile | null; userEmail: string }) {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState(profile?.full_name || '')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [nameMsg, setNameMsg] = useState('')
  const [passMsg, setPassMsg] = useState('')

  async function updateName(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setNameMsg('')
    const { error } = await supabase.auth.updateUser({ data: { full_name: name } })
    if (!error) {
      await supabase.from('profiles').update({ full_name: name }).eq('id', profile!.id)
      setNameMsg('Name updated.')
    } else {
      setNameMsg(error.message)
    }
    setSaving(false)
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault()
    setSavingPassword(true)
    setPassMsg('')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (!error) {
      setPassMsg('Password updated.')
      setNewPassword('')
    } else {
      setPassMsg(error.message)
    }
    setSavingPassword(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Profile */}
      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <User size={16} className="text-lime-400" />
          <h2 className="font-semibold text-white">Profile</h2>
        </div>
        <form onSubmit={updateName} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" value={userEmail} disabled readOnly />
            <p className="mt-1 text-xs text-neutral-500">Email cannot be changed.</p>
          </div>
          {nameMsg && <p className="text-sm text-lime-400">{nameMsg}</p>}
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <Lock size={16} className="text-lime-400" />
          <h2 className="font-semibold text-white">Password</h2>
        </div>
        <form onSubmit={updatePassword} className="space-y-4">
          <div>
            <label className="label">New password</label>
            <input
              className="input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
              minLength={8}
              required
            />
          </div>
          {passMsg && <p className="text-sm text-lime-400">{passMsg}</p>}
          <button type="submit" disabled={savingPassword} className="btn-primary">
            {savingPassword ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="card border-red-500/20">
        <div className="flex items-center gap-3 mb-5">
          <Trash2 size={16} className="text-red-400" />
          <h2 className="font-semibold text-white">Danger zone</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">Sign out</p>
              <p className="text-xs text-neutral-500">Sign out of your account on this device.</p>
            </div>
            <button onClick={signOut} className="btn-secondary gap-2 text-sm py-2">
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
