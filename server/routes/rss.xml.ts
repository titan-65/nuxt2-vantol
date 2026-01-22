import { defineEventHandler, getRequestURL, setHeader } from 'h3'
import { queryCollection } from '@nuxt/content/server'

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default defineEventHandler(async (event) => {
  const { public: { siteUrl } } = useRuntimeConfig()
  const baseUrl = siteUrl || getRequestURL(event).origin

  const posts = await queryCollection(event, 'blog')
    .order('date' as any, 'DESC')
    .all() as any[]

  const items = posts.map((post) => {
    const slug = post.path?.split('/').pop()
    const link = `${baseUrl}/blog/${slug}`
    const pubDate = post.date || post.createdAt
    const categories = Array.from(new Set([
      ...(post.categories || []),
      post.tag
    ].filter(Boolean)))

    return `\n    <item>\n      <title>${escapeXml(post.title || '')}</title>\n      <link>${escapeXml(link)}</link>\n      <guid>${escapeXml(link)}</guid>\n      <description>${escapeXml(post.description || '')}</description>\n      ${pubDate ? `<pubDate>${new Date(pubDate).toUTCString()}</pubDate>` : ''}\n      ${categories.map((category: string) => `<category>${escapeXml(category)}</category>`).join('')}\n    </item>`
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>VantolBennett Blog</title>\n    <link>${escapeXml(`${baseUrl}/blog`)}</link>\n    <description>Latest posts from VantolBennett.</description>\n    ${items}\n  </channel>\n</rss>`

  setHeader(event, 'content-type', 'application/rss+xml')
  return xml
})
