import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/marketing/Navbar'
import { Footer } from '@/components/marketing/Footer'
import { ArrowRight } from 'lucide-react'

const useCases: Record<string, {
  title: string
  headline: string
  description: string
  points: string[]
}> = {
  shopify: {
    title: 'AI Chatbot for Shopify — Raysef',
    headline: 'Stop answering the same Shopify questions.',
    description: 'Raysef trains on your Shopify store and answers customer questions 24/7. Shipping times, returns, sizing, product details — handled automatically.',
    points: [
      'Crawls your Shopify product pages, FAQs, and policies',
      'Answers shipping, returns, and sizing questions instantly',
      'One-line install — paste into your Shopify theme',
      'Reduces support tickets by up to 70%',
      'Works on mobile and desktop',
    ],
  },
  saas: {
    title: 'Customer Support Automation for SaaS — Raysef',
    headline: 'Let your docs answer customer questions.',
    description: 'Train Raysef on your help docs, changelog, and FAQs. Your users get instant answers without opening a ticket.',
    points: [
      'Crawls your help center, docs, and blog',
      'Answers onboarding, feature, and billing questions',
      'Integrates in minutes — no engineers required',
      'Logs every conversation for product insights',
      'Scales with your user base automatically',
    ],
  },
  agencies: {
    title: 'White Label Chatbot for Agencies — Raysef',
    headline: 'Add AI support to every client. Keep your brand.',
    description: 'Raysef is built for agencies. White-label the widget, charge clients a retainer, and deploy AI support at scale.',
    points: [
      'Full white-label on Growth and Pro plans',
      'Manage multiple clients from one dashboard',
      'Each client gets their own AI agent and training data',
      'Offer as a premium add-on service',
      'Reseller-friendly pricing',
    ],
  },
  ecommerce: {
    title: 'AI Customer Support for E-commerce — Raysef',
    headline: 'Your AI handles customer questions. You handle growth.',
    description: 'E-commerce brands trust Raysef to answer product questions, order status requests, and return queries — automatically, 24/7.',
    points: [
      'Trains on all product pages and store policies',
      'Handles high-volume support without added headcount',
      'Reduces cart abandonment from unanswered questions',
      'Works on any platform — Shopify, WooCommerce, custom',
      'Escalates complex issues to your email automatically',
    ],
  },
}

export async function generateStaticParams() {
  return Object.keys(useCases).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = useCases[params.slug]
  if (!data) return {}
  return {
    title: data.title,
    description: data.description,
    alternates: { canonical: `/use-cases/${params.slug}` },
  }
}

export default function UseCasePage({ params }: { params: { slug: string } }) {
  const data = useCases[params.slug]
  if (!data) notFound()

  return (
    <main className="bg-black">
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 py-20">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-lime-400">Use case</p>
        <h1 className="text-4xl font-bold text-white md:text-5xl leading-tight">
          {data.headline}
        </h1>
        <p className="mt-5 text-lg text-neutral-400 leading-relaxed">{data.description}</p>

        <ul className="mt-8 space-y-3">
          {data.points.map((point, i) => (
            <li key={i} className="flex items-center gap-3 text-neutral-300">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-lime-400/20">
                <ArrowRight size={11} className="text-lime-400" />
              </span>
              {point}
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <Link href="/signup" className="btn-primary text-base px-10 py-4">
            Start free trial
          </Link>
          <p className="mt-3 text-sm text-neutral-500">14 days free. No charge until day 15.</p>
        </div>
      </section>
      <Footer />
    </main>
  )
}
