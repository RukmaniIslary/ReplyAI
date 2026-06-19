'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isDisposableEmail } from '@/lib/utils'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Layer 02: Disposable email check (client-side fast fail)
    if (isDisposableEmail(email)) {
      setError('Please use a valid business email address.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Redirect to Stripe checkout for trial
      router.push('/dashboard/billing/checkout?plan=starter')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold">
            Ray<span className="text-lime-400">sef</span>
          </Link>
          <h1 className="mt-6 text-2xl font-semibold text-white">Start your free trial</h1>
          <p className="mt-1 text-sm text-neutral-400">14 days free. Card required. Cancel anytime.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="label" htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              className="input"
              placeholder="Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div>
            <label className="label" htmlFor="email">Work email</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-center text-xs text-neutral-500">
            By signing up you agree to our{' '}
            <Link href="/terms" className="text-neutral-400 hover:text-white">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-neutral-400 hover:text-white">Privacy Policy</Link>
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <Link href="/login" className="text-lime-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
