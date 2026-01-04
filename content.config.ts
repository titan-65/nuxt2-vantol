import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.string().optional(),
        tag: z.string(),
        img: z.string(),
        author: z.object({
          name: z.string(),
          img: z.string(),
          website: z.string().optional()
        }),
        readTime: z.number().optional(),
        keywords: z.array(z.string()).optional(),
        language: z.string().optional(),
        rating: z.number().optional(),
        excerpt: z.object({
          type: z.string(),
          children: z.any(),
        }).optional()
      })
    }),
    projects: defineCollection({
      type: 'page',
      source: 'projects/*.md',
      schema: z.object({
        title: z.string(),
        preview: z.string(),
        active: z.boolean(),
        url: z.string().optional(),
        tag: z.string(),
        image: z.string(),
        git: z.string().optional(),
        stack: z.object({
          Frontend: z.string().optional(),
          Backend: z.string().optional(),
          Framework: z.string().optional(),
          css: z.string().optional(),
          language: z.string().optional(),
          Database: z.string().optional()
        }).optional()
      })
    }),
    about: defineCollection({
      type: 'data',
      source: 'about/*.json',
      schema: z.object({
        skills: z.array(z.object({
          category: z.string(),
          items: z.array(z.string())
        })),
        experience: z.array(z.object({
          title: z.string(),
          company: z.string(),
          period: z.string(),
          description: z.string()
        }))
      })
    }),
    uses: defineCollection({
      type: 'data',
      source: 'uses/*.json',
      schema: z.object({
        categories: z.array(z.object({
          title: z.string(),
          description: z.string(),
          items: z.array(z.object({
            name: z.string(),
            description: z.string()
          }))
        }))
      })
    }),
    gallery: defineCollection({
      type: 'data',
      source: 'gallery/*.json',
      schema: z.object({
        items: z.array(z.object({
          title: z.string(),
          type: z.enum(['Photo', 'Screenshot', 'Sketch']),
          year: z.string(),
          note: z.string(),
          img: z.string()
        }))
      })
    }),
    explore: defineCollection({
      type: 'data',
      source: 'explore/*.json',
      schema: z.object({
        cards: z.array(z.object({
          title: z.string(),
          label: z.string(),
          description: z.string(),
          to: z.string().optional(),
          status: z.enum(['Active', 'Draft', 'Planned'])
        }))
      })
    }),
    pages: defineCollection({
      type: 'page',
      source: '*.md'
    })
  }
})
