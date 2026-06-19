'use client'

import { useEffect } from 'react'

export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          background: '#000000',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          padding: '24px',
        }}
      >
        <p style={{ fontSize: '5rem', fontWeight: 700, color: '#a3e635', margin: 0, lineHeight: 1 }}>
          500
        </p>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '16px' }}>
          Critical error
        </h1>
        <p style={{ color: '#737373', marginTop: '8px', maxWidth: '360px', lineHeight: 1.6 }}>
          A critical error occurred. Please refresh the page.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: '32px',
            background: '#a3e635',
            color: '#000000',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 32px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Refresh page
        </button>
      </body>
    </html>
  )
}
