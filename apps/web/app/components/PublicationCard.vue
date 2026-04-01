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
