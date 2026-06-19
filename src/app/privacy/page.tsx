import type { Metadata } from 'next'
import { Navbar } from '@/components/marketing/Navbar'
import { Footer } from '@/components/marketing/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Raysef privacy policy — how we handle your data.',
}

export default function PrivacyPage() {
  return (
    <main className="bg-black">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-neutral-500 mb-10">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-neutral-400">
          <section>
            <h2 className="text-lg font-semibold text-white">1. What we collect</h2>
            <p>When you create an account, we collect your name, email address, and billing information processed by Stripe. We also collect your website content you submit for AI training, and anonymized conversation logs from your deployed chat widget.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">2. How we use your data</h2>
            <p>We use your data to provide the Raysef service — training your AI agent, processing payments, and displaying analytics in your dashboard. We do not sell, rent, or share your data with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">3. Data storage</h2>
            <p>Your data is stored securely in Supabase (PostgreSQL) with encryption at rest and in transit. We use Stripe for payment processing — we never store raw card numbers.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">4. Data retention</h2>
            <p>You may delete your account and all associated data at any time from your dashboard settings. Conversation data is retained for 12 months by default.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">5. Contact</h2>
            <p>For privacy questions, contact us at privacy@raysef.io.</p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}
