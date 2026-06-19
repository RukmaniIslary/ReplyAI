import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-black pt-20 pb-24 md:pt-28 md:pb-32">
      {/* Lime glow background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-lime-400/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/4 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-lime-400/3 blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/5 px-4 py-1.5 text-xs font-medium text-lime-400">
          <Zap size={12} className="fill-lime-400" />
          Live in under 10 minutes
        </div>

        {/* Headline */}
        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl">
          Your AI support agent.{' '}
          <span className="text-lime-400">Live in 10 minutes.</span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mb-10 max-w-2xl text-lg text-neutral-400 md:text-xl">
          Train an AI on your website in one click. It answers customer questions 24/7 —
          so you can stop repeating yourself and focus on what matters.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/signup" className="btn-primary text-base px-8 py-3.5 gap-2">
            Start free trial
            <ArrowRight size={16} />
          </Link>
          <Link href="/#how-it-works" className="btn-secondary text-base px-8 py-3.5">
            See how it works
          </Link>
        </div>

        <p className="mt-5 text-sm text-neutral-500">
          14-day free trial. Card required. Cancel anytime.
        </p>

        {/* Dashboard preview */}
        <div className="mt-16">
          <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl shadow-lime-400/5">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-neutral-800 bg-neutral-900 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-lime-400/60" />
              <div className="ml-4 flex-1 rounded-md bg-neutral-800 px-3 py-1 text-center text-xs text-neutral-500">
                raysef.io/dashboard
              </div>
            </div>

            {/* Mock dashboard */}
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="h-4 w-32 rounded bg-neutral-800" />
                  <div className="mt-1.5 h-3 w-20 rounded bg-neutral-800/60" />
                </div>
                <div className="h-8 w-28 rounded-lg border border-lime-400/30 bg-lime-400/20" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {['Conversations', 'Resolved', 'Avg. Response'].map((label, i) => (
                  <div key={label} className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
                    <div className="mb-2 h-3 w-20 rounded bg-neutral-700" />
                    <div
                      className="h-7 w-14 rounded"
                      style={{ backgroundColor: `rgba(163,230,53,${0.15 + i * 0.1})` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900/30 p-3">
                    <div className="h-8 w-8 rounded-full bg-lime-400/20" />
                    <div className="flex-1">
                      <div className="h-3 w-40 rounded bg-neutral-700" />
                      <div className="mt-1 h-2.5 w-28 rounded bg-neutral-800" />
                    </div>
                    <span className="badge-green">Resolved</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
