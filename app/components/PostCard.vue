<script setup lang="ts">
const props = defineProps<{
  item: {
    title: string
    description: string
    tag: string
    language: string
    slug: string
    img: string
    readTime?: number
    rating: number
    path: string
    body?: any
    excerpt?: any
  }
}>()

const readingTime = computed(() => {
  if (props.item.readTime) return props.item.readTime
  // Fallback calculation if body is available
  if (props.item.body) {
    const text = JSON.stringify(props.item.body)
    const words = text.match(/\w+/g)?.length || 0
    return Math.ceil(words / 200)
  }
  return 1 // Default
})
</script>

<template>
  <div class="group h-full flex flex-col border border-black/20 bg-white hover:border-black transition-all duration-300">
    <!-- Image Container -->
    <div class="relative h-48 overflow-hidden border-b border-black/20 group-hover:border-black transition-colors">
      <img
        :src="item.img"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter grayscale group-hover:grayscale-0"
        :alt="item.title"
      />
      <div class="absolute top-2 left-2">
        <span class="inline-block bg-white border border-black/20 px-2 py-1 text-xs font-mono uppercase tracking-wider">
          {{ item.tag }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 p-4 flex flex-col">
      <div class="flex justify-between items-start mb-3">
        <h3 class="text-lg font-bold leading-tight group-hover:underline decoration-1 underline-offset-4">
          {{ item.title }}
        </h3>
        <span class="ml-2 px-1.5 py-0.5 text-[10px] font-mono border border-black/20 uppercase">
          {{ item.language }}
        </span>
      </div>

      <div class="text-sm text-gray-600 line-clamp-3 mb-4 font-light flex-1 excerpt-content">
        <ContentRenderer v-if="item.excerpt" :value="item.excerpt" />
        <p v-else>
          {{ item.description }}
        </p>
      </div>

      <!-- Footer Info -->
      <div class="flex items-center justify-between pt-4 border-t border-black/10 mt-auto">
        <div class="flex items-center gap-4 text-xs font-mono text-gray-500">
          <span class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ readingTime }} min
          </span>
        </div>

        <NuxtLink
          :to="`/blog/${item.slug}`"
          class="text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white px-3 py-1 transition-colors border border-transparent hover:border-black"
        >
          Read ->
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
