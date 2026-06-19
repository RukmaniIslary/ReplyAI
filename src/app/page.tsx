import { Navbar } from '@/components/marketing/Navbar'
import { Hero } from '@/components/marketing/Hero'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { Features } from '@/components/marketing/Features'
import { Pricing } from '@/components/marketing/Pricing'
import { Testimonials } from '@/components/marketing/Testimonials'
import { FAQ } from '@/components/marketing/FAQ'
import { Footer } from '@/components/marketing/Footer'
import { CTA } from '@/components/marketing/CTA'

export default function HomePage() {
  return (
    <main className="bg-black">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Pricing />
      <Testimonials />
      <CTA />
      <FAQ />
      <Footer />
    </main>
  )
}
