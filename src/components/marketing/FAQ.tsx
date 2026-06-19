'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    q: 'Do I need a credit card for the trial?',
    a: 'Yes. We require a card upfront. You will not be charged until the 14-day trial ends on day 15. This ensures we can offer you full access without restrictions during the trial.',
  },
  {
    q: 'How does the website crawler work?',
    a: 'You paste your website URL and Raysef crawls all accessible pages — product pages, FAQs, about pages, blog posts. The content is chunked, embedded into vectors, and stored. Your AI agent uses this to answer questions accurately.',
  },
  {
    q: 'What happens when I reach my conversation limit?',
    a: 'The AI returns a polite fallback message and offers to escalate the conversation to your support email. Limits reset on your monthly billing date.',
  },
  {
    q: 'Can I use my own branding?',
    a: 'Growth and Pro plans let you remove Raysef branding from the widget. Pro includes full white-label — no Raysef references anywhere.',
  },
  {
    q: 'Which AI model does Raysef use?',
    a: 'We use Google Gemini 1.5 Flash by default — a capable and cost-efficient model. Pro users can switch to OpenAI GPT-4o-mini for higher accuracy.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from your billing dashboard at any time. Your subscription ends at the close of the current billing period. No cancellation fees.',
  },
  {
    q: 'Does the widget work on Shopify?',
    a: 'Yes. Paste the one-line script into your Shopify theme code. Works on Shopify, WordPress, Webflow, Wix, and any custom HTML site.',
  },
  {
    q: 'Is my customer data secure?',
    a: 'All data is encrypted in transit and at rest. Conversations are stored in your private Supabase database. We do not share or sell your data.',
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="bg-black py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-lime-400">FAQ</p>
          <h2 className="text-4xl font-bold text-white md:text-5xl">Common questions</h2>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
              <button
                className="flex w-full items-center justify-between px-6 py-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="text-sm font-medium text-white">{faq.q}</span>
                <span className="ml-4 flex-shrink-0 text-lime-400">
                  {open === i ? <Minus size={16} /> : <Plus size={16} />}
                </span>
              </button>

              {open === i && (
                <div className="border-t border-neutral-800 px-6 py-4 text-sm leading-relaxed text-neutral-400">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
