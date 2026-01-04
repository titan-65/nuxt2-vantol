<script setup lang="ts">
defineProps<{
  author: {
    name: string
    img: string
    website?: string
  }
}>()
</script>

<template>
  <div class="flex items-center gap-4 my-12 border-t border-black/10 pt-12">
    <NuxtLink :to="`/blog/author/${author?.name}`" class="flex items-center gap-4 group">
      <div class="relative">
        <img
          :src="author?.img"
          :alt="author?.name"
          class="h-20 w-24 border border-black/10 grayscale group-hover:grayscale-0 transition-all duration-500 object-cover"
        />
        <div class="absolute -bottom-2 -right-2 w-6 h-6 bg-black text-white flex items-center justify-center border-2 border-white">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      </div>
      <div>
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Written by</p>
        <p class="text-xl font-medium text-black group-hover:underline decoration-1 underline-offset-4 transition-colors">
          {{ author?.name }}
        </p>
        <p v-if="author?.website" class="text-xs font-mono text-gray-500 mt-1 uppercase tracking-widest">
          {{ author.website }}
        </p>
      </div>
    </NuxtLink>
  </div>
</template>
