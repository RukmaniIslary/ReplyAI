import { Bell } from 'lucide-react'
import type { Profile } from '@/lib/types'

export function DashboardHeader({ profile }: { profile: Profile | null }) {
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : profile?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-800 bg-black px-6">
      <div>
        <span className="text-sm text-neutral-400">
          {profile?.plan ? (
            <span className="badge-lime capitalize">{profile.plan} plan</span>
          ) : null}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-400/20 text-xs font-bold text-lime-400">
          {initials}
        </div>
      </div>
    </header>
  )
}
