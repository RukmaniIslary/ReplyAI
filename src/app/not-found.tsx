import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-center px-6">
      <p className="text-8xl font-bold text-lime-400">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-white">Page not found</h1>
      <p className="mt-2 text-neutral-400">This page does not exist.</p>
      <Link href="/" className="btn-primary mt-8">
        Go home
      </Link>
    </div>
  )
}
