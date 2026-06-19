import type { Metadata } from 'next'
import { Navbar } from '@/components/marketing/Navbar'
import { Pricing } from '@/components/marketing/Pricing'
import { FAQ } from '@/components/marketing/FAQ'
import { Footer } from '@/components/marketing/Footer'

export const metadata: Metadata = {
  title: 'Pricing — AI Chatbot Plans Starting at $29/month',
  description:
    'Simple, transparent pricing for AI customer support. Starter $29, Growth $79, Pro $149. 14-day free trial on all plans.',
}

export default function PricingPage() {
  return (
    <main className="bg-black">
      <Navbar />
      <div className="pt-12 pb-4 text-center">
        <h1 className="text-4xl font-bold text-white md:text-5xl">
          Pricing
        </h1>
        <p className="mt-3 text-neutral-400">14-day free trial on all plans. No charge until day 15.</p>
      </div>
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  )
}
