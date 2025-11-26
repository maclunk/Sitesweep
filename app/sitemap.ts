import { MetadataRoute } from 'next'
import { blogArticles } from '@/src/data/blogArticles'

export default function sitemap(): MetadataRoute.Sitemap {
  // Production Base URL
  const baseUrl = 'https://www.sitesweep.de'

  // Statische Routen
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/leistungen`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ueber-uns`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ratgeber`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/impressum`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/datenschutz`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Dynamische Blog-Routen
  const blogRoutes: MetadataRoute.Sitemap = blogArticles.map((article) => ({
    url: `${baseUrl}/ratgeber/${article.slug}`,
    lastModified: new Date(article.publishDate),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // Kombiniere alle Routen
  return [...staticRoutes, ...blogRoutes]
}

