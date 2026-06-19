import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CTA() {
  return (
    <section className="bg-neutral-950 py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-4xl font-bold text-white md:text-5xl">
          Stop answering the same questions.{' '}
          <span className="text-lime-400">Let Raysef handle it.</span>
        </h2>
        <p className="mt-6 text-lg text-neutral-400">
          14-day free trial. Live in 10 minutes. No engineers required.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/signup" className="btn-primary text-base px-10 py-4 gap-2">
            Start free trial
            <ArrowRight size={16} />
          </Link>
          <Link href="/pricing" className="btn-ghost text-base">
            See pricing
          </Link>
        </div>
        <p className="mt-5 text-sm text-neutral-600">
          No charge until day 15. Cancel anytime.
        </p>
      </div>
    </section>
  )
}
