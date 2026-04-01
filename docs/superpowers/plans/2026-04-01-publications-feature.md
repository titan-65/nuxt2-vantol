# Publications Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- []`) syntax for tracking.

**Goal:** Add a dedicated `/publications` page showcasing published books with editorial book feature layout, reviews, TOC excerpt, and related posts.

**Architecture:** Content collection (JSON) feeds a publications page with two new reusable components (PublicationCard, ReviewCard). Nav link added after PROJECTS.

**Tech Stack:** Nuxt 4, @nuxt/content, Tailwind CSS, shadcn-nuxt, Vue 3 Composition API

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `content.config.ts` | Modify | Add `publications` collection |
| `content/publications/publications.json` | Create | Publication data |
| `app/components/ReviewCard.vue` | Create | Review/quote block component |
| `app/components/PublicationCard.vue` | Create | Book feature hero component |
| `app/pages/publications.vue` | Create | Publications page |
| `app/components/HeaderNav.vue` | Modify | Add nav link |

---

### Task 1: Add publications content collection

**Files:**
- Modify: `apps/web/content.config.ts`
- Create: `apps/web/content/publications/publications.json`

- [ ] **Step 1: Add `publications` collection to content config**

Edit `apps/web/content.config.ts` — add after the `explore` collection (before `pages`):

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
    }),
```

- [ ] **Step 2: Create publications data file**

Create `apps/web/content/publications/publications.json`:

```json
{
  "items": [
    {
      "title": "Nuxt Unleashed",
      "subtitle": "Harnessing the Power of Nuxt 3",
      "cover": "https://m.media-amazon.com/images/I/71Vkg-jAHEL._SY466_.jpg",
      "publisher": "Independently published",
      "isbn": "B0CL3SC3D8",
      "format": "ebook",
      "pages": 300,
      "date": "2023-10-20",
      "description": "Nuxt Unleashed is a comprehensive guide to building modern web applications with Nuxt 3. From server-side rendering to static site generation, this book covers everything you need to know to harness the full power of the Nuxt framework. Whether you're a beginner or an experienced developer, you'll find practical examples, best practices, and real-world patterns to take your Nuxt applications to the next level.",
      "amazonUrl": "https://www.amazon.com/Nuxt-Unleashed-Harnessing-Power-3-ebook/dp/B0CL3SC3D8",
      "previewUrl": null,
      "reviews": [],
      "toc": [
        "Chapter 1: Introduction to Nuxt 3",
        "Chapter 2: Getting Started",
        "Chapter 3: Routing and Pages",
        "Chapter 4: Components and Composables",
        "Chapter 5: State Management",
        "Chapter 6: Server-Side Rendering",
        "Chapter 7: Static Site Generation",
        "Chapter 8: API Routes and Server Middleware",
        "Chapter 9: Deployment and Production",
        "Chapter 10: Advanced Patterns"
      ],
      "relatedPosts": []
    }
  ]
}
```

- [ ] **Step 3: Verify content collection loads**

Run: `cd apps/web && npx nuxt dev` and check `/_nuxt/content/publications` or inspect via `queryCollection('publications').first()` in a test page.

---

### Task 2: Create ReviewCard component

**Files:**
- Create: `apps/web/app/components/ReviewCard.vue`

- [ ] **Step 1: Create ReviewCard component**

Create `apps/web/app/components/ReviewCard.vue`:

```vue
<script setup lang="ts">
defineProps<{
  quote: string
  author: string
  source: string
}>()
</script>

<template>
  <div class="bg-white border border-black/10 p-8 relative overflow-hidden group hover:border-black transition-colors">
    <div class="absolute top-0 left-0 w-2 h-full bg-black/5 group-hover:bg-[#FF4F4F] transition-colors"></div>
    <blockquote class="text-xl md:text-2xl font-medium leading-tight mb-6 relative z-10">
      "{{ quote }}"
    </blockquote>
    <div class="flex items-center gap-3">
      <div>
        <div class="font-bold text-sm uppercase tracking-wider">{{ author }}</div>
        <div class="font-mono text-xs text-gray-500 uppercase mt-0.5">{{ source }}</div>
      </div>
    </div>
  </div>
</template>
```

This matches the Testimonials section style from `apps/web/app/pages/index.vue:318-336`.

---

### Task 3: Create PublicationCard component

**Files:**
- Create: `apps/web/app/components/PublicationCard.vue`

- [ ] **Step 1: Create PublicationCard component**

Create `apps/web/app/components/PublicationCard.vue`:

```vue
<script setup lang="ts">
defineProps<{
  item: {
    title: string
    subtitle?: string
    cover: string
    publisher?: string
    isbn?: string
    format?: string
    pages?: number
    date?: string
    description: string
    amazonUrl: string
    previewUrl?: string | null
    reviews?: Array<{ quote: string; author: string; source: string }>
    toc?: string[]
    relatedPosts?: string[]
  }
}>()

