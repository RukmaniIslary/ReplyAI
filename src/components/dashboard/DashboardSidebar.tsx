'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  BookOpen,
  CreditCard,
  Settings,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/agents', icon: Bot, label: 'Agents' },
  { href: '/dashboard/conversations', icon: MessageSquare, label: 'Conversations' },
  { href: '/dashboard/training', icon: BookOpen, label: 'Training' },
  { href: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside className="hidden w-60 flex-shrink-0 flex-col border-r border-neutral-800 bg-black md:flex">
      <div className="flex h-16 items-center border-b border-neutral-800 px-6">
        <Link href="/" className="text-lg font-bold">
          Ray<span className="text-lime-400">sef</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                active
                  ? 'bg-lime-400/10 text-lime-400'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-neutral-800 p-3">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
