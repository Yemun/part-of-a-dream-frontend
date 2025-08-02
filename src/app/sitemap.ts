import { MetadataRoute } from 'next'
import { getBlogPosts } from '@/lib/content'
import { routing } from '@/i18n/routing'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://yemun.kr'
  
  // Generate URLs for all locales
  const urls: MetadataRoute.Sitemap = []
  
  // Static pages for each locale
  for (const locale of routing.locales) {
    const localePrefix = locale === routing.defaultLocale ? '' : `/${locale}` // Only non-default locales get prefixes
    
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
              loc === routing.defaultLocale ? baseUrl : `${baseUrl}/${loc}` // Only non-default locales get prefixes
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
              loc === routing.defaultLocale ? `${baseUrl}/profile` : `${baseUrl}/${loc}/profile` // Only non-default locales get prefixes
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
              loc === routing.defaultLocale ? `${baseUrl}/posts/${post.slug}` : `${baseUrl}/${loc}/posts/${post.slug}` // Only non-default locales get prefixes
            ])
          )
        }
      })
    })
  }
  
  return urls
}