# Publications Section Design

## Summary

Add a dedicated `/publications` page to the portfolio showcasing published books. Starts with "Nuxt Unleashed" as the featured publication. Uses an editorial book feature layout with full details, reviews, table of contents excerpt, and related blog posts.

## Decisions

- **Placement**: Dedicated page with navbar link, positioned after PROJECTS
- **Data management**: Content collection (JSON) in `content/publications/`
- **Layout**: Editorial Book Feature — large hero-style book showcase
- **Details level**: Full featured — title, cover, metadata, description, reviews/quotes, TOC excerpt, related posts

## Data Schema

### `content/publications/publications.json`

```json
{
  "items": [
    {
      "title": "Nuxt Unleashed",
      "subtitle": "Harnessing the Power of Nuxt 3",
      "cover": "https://m.media-amazon.com/images/I/...",
      "publisher": "...",
      "isbn": "...",
      "format": "ebook",
      "pages": 300,
      "date": "2023-10",
      "description": "Full description text...",
      "amazonUrl": "https://www.amazon.com/Nuxt-Unleashed-Harnessing-Power-3-ebook/dp/B0CL3SC3D8",
      "previewUrl": null,
      "reviews": [
        {
          "quote": "...",
          "author": "...",
          "source": "..."
        }
      ],
      "toc": [
        "Chapter 1: ...",
        "Chapter 2: ..."
      ],
      "relatedPosts": ["slug-1", "slug-2"]
    }
  ]
}
```

### Content config (`content.config.ts`)

Add `publications` collection:

```ts
publications: defineCollection({
  type: 'data',
  source: 'publications/*.json',
  schema: z.object({
    items: z.array(z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      cover: z.string(),
      publisher: z.string().optional(),
      isbn: z.string().optional(),
      format: z.enum(['ebook', 'paperback', 'hardcover']).optional(),
      pages: z.number().optional(),
      date: z.string().optional(),
      description: z.string(),
      amazonUrl: z.string(),
      previewUrl: z.string().optional(),
      reviews: z.array(z.object({
        quote: z.string(),
        author: z.string(),
        source: z.string()
      })).optional(),
      toc: z.array(z.string()).optional(),
      relatedPosts: z.array(z.string()).optional()
    }))
  })
})
```

## Page: `app/pages/publications.vue`

### Section 1: Hero
- Red dot badge + "PUBLICATIONS" uppercase label
- Page title: "Published Works"
- Subtitle describing the publications section

### Section 2: Book Feature (per item)
- Two-column grid (image left, details right)
- Cover image with bordered frame treatment + rotation hover (matches homepage/about image style)
- Title, subtitle, metadata badges (format, pages, date)
- Long description
- "Buy on Amazon" CTA button (black bg, white text)
- Preview link if available

### Section 3: Reviews & Quotes
- Styled blockquotes with left accent bar (matches homepage Testimonials section)
- Quote text, author name, source attribution

### Section 4: Table of Contents Excerpt
- Clean numbered/bulleted list of chapters
- Border-separated from other sections

### Section 5: Related Posts
- Link to related blog posts if configured
- Uses existing PostCard or simple link format

## New Components

### `app/components/PublicationCard.vue`
The main book feature component. Props: publication object. Renders the hero book layout.

### `app/components/ReviewCard.vue`
Individual review/quote block. Props: quote, author, source. Styled blockquote with attribution.

## Modified Files

| File | Change |
|------|--------|
| `content.config.ts` | Add `publications` collection definition |
| `app/components/HeaderNav.vue` | Add `PUBLICATIONS` link after `PROJECTS` in nav links array |

## New Files

| File | Purpose |
|------|---------|
| `content/publications/publications.json` | Publication data |
| `app/pages/publications.vue` | Publications page |
| `app/components/PublicationCard.vue` | Book feature component |
| `app/components/ReviewCard.vue` | Review/quote component |

## Design Tokens (matching existing site)

- Background: `#F3F3F3`, sections alternate with `bg-white`
- Red accent: `#FF4F4F` (badge dots)
- Borders: `border-black/10`, `border-black/20`
- Text: `font-sans` base, `font-mono` for metadata/code, `font-light` for body
- Section badges: `text-xs font-medium tracking-widest text-gray-500 uppercase`
- Buttons: `bg-black text-white px-6 py-3 text-sm font-bold uppercase tracking-widest`
- Image treatment: bordered frame with `border border-black/20 bg-white p-2`, rotate on hover
