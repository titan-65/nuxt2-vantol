<script setup lang="ts">
defineProps<{
  prev: {
    title: string
    path: string
  } | null
  next: {
    title: string
    path: string
  } | null
}>()

const getSlug = (path: string | undefined) => path?.split('/').pop() || ''
</script>

<template>
  <div class="flex justify-between gap-4">
    <NuxtLink
      v-if="prev"
      :to="`/blog/${getSlug(prev.path)}`"
      class="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
      </svg>
      <span class="font-medium line-clamp-1">{{ prev.title }}</span>
    </NuxtLink>
    <span v-else>&nbsp;</span>
    <NuxtLink
      v-if="next"
      :to="`/blog/${getSlug(next.path)}`"
      class="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
    >
      <span class="font-medium line-clamp-1">{{ next.title }}</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
      </svg>
    </NuxtLink>
    <span v-else>&nbsp;</span>
  </div>
</template>
