import { defineEventHandler, getRequestURL, setHeader } from 'h3'
import { queryCollection } from '@nuxt/content/server'

function toUrl(baseUrl: string, path: string) {
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

type SitemapEntry = {
  loc: string
  lastmod?: string
}

export default defineEventHandler(async (event) => {
  const { public: { siteUrl } } = useRuntimeConfig()
  const baseUrl = siteUrl || getRequestURL(event).origin

  const staticRoutes = [
    '/',
    '/about',
    '/blog',
    '/learn',
    '/projects',
    '/uses',
    '/gallery',
    '/explore',
    '/contact',
    '/bookmarks'
  ]

  const blogPosts = await queryCollection(event, 'blog').all() as any[]
  const projectPosts = await queryCollection(event, 'projects').all() as any[]
  const tutorials = await queryCollection(event, 'tutorials').all() as any[]

  const urls: SitemapEntry[] = [
    ...staticRoutes.map((route) => ({ loc: toUrl(baseUrl, route) })),
    ...blogPosts.map((post) => ({
      loc: toUrl(baseUrl, post.path || `/blog/${post.slug || post.path?.split('/').pop()}`),
      lastmod: post.updatedAt || post.date || post.createdAt
    })),
    ...projectPosts.map((project) => ({
      loc: toUrl(baseUrl, project.path || `/projects/${project.slug || project.path?.split('/').pop()}`),
      lastmod: project.updatedAt || project.date || project.createdAt
    })),
    ...tutorials.map((doc) => ({
      loc: toUrl(baseUrl, doc.path),
      lastmod: doc.updatedAt || doc.releaseDate || doc.createdAt
    }))
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((entry) => {
      const lastmod = entry.lastmod ? new Date(entry.lastmod).toISOString() : null
      return `  <url>\n    <loc>${entry.loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`
    })
    .join('\n')}\n</urlset>`

  setHeader(event, 'content-type', 'application/xml')
  return xml
})