const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
}
</script>

<template>
  <div class="space-y-16">
    <!-- Book Feature -->
    <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
      <!-- Cover Image -->
      <div class="relative">
        <div class="relative z-10 border border-black/20 bg-white p-2 shadow-sm transform rotate-2 hover:rotate-0 transition-transform duration-500">
          <div class="aspect-[3/4] overflow-hidden bg-gray-100 border border-black/10">
            <img
              :src="item.cover"
              :alt="item.title"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="mt-2 flex justify-between items-center px-1">
            <div class="flex gap-1">
              <div class="w-2 h-2 rounded-full bg-red-400/20"></div>
              <div class="w-2 h-2 rounded-full bg-yellow-400/20"></div>
              <div class="w-2 h-2 rounded-full bg-green-400/20"></div>
            </div>
            <span class="text-[10px] font-mono text-gray-400 uppercase">{{ item.format || 'BOOK' }}</span>
          </div>
        </div>
        <div class="absolute -top-4 -right-4 w-full h-full border border-dashed border-black/20 z-0"></div>
      </div>

      <!-- Details -->
      <div>
        <h2 class="text-3xl md:text-4xl font-medium tracking-tight mb-2">
          {{ item.title }}
        </h2>
        <p v-if="item.subtitle" class="text-lg text-gray-500 font-light mb-6">
          {{ item.subtitle }}
        </p>

        <!-- Metadata Badges -->
        <div class="flex flex-wrap gap-3 mb-8">
          <span v-if="item.format" class="inline-block px-2 py-1 text-xs font-mono bg-black text-white uppercase">
            {{ item.format }}
          </span>
          <span v-if="item.pages" class="inline-block px-2 py-1 text-xs font-mono border border-black/20 text-gray-600 uppercase">
            {{ item.pages }} pages
          </span>
          <span v-if="item.date" class="inline-block px-2 py-1 text-xs font-mono border border-black/20 text-gray-600 uppercase">
            {{ formatDate(item.date) }}
          </span>
          <span v-if="item.publisher" class="inline-block px-2 py-1 text-xs font-mono border border-black/20 text-gray-600 uppercase">
            {{ item.publisher }}
          </span>
        </div>

        <!-- Description -->
        <p class="text-gray-600 font-light leading-relaxed mb-8">
          {{ item.description }}
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-wrap gap-4">
          <a
            :href="item.amazonUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 bg-black text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            Buy on Amazon
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a
            v-if="item.previewUrl"
            :href="item.previewUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 border border-black/20 bg-transparent text-black px-6 py-3 text-sm font-medium uppercase tracking-widest hover:bg-black/5 transition-colors"
          >
            Preview
          </a>
        </div>
      </div>
    </div>

    <!-- Reviews Section -->
    <div v-if="item.reviews && item.reviews.length > 0">
      <div class="flex items-center gap-2 mb-8">
        <span class="w-2 h-2 bg-[#FF4F4F] rounded-full"></span>
        <span class="text-xs font-medium tracking-widest text-gray-500 uppercase">REVIEWS</span>
      </div>
      <div class="grid md:grid-cols-2 gap-6">
        <ReviewCard
          v-for="(review, index) in item.reviews"
          :key="index"
          :quote="review.quote"
          :author="review.author"
          :source="review.source"
        />
      </div>
    </div>

    <!-- Table of Contents -->
    <div v-if="item.toc && item.toc.length > 0">
      <div class="flex items-center gap-2 mb-8">
        <span class="w-2 h-2 bg-[#FF4F4F] rounded-full"></span>
        <span class="text-xs font-medium tracking-widest text-gray-500 uppercase">TABLE OF CONTENTS</span>
      </div>
      <div class="bg-white border border-black/10 p-8">
        <ol class="space-y-3">
          <li
            v-for="(chapter, index) in item.toc"
            :key="index"
            class="flex items-start gap-4 text-gray-600 font-mono text-sm"
          >
            <span class="text-xs font-bold text-gray-400 mt-0.5 w-6 text-right">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="font-light">{{ chapter }}</span>
          </li>
        </ol>
      </div>
    </div>

    <!-- Related Posts -->
    <div v-if="item.relatedPosts && item.relatedPosts.length > 0">
      <div class="flex items-center gap-2 mb-8">
        <span class="w-2 h-2 bg-[#FF4F4F] rounded-full"></span>
        <span class="text-xs font-medium tracking-widest text-gray-500 uppercase">RELATED POSTS</span>
      </div>
      <div class="flex flex-wrap gap-3">
        <NuxtLink
          v-for="slug in item.relatedPosts"
          :key="slug"
          :to="`/blog/${slug}`"
          class="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono border border-black/20 hover:bg-black hover:text-white transition-colors uppercase"
        >
          {{ slug }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
```

---

### Task 4: Create publications page

**Files:**
- Create: `apps/web/app/pages/publications.vue`

- [ ] **Step 1: Create the publications page**

Create `apps/web/app/pages/publications.vue`:

```vue
<script setup lang="ts">
useSeoMeta({
  title: 'Publications - VantolBennett',
  description: 'Published books and written works by Vantol R. Bennett.',
})

const { data: publicationsData } = await useAsyncData('publications-data', () => {
  return queryCollection('publications').first()
})

const publications = computed(() => publicationsData.value?.items || [])
</script>

<template>
  <div class="min-h-screen bg-[#F3F3F3] font-sans">
    <!-- Hero Section -->
    <section class="py-20 border-b border-black/10">
      <div class="container mx-auto px-6">
        <div class="max-w-3xl">
          <div class="flex items-center gap-2 mb-4">
            <span class="w-2 h-2 bg-[#FF4F4F] rounded-full"></span>
            <span class="text-xs font-medium tracking-widest text-gray-500 uppercase">PUBLICATIONS</span>
          </div>

          <h1 class="text-5xl md:text-6xl font-medium tracking-tight mb-8">
            Published Works
          </h1>

          <p class="text-xl text-gray-600 font-light leading-relaxed border-l-2 border-black/10 pl-6">
            Books and written works exploring modern web development, frameworks, and the craft of building software.
          </p>
        </div>
      </div>
    </section>

    <!-- Publications -->
    <section class="py-16 md:py-24">
      <div class="container mx-auto px-6">
        <div class="space-y-24">
          <PublicationCard
            v-for="publication in publications"
            :key="publication.title"
            :item="publication"
          />
        </div>
      </div>
    </section>

    <!-- Empty State -->
    <section v-if="publications.length === 0" class="py-24">
      <div class="container mx-auto px-6">
        <div class="max-w-2xl mx-auto text-center border border-black/20 p-12 bg-white">
          <p class="text-gray-500 font-mono text-sm uppercase tracking-wider">
            More publications coming soon.
          </p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-white border-t border-black/10">
      <div class="container mx-auto px-6">
        <div class="max-w-2xl mx-auto text-center border border-black/20 p-8 bg-[#F3F3F3]">
          <p class="text-gray-600 font-light mb-4">
            Interested in collaborating on a technical book or publication?
          </p>
          <NuxtLink
            to="/contact"
            class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            Get in Touch ->
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
```

---

### Task 5: Add nav link

**Files:**
- Modify: `apps/web/app/components/HeaderNav.vue:6-17`

- [ ] **Step 1: Add PUBLICATIONS to nav links**

Edit the `links` array in `apps/web/app/components/HeaderNav.vue`. Change from:

```ts
const links = [
  { name: 'HOME', to: '/' },
  { name: 'BLOG', to: '/blog' },
  { name: 'PROJECTS', to: '/projects' },
  { name: 'GALLERY', to: '/gallery' },
  { name: 'EXPLORE', to: '/explore' },
  { name: 'ABOUT', to: '/about' },
  { name: 'STATS', to: '/stats' },
  { name: 'GUESTBOOK', to: '/guestbook' },
  { name: 'USES', to: '/uses' },
  { name: 'CONTACT', to: '/contact' },
]
```

To:

```ts
const links = [
  { name: 'HOME', to: '/' },
  { name: 'BLOG', to: '/blog' },
  { name: 'PROJECTS', to: '/projects' },
  { name: 'PUBLICATIONS', to: '/publications' },
  { name: 'GALLERY', to: '/gallery' },
  { name: 'EXPLORE', to: '/explore' },
  { name: 'ABOUT', to: '/about' },
  { name: 'STATS', to: '/stats' },
  { name: 'GUESTBOOK', to: '/guestbook' },
  { name: 'USES', to: '/uses' },
  { name: 'CONTACT', to: '/contact' },
]
```

---

### Task 6: Verify and test

- [ ] **Step 1: Run dev server and verify**

```bash
cd apps/web && npm run dev
```

- Navigate to `http://localhost:3000/publications`
- Verify: Hero section renders with red dot badge
- Verify: Book cover image displays with bordered frame treatment
- Verify: Metadata badges (format, pages, date) render
- Verify: "Buy on Amazon" button links correctly
- Verify: Table of contents renders as numbered list
- Verify: Nav shows PUBLICATIONS link after PROJECTS

- [ ] **Step 2: Test responsive layout**

- Resize browser to mobile width
- Verify: Two-column layout stacks to single column
- Verify: Nav shows in mobile sheet menu

- [ ] **Step 3: Run build**

```bash
cd apps/web && npm run build
```

Verify build succeeds with no errors.
