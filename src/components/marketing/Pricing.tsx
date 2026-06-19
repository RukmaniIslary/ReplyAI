import Link from 'next/link'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: 29,
    description: 'For small businesses getting started.',
    features: [
      '500 conversations/month',
      '1 AI agent',
      'Website crawler',
      'PDF upload',
      'Email escalation',
      'Widget customization',
      'Standard support',
    ],
    cta: 'Start free trial',
    highlight: false,
  },
  {
    name: 'Growth',
    price: 79,
    description: 'For growing teams that need more.',
    features: [
      '5,000 conversations/month',
      '5 AI agents',
      'Website + sitemap crawl',
      'PDF and doc upload',
      'Email + Slack escalation',
      'Remove Raysef branding',
      'Analytics dashboard',
      'Priority support',
    ],
    cta: 'Start free trial',
    highlight: true,
    badge: 'Most popular',
  },
  {
    name: 'Pro',
    price: 149,
    description: 'For high-volume businesses.',
    features: [
      'Unlimited conversations',
      'Unlimited AI agents',
      'Full site crawl + auto-sync',
      'All file types',
      'Full white-label',
      'API access',
      'Custom AI instructions',
      'Dedicated support',
    ],
    cta: 'Start free trial',
    highlight: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="bg-neutral-950 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-lime-400">
            Pricing
          </p>
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            14-day free trial. Card required. Cancel anytime.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                plan.highlight
                  ? 'border-lime-400 bg-lime-400/5 shadow-lg shadow-lime-400/10'
                  : 'border-neutral-800 bg-neutral-950'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-lime-400 px-4 py-1 text-xs font-bold text-black">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-neutral-400">{plan.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white">${plan.price}</span>
                  <span className="text-neutral-400">/month</span>
                </div>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-neutral-300">
                    <Check size={15} className="flex-shrink-0 text-lime-400" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={plan.highlight ? 'btn-primary text-center' : 'btn-secondary text-center'}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-neutral-500">
          All plans include a 14-day free trial. No charge until day 15.
        </p>
      </div>
    </section>
  )
}
