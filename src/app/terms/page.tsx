import type { Metadata } from 'next'
import { Navbar } from '@/components/marketing/Navbar'
import { Footer } from '@/components/marketing/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Raysef terms of service.',
}

export default function TermsPage() {
  return (
    <main className="bg-black">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-neutral-500 mb-10">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="space-y-6 text-neutral-400 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">1. Acceptance</h2>
            <p>By using Raysef, you agree to these terms. If you do not agree, do not use the service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. Free trial</h2>
            <p>All plans include a 14-day free trial. A valid credit card is required to start the trial. If you do not cancel before the trial ends, your card will be charged on day 15.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. Acceptable use</h2>
            <p>You may not use Raysef for illegal purposes, to distribute spam, or to infringe on the rights of others. We reserve the right to suspend accounts that violate these terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Cancellation</h2>
            <p>You may cancel your subscription at any time. Your access continues until the end of the current billing period. No refunds are issued for partial months.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">5. Limitation of liability</h2>
            <p>Raysef is provided as-is. We are not liable for indirect, incidental, or consequential damages arising from your use of the service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">6. Contact</h2>
            <p>For questions, contact legal@raysef.io.</p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}
