import { defineContentConfig, defineCollection, z } from "@nuxt/content";

// The learning platform owns its own content collection. Nuxt Content walks every
// layer's content.config.ts, so this collection is registered by the layer and
// sourced from packages/learn-layer/content — not from the host app.
export default defineContentConfig({
  collections: {
    tutorials: defineCollection({
      type: "page",
      source: "learn/**/*.md",
      schema: z.object({
        title: z.string(),
        description: z.string(),
        series: z.string(),
        nuxtVersion: z.string().optional(),
        releaseDate: z.string().optional(),
        sourceUrl: z.string().optional(),
        img: z.string().optional(),
        difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
        estMinutes: z.number().optional(),
        order: z.number().optional(),
        feature: z.string().optional(),
        sourcePRs: z.array(z.string()).optional(),
        author: z
          .object({
            name: z.string(),
            img: z.string(),
            website: z.string().optional(),
          })
          .optional(),
      }),
    }),
  },
});
