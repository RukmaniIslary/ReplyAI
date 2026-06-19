import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/marketing/Navbar'
import { Footer } from '@/components/marketing/Footer'
import { Check, X } from 'lucide-react'

const comparisons: Record<string, {
  competitor: string
  title: string
  description: string
  rows: { feature: string; raysef: boolean | string; competitor: boolean | string }[]
}> = {
  'vs-intercom': {
    competitor: 'Intercom',
    title: 'Raysef vs Intercom — AI Customer Support Alternative',
    description:
      'Compare Raysef and Intercom. Raysef is the affordable AI-first alternative — starts at $29/month vs Intercom\'s $74+/month.',
    rows: [
      { feature: 'Starting price', raysef: '$29/month', competitor: '$74/month' },
      { feature: 'AI trained on your website', raysef: true, competitor: false },
      { feature: '14-day free trial', raysef: true, competitor: false },
      { feature: 'One-line embed', raysef: true, competitor: false },
      { feature: 'No-code setup', raysef: true, competitor: false },
      { feature: 'White-label', raysef: true, competitor: '$299+/month' },
      { feature: 'Conversation limit on base plan', raysef: '500/month', competitor: '200/month' },
      { feature: 'Setup time', raysef: '10 minutes', competitor: '2–5 days' },
    ],
  },
  'vs-zendesk': {
    competitor: 'Zendesk',
    title: 'Raysef vs Zendesk — Simpler, Cheaper AI Support',
    description:
      'Raysef vs Zendesk. Get AI customer support without the enterprise complexity. Starts at $29/month.',
    rows: [
      { feature: 'Starting price', raysef: '$29/month', competitor: '$55/agent/month' },
      { feature: 'AI trained on your website', raysef: true, competitor: false },
      { feature: 'No per-agent pricing', raysef: true, competitor: false },
      { feature: 'One-line embed', raysef: true, competitor: false },
      { feature: '14-day free trial', raysef: true, competitor: false },
      { feature: 'Setup time', raysef: '10 minutes', competitor: '1–2 weeks' },
      { feature: 'White-label', raysef: true, competitor: 'Enterprise only' },
      { feature: 'Ideal for', raysef: 'SMBs', competitor: 'Enterprise' },
    ],
  },
  'vs-freshdesk': {
    competitor: 'Freshdesk',
    title: 'Raysef vs Freshdesk — AI-First Alternative',
    description:
      'Raysef vs Freshdesk. Raysef is AI-first from day one — no tickets, no queues. Just instant answers.',
    rows: [
      { feature: 'Starting price', raysef: '$29/month', competitor: '$15/agent/month' },
      { feature: 'AI trained on your website', raysef: true, competitor: 'Add-on' },
      { feature: 'Ticket-free support', raysef: true, competitor: false },
      { feature: 'One-line embed', raysef: true, competitor: false },
      { feature: '14-day free trial', raysef: true, competitor: true },
      { feature: 'White-label', raysef: true, competitor: 'Enterprise' },
      { feature: 'Setup time', raysef: '10 minutes', competitor: '3–7 days' },
    ],
  },
}

export async function generateStaticParams() {
  return Object.keys(comparisons).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = comparisons[params.slug]
  if (!data) return {}
  return {
    title: data.title,
    description: data.description,
    alternates: { canonical: `/compare/${params.slug}` },
  }
}

export default function ComparePage({ params }: { params: { slug: string } }) {
  const data = comparisons[params.slug]
  if (!data) notFound()

  return (
    <main className="bg-black">
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-lime-400">Compare</p>
          <h1 className="text-4xl font-bold text-white md:text-5xl">
            Raysef vs {data.competitor}
          </h1>
          <p className="mt-4 text-lg text-neutral-400 max-w-2xl mx-auto">{data.description}</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-neutral-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950">
                <th className="px-6 py-4 text-left font-medium text-neutral-400">Feature</th>
                <th className="px-6 py-4 text-center font-semibold text-lime-400">Raysef</th>
                <th className="px-6 py-4 text-center font-medium text-neutral-400">{data.competitor}</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => (
                <tr key={i} className="border-b border-neutral-800/50 bg-neutral-950 hover:bg-neutral-900/50">
                  <td className="px-6 py-4 text-neutral-300">{row.feature}</td>
                  <td className="px-6 py-4 text-center">
                    {typeof row.raysef === 'boolean' ? (
                      row.raysef
                        ? <Check size={16} className="mx-auto text-lime-400" />
                        : <X size={16} className="mx-auto text-neutral-600" />
                    ) : (
                      <span className="text-lime-400 font-medium">{row.raysef}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {typeof row.competitor === 'boolean' ? (
                      row.competitor
                        ? <Check size={16} className="mx-auto text-neutral-400" />
                        : <X size={16} className="mx-auto text-neutral-600" />
                    ) : (
                      <span className="text-neutral-400">{row.competitor}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 text-center">
          <Link href="/signup" className="btn-primary text-base px-10 py-4">
            Start your free 14-day trial
          </Link>
          <p className="mt-3 text-sm text-neutral-500">No charge until day 15. Cancel anytime.</p>
        </div>
      </section>
      <Footer />
    </main>
  )
}
