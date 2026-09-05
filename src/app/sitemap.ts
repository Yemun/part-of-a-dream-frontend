import { MetadataRoute } from 'next'
import { getBlogPosts, getWorks } from '@/lib/content'
import { routing, getLocalePrefix } from '@/i18n/routing'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://yemun.kr'

  const alternatesFor = (path: string) => ({
    languages: Object.fromEntries(
      routing.locales.map(loc => [loc, `${baseUrl}${getLocalePrefix(loc)}${path}`])
    ),
  })

  // Generate URLs for all locales
  const urls: MetadataRoute.Sitemap = []

  // Static pages for each locale
  for (const locale of routing.locales) {
    const localePrefix = getLocalePrefix(locale)

    // Get posts / works for this specific locale
    const posts = await getBlogPosts(locale)
    const works = await getWorks(locale)

    // Add static pages
    urls.push(
      {
        url: `${baseUrl}${localePrefix}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1,
        alternates: alternatesFor(''),
      },
      {
        url: `${baseUrl}${localePrefix}/posts`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: alternatesFor('/posts'),
      },
      {
        url: `${baseUrl}${localePrefix}/profile`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates: alternatesFor('/profile'),
      },
      {
        url: `${baseUrl}${localePrefix}/side-project`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
        alternates: alternatesFor('/side-project'),
      }
    )

    // Work (portfolio) pages for this locale
    works.forEach(work => {
      urls.push({
        url: `${baseUrl}${localePrefix}/work/${work.slug}`,
        lastModified: new Date(work.endDate ?? work.startDate),
        changeFrequency: 'monthly',
        priority: 0.9,
        alternates: alternatesFor(`/work/${work.slug}`),
      })
    })

    // Dynamic blog post pages for this locale
    posts.forEach(post => {
      urls.push({
        url: `${baseUrl}${localePrefix}/posts/${post.slug}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.9,
        alternates: alternatesFor(`/posts/${post.slug}`),
      })
    })
  }

  return urls
}
