const steps = [
  {
    number: '01',
    title: 'Sign up',
    description: 'Create your account and enter your card for the 14-day free trial.',
  },
  {
    number: '02',
    title: 'Paste your URL',
    description: 'Our crawler reads and indexes your entire website automatically.',
  },
  {
    number: '03',
    title: 'Customize your agent',
    description: 'Set your brand color, agent name, and welcome message.',
  },
  {
    number: '04',
    title: 'Copy one line of code',
    description: 'Paste the script tag into your site. Done.',
  },
  {
    number: '05',
    title: 'Go live',
    description: 'Customers get instant answers. Every conversation is logged in your dashboard.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-neutral-950 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-lime-400">
            Setup
          </p>
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Live in five steps
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            No engineers. No integrations. No waiting.
          </p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[28px] top-0 hidden h-full w-px bg-gradient-to-b from-lime-400/40 via-lime-400/20 to-transparent md:block" />

          <div className="space-y-10">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-6">
                <div className="relative flex-shrink-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-lime-400/30 bg-lime-400/10 text-lg font-bold text-lime-400">
                    {step.number}
                  </div>
                </div>
                <div className="pt-3">
                  <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-1 text-neutral-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
