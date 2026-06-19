import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://raysef.com'
  const now = new Date()

  return [
    // Core pages
    { url: base, priority: 1.0, changeFrequency: 'weekly', lastModified: now },
    { url: `${base}/pricing`, priority: 0.9, changeFrequency: 'weekly', lastModified: now },

    // Auth (indexable landing, not dashboard)
    { url: `${base}/login`, priority: 0.5, changeFrequency: 'monthly', lastModified: now },
    { url: `${base}/signup`, priority: 0.8, changeFrequency: 'monthly', lastModified: now },

    // Compare pages — high commercial intent
    { url: `${base}/compare/vs-intercom`, priority: 0.85, changeFrequency: 'monthly', lastModified: now },
    { url: `${base}/compare/vs-zendesk`, priority: 0.85, changeFrequency: 'monthly', lastModified: now },
    { url: `${base}/compare/vs-freshdesk`, priority: 0.85, changeFrequency: 'monthly', lastModified: now },

    // Use case pages — transactional intent
    { url: `${base}/use-cases/shopify`, priority: 0.85, changeFrequency: 'monthly', lastModified: now },
    { url: `${base}/use-cases/saas`, priority: 0.8, changeFrequency: 'monthly', lastModified: now },
    { url: `${base}/use-cases/agencies`, priority: 0.8, changeFrequency: 'monthly', lastModified: now },
    { url: `${base}/use-cases/ecommerce`, priority: 0.8, changeFrequency: 'monthly', lastModified: now },

    // Legal
    { url: `${base}/privacy`, priority: 0.3, changeFrequency: 'yearly', lastModified: now },
    { url: `${base}/terms`, priority: 0.3, changeFrequency: 'yearly', lastModified: now },
  ]
}
