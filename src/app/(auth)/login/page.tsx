'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(next)
      router.refresh()
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (!email) { setError('Enter your email above first.'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?type=recovery`,
    })
    setLoading(false)
    if (error) { setError(error.message) } else { setResetSent(true) }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold">
            Ray<span className="text-lime-400">sef</span>
          </Link>
          <h1 className="mt-6 text-2xl font-semibold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-neutral-400">Sign in to your account</p>
        </div>

        {resetSent ? (
          <div className="rounded-lg border border-lime-400/30 bg-lime-400/10 px-4 py-4 text-sm text-lime-400 text-center">
            Password reset email sent. Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" className="input" placeholder="you@company.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0" htmlFor="password">Password</label>
                <button type="button" onClick={handleReset}
                  className="text-xs text-neutral-500 hover:text-lime-400 transition-colors">
                  Forgot password?
                </button>
              </div>
              <input id="password" type="password" className="input" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-neutral-500">
          No account?{' '}
          <Link href="/signup" className="text-lime-400 hover:underline">Start free trial</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-black" />}>
      <LoginForm />
    </Suspense>
  )
}
