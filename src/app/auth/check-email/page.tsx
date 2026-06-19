import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-lime-400/10 mb-6">
        <Mail size={28} className="text-lime-400" />
      </div>
      <h1 className="text-2xl font-bold text-white">Check your email</h1>
      <p className="mt-3 text-neutral-400 max-w-sm leading-relaxed">
        We sent a confirmation link to your email address. Click it to activate your account and continue to your dashboard.
      </p>
      <p className="mt-6 text-sm text-neutral-500">
        Wrong email?{' '}
        <Link href="/signup" className="text-lime-400 hover:underline">
          Sign up again
        </Link>
      </p>
    </div>
  )
}
