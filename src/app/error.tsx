'use client'

import { useEffect } from 'react'

export default function Error({
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center">
      <p className="text-7xl font-bold text-lime-400">500</p>
      <h1 className="mt-4 text-2xl font-semibold text-white">Something went wrong</h1>
      <p className="mt-2 text-neutral-400 max-w-sm">
        An unexpected error occurred. Try again or return to the homepage.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg bg-lime-400 px-6 py-3 text-sm font-semibold text-black hover:bg-lime-300 transition-colors"
        >
          Try again
        </button>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-neutral-700 px-6 py-3 text-sm font-semibold text-white hover:border-lime-400 transition-colors"
        >
          Go home
        </a>
      </div>
    </div>
  )
}
