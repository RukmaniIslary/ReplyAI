import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center">
      <p className="text-6xl font-bold text-lime-400">Oops</p>
      <h1 className="mt-4 text-2xl font-semibold text-white">Confirmation link expired</h1>
      <p className="mt-2 text-neutral-400 max-w-sm">
        This link has expired or already been used. Sign up again to get a new one.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/signup" className="btn-primary">Sign up again</Link>
        <Link href="/login" className="btn-secondary">Sign in</Link>
      </div>
    </div>
  )
}
