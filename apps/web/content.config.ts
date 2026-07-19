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
        categories: z.array(z.string()).optional(),
        ogImage: z.string().optional(),
        canonical: z.string().optional(),
        excerpt: z.object({
          type: z.string(),
          children: z.any(),
        }).optional()
      })
    }),
    tutorials: defineCollection({
      type: 'page',
      source: 'learn/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        series: z.string(),
        nuxtVersion: z.string().optional(),
        releaseDate: z.string().optional(),
        sourceUrl: z.string().optional(),
        img: z.string().optional(),
        difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
        estMinutes: z.number().optional(),
        order: z.number().optional(),
        feature: z.string().optional(),
        sourcePRs: z.array(z.string()).optional(),
        author: z.object({
          name: z.string(),
          img: z.string(),
          website: z.string().optional()
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
        date: z.string().optional(),
        updatedAt: z.string().optional(),
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
    }),
    pages: defineCollection({
      type: 'page',
      source: '*.md'
    })
  }
})
