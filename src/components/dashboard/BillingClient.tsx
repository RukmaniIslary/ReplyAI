'use client'

import { useState, useEffect } from 'react'
import { CreditCard, ExternalLink, CheckCircle } from 'lucide-react'
import type { Profile } from '@/lib/types'

declare global {
  interface Window {
    Paddle: {
      Environment: { set: (env: string) => void }
      Setup: (config: { token: string }) => void
      Checkout: {
        open: (config: {
          items: { priceId: string; quantity: number }[]
          customData: Record<string, string>
          customer?: { email: string }
          settings?: Record<string, string>
        }) => void
      }
    }
  }
}

const PLAN_NAMES: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  growth: 'Growth',
  pro: 'Pro',
}

const PLANS = [
  {
    key: 'starter',
    name: 'Starter',
    price: 29,
    priceId: process.env.NEXT_PUBLIC_PADDLE_STARTER_PRICE_ID,
    features: ['500 conversations/month', '1 AI agent', 'Website crawler', 'Email escalation'],
  },
  {
    key: 'growth',
    name: 'Growth',
    price: 79,
    priceId: process.env.NEXT_PUBLIC_PADDLE_GROWTH_PRICE_ID,
    features: ['5,000 conversations/month', '5 AI agents', 'Remove branding', 'Analytics'],
    popular: true,
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 149,
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID,
    features: ['Unlimited conversations', 'Unlimited agents', 'Full white-label', 'API access'],
  },
]

export function BillingClient({ profile, userEmail }: { profile: Profile | null; userEmail?: string }) {
  const [paddleReady, setPaddleReady] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [successPlan, setSuccessPlan] = useState<string | null>(null)

  useEffect(() => {
    // Load Paddle.js v2
    if (document.getElementById('paddle-js')) { setPaddleReady(true); return }

    const script = document.createElement('script')
    script.id = 'paddle-js'
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'
    script.async = true
    script.onload = () => {
      if (window.Paddle) {
        const env = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox'
        if (env !== 'production') {
          window.Paddle.Environment.set('sandbox')
        }
        window.Paddle.Setup({
          token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '',
        })
        setPaddleReady(true)
      }
    }
    document.head.appendChild(script)
  }, [])

  function openCheckout(planKey: string, priceId?: string) {
    if (!paddleReady || !priceId) {
      alert('Payment system loading. Please try again in a moment.')
      return
    }
    setLoading(planKey)

    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customData: {
        supabase_user_id: profile?.id || '',
        plan: planKey,
      },
      ...(userEmail ? { customer: { email: userEmail } } : {}),
      settings: {
        displayMode: 'overlay',
        theme: 'dark',
        successUrl: `${window.location.origin}/dashboard/billing?success=true`,
      },
    })

    setLoading(null)
    setSuccessPlan(planKey)
  }

  async function openPortal() {
    setPortalLoading(true)
    const res = await fetch('/api/paddle/portal', { method: 'POST' })
    const { url, error } = await res.json()
    if (error) {
      alert('Could not open billing portal: ' + error)
      setPortalLoading(false)
      return
    }
    window.location.href = url
  }

  const plan = profile?.plan || 'free'
  const hasSub = !!(profile as Profile & { paddle_customer_id?: string })?.paddle_customer_id

  return (
    <div className="space-y-6">
      {/* Success banner */}
      {successPlan && (
        <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4">
          <CheckCircle size={18} className="text-green-400" />
          <p className="text-sm text-green-300">
            Checkout opened. Complete payment to activate your plan.
          </p>
        </div>
      )}

      {/* Current plan card */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Current plan</p>
            <h2 className="text-2xl font-bold text-white">{PLAN_NAMES[plan]}</h2>
            <p className="mt-1.5 text-sm text-neutral-400">
              {profile?.conversations_used ?? 0} of{' '}
              {profile?.conversations_limit === -1 ? 'unlimited' : (profile?.conversations_limit ?? 0)}{' '}
              conversations used this month
            </p>
            {profile?.subscription_status && (
              <span className={`mt-2 inline-block ${
                profile.subscription_status === 'active' || profile.subscription_status === 'trialing'
                  ? 'badge-green' : 'badge-red'
              }`}>
                {profile.subscription_status}
              </span>
            )}
          </div>
          <CreditCard size={22} className="text-neutral-600" />
        </div>

        {hasSub && (
          <div className="mt-5">
            <button onClick={openPortal} disabled={portalLoading} className="btn-secondary gap-2">
              <ExternalLink size={14} />
              {portalLoading ? 'Opening...' : 'Manage billing'}
            </button>
            <p className="mt-1.5 text-xs text-neutral-500">Update card, invoices, cancel — all via Paddle.</p>
          </div>
        )}
      </div>

      {/* Plan selection */}
      <div>
        <h3 className="mb-4 font-semibold text-white">
          {hasSub ? 'Change plan' : 'Choose a plan'}
        </h3>

        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.key}
              className={`relative flex flex-col rounded-xl border p-5 transition-all ${
                plan === p.key
                  ? 'border-lime-400 bg-lime-400/5'
                  : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-lime-400 px-3 py-0.5 text-xs font-bold text-black">
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <p className="font-semibold text-white">{p.name}</p>
                <p className="mt-1 text-3xl font-bold text-white">
                  ${p.price}<span className="text-sm font-normal text-neutral-400">/mo</span>
                </p>
              </div>

              <ul className="mb-5 flex-1 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-neutral-400">
                    <span className="text-lime-400">✓</span> {f}
                  </li>
                ))}
              </ul>

              {plan === p.key ? (
                <div className="rounded-lg bg-lime-400/10 py-2 text-center text-xs font-medium text-lime-400">
                  Current plan
                </div>
              ) : (
                <button
                  onClick={() => openCheckout(p.key, p.priceId)}
                  disabled={loading === p.key || !paddleReady}
                  className={p.popular ? 'btn-primary w-full text-sm py-2.5' : 'btn-secondary w-full text-sm py-2.5'}
                >
                  {loading === p.key ? 'Opening...' : !paddleReady ? 'Loading...' : hasSub ? `Switch to ${p.name}` : `Start free trial`}
                </button>
              )}
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-neutral-600">
          14-day free trial on all plans. Payments by{' '}
          <a href="https://paddle.com" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white">
            Paddle
          </a>{' '}
          — tax &amp; VAT handled automatically.
        </p>
      </div>
    </div>
  )
}
