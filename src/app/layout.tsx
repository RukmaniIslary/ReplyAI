import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://raysef.io'),
  title: {
    default: 'Raysef — AI Customer Support Agent. Live in 10 Minutes.',
    template: '%s | Raysef',
  },
  description:
    'Train an AI on your website and answer customer questions 24/7 automatically. No code required. Live in 10 minutes.',
  keywords: [
    'AI customer support',
    'AI chatbot',
    'customer support automation',
    'AI support agent',
    'chatbot for Shopify',
    'white label chatbot',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://raysef.io',
    siteName: 'Raysef',
    title: 'Raysef — AI Customer Support Agent. Live in 10 Minutes.',
    description:
      'Train an AI on your website and answer customer questions 24/7 automatically.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Raysef' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raysef — AI Customer Support Agent',
    description: 'Train an AI on your website. Answer customer questions 24/7.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Raysef',
  applicationCategory: 'BusinessApplication',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '29',
    highPrice: '149',
    priceCurrency: 'USD',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '127',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-black text-white">{children}</body>
    </html>
  )
}
