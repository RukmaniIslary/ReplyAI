'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-24 text-center px-6">
      <p className="text-5xl font-bold text-lime-400">Error</p>
      <h2 className="mt-4 text-xl font-semibold text-white">Something went wrong</h2>
      <p className="mt-2 text-sm text-neutral-400 max-w-sm">
        {error?.message || 'An unexpected error occurred.'}
      </p>
      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg bg-lime-400 px-6 py-2.5 text-sm font-semibold text-black hover:bg-lime-300 transition-colors"
        >
          Try again
        </button>
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg border border-neutral-700 px-6 py-2.5 text-sm font-semibold text-white hover:border-lime-400 transition-colors"
        >
          Back to dashboard
        </a>
      </div>
    </div>
  )
}
