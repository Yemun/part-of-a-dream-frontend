import { MetadataRoute } from 'next'
import { getBlogPosts } from '@/lib/content'
import { routing } from '@/i18n/routing'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://yemun.kr'
  
  // Generate URLs for all locales
  const urls: MetadataRoute.Sitemap = []
  
  // Static pages for each locale
  for (const locale of routing.locales) {
    const localePrefix = `/${locale}` // All locales get prefixes with 'always' setting
    
    // Get posts for this specific locale
    const posts = await getBlogPosts(locale)
    
    // Add static pages
    urls.push(
      {
        url: `${baseUrl}${localePrefix}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map(loc => [
              loc,
              `${baseUrl}/${loc}` // All locales get prefixes
            ])
          )
        }
      },
      {
        url: `${baseUrl}${localePrefix}/profile`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map(loc => [
              loc,
              `${baseUrl}/${loc}/profile` // All locales get prefixes
            ])
          )
        }
      }
    )
    
    // Dynamic blog post pages for this locale
    posts.forEach(post => {
      urls.push({
        url: `${baseUrl}${localePrefix}/posts/${post.slug}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.9,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map(loc => [
              loc,
              `${baseUrl}/${loc}/posts/${post.slug}` // All locales get prefixes
            ])
          )
        }
      })
    })
  }
  
  return urls
}