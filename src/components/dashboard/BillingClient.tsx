'use client'

import { useState, useEffect } from 'react'
import { CreditCard, ExternalLink, Zap } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { PLANS } from '@/lib/paddle'

declare global {
  interface Window {
    Paddle: {
      Setup: (config: { token: string | undefined }) => void
      Checkout: {
        open: (config: {
          transactionId: string
          settings: { displayMode: string; theme: string; successUrl: string }
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

export function BillingClient({ profile }: { profile: Profile | null }) {
  const [loading, setLoading] = useState(false)

  // Load Paddle.js
  useEffect(() => {
    const script = document.createElement('script')
    script.src = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production'
      ? 'https://cdn.paddle.com/paddle/v2/paddle.js'
      : 'https://sandbox-cdn.paddle.com/paddle/v2/paddle.js'
    script.async = true
    script.onload = () => {
      if (window.Paddle) {
        window.Paddle.Setup({
          token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        })
      }
    }
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  async function openCheckout(plan: string) {
    setLoading(true)
    const res = await fetch('/api/paddle/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const { transactionId, error } = await res.json()
    if (error) { alert(error); setLoading(false); return }

    // Open Paddle overlay checkout
    window.Paddle.Checkout.open({
      transactionId,
      settings: {
        displayMode: 'overlay',
        theme: 'dark',
        successUrl: `${window.location.origin}/dashboard?checkout=success`,
      },
    })
    setLoading(false)
  }

  async function openPortal() {
    setLoading(true)
    const res = await fetch('/api/paddle/portal', { method: 'POST' })
    const { url, error } = await res.json()
    if (error) { alert(error); setLoading(false); return }
    window.location.href = url
  }

  const plan = profile?.plan || 'free'
  const planInfo = PLANS[plan as keyof typeof PLANS]

  return (
    <div className="space-y-5">
      {/* Current plan */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Current plan</p>
            <h2 className="text-2xl font-bold text-white capitalize">{PLAN_NAMES[plan]}</h2>
            {planInfo && (
              <p className="mt-1 text-sm text-neutral-400">
                ${planInfo.price}/month &middot; {profile?.conversations_used ?? 0} of{' '}
                {profile?.conversations_limit === -1 ? 'unlimited' : profile?.conversations_limit ?? 0} conversations used
              </p>
            )}
            {profile?.subscription_status && (
              <p className="mt-2">
                <span className={`${profile.subscription_status === 'active' || profile.subscription_status === 'trialing' ? 'badge-green' : 'badge-red'}`}>
                  {profile.subscription_status}
                </span>
              </p>
            )}
          </div>
          <CreditCard size={24} className="text-neutral-600" />
        </div>

        {(profile as Profile & { paddle_customer_id?: string })?.paddle_customer_id ? (
          <div className="mt-6">
            <button onClick={openPortal} disabled={loading} className="btn-secondary gap-2">
              <ExternalLink size={14} />
              {loading ? 'Opening...' : 'Manage subscription'}
            </button>
            <p className="mt-2 text-xs text-neutral-500">Update payment method, view invoices, or cancel.</p>
          </div>
        ) : (
          <div className="mt-6">
            <p className="mb-3 text-sm text-neutral-400">Start your 14-day free trial to unlock full access.</p>
            <button onClick={() => openCheckout('starter')} disabled={loading} className="btn-primary gap-2">
              <Zap size={14} />
              {loading ? 'Loading...' : 'Start free trial'}
            </button>
          </div>
        )}
      </div>

      {/* Upgrade options */}
      {plan !== 'pro' && (
        <div className="card">
          <h3 className="mb-4 font-semibold text-white">Upgrade your plan</h3>
          <div className="grid gap-3 md:grid-cols-3">
            {Object.entries(PLANS).map(([key, p]) => (
              <div key={key} className={`rounded-lg border p-4 ${plan === key ? 'border-lime-400/40 bg-lime-400/5' : 'border-neutral-800 bg-neutral-900'}`}>
                <p className="font-semibold text-white capitalize">{key}</p>
                <p className="text-2xl font-bold text-white mt-1">
                  ${p.price}<span className="text-sm font-normal text-neutral-400">/mo</span>
                </p>
                {plan !== key && (
                  <button
                    onClick={() => openCheckout(key)}
                    disabled={loading}
                    className="mt-3 btn-secondary w-full text-xs py-2"
                  >
                    {loading ? '...' : `Switch to ${key}`}
                  </button>
                )}
                {plan === key && <p className="mt-3 text-xs text-lime-400">Current plan</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-neutral-600">
        Payments processed by <a href="https://paddle.com" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white">Paddle</a> — Merchant of Record. Tax &amp; VAT handled automatically.
      </p>
    </div>
  )
}
