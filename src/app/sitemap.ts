import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://raysef.io'
  const now = new Date()

  return [
    { url: baseUrl, priority: 1.0, changeFrequency: 'weekly', lastModified: now },
    { url: `${baseUrl}/pricing`, priority: 0.9, changeFrequency: 'weekly', lastModified: now },
    { url: `${baseUrl}/compare/vs-intercom`, priority: 0.8, lastModified: now },
    { url: `${baseUrl}/compare/vs-zendesk`, priority: 0.8, lastModified: now },
    { url: `${baseUrl}/compare/vs-freshdesk`, priority: 0.8, lastModified: now },
    { url: `${baseUrl}/use-cases/shopify`, priority: 0.8, lastModified: now },
    { url: `${baseUrl}/use-cases/saas`, priority: 0.8, lastModified: now },
    { url: `${baseUrl}/use-cases/agencies`, priority: 0.8, lastModified: now },
    { url: `${baseUrl}/use-cases/ecommerce`, priority: 0.8, lastModified: now },
    { url: `${baseUrl}/privacy`, priority: 0.3, lastModified: now },
    { url: `${baseUrl}/terms`, priority: 0.3, lastModified: now },
  ]
}
