const testimonials = [
  {
    quote:
      'We went from answering 80 repetitive emails a day to almost zero. Raysef handles them all. Our support team now focuses on real problems.',
    name: 'Marcus T.',
    role: 'Founder, Shopify store',
    initials: 'MT',
  },
  {
    quote:
      'Setup took exactly 8 minutes. I crawled our docs site, customized the widget, pasted the code. Done. It just works.',
    name: 'Sarah K.',
    role: 'Head of Support, SaaS startup',
    initials: 'SK',
  },
  {
    quote:
      'I run a digital agency and I white-label Raysef for all my clients. It is the most profitable add-on I have ever offered.',
    name: 'Daniel R.',
    role: 'Agency owner',
    initials: 'DR',
  },
  {
    quote:
      'The conversation logs are gold. I discovered three product gaps in the first week just by reading what customers were asking.',
    name: 'Priya M.',
    role: 'Product Manager, e-commerce brand',
    initials: 'PM',
  },
  {
    quote:
      'Tried three other AI chat tools. Raysef is the only one that actually trains on your real content and gives useful answers.',
    name: 'James L.',
    role: 'Freelancer, web consultant',
    initials: 'JL',
  },
  {
    quote:
      'Customer satisfaction went up. Response time went from hours to seconds. The ROI on $29/month is absurd.',
    name: 'Aisha W.',
    role: 'Operations, boutique brand',
    initials: 'AW',
  },
]

export function Testimonials() {
  return (
    <section className="bg-black py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-lime-400">
            Social proof
          </p>
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Businesses that made the switch
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-950 p-6"
            >
              <p className="text-sm leading-relaxed text-neutral-300">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-400/20 text-xs font-bold text-lime-400">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-neutral-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
