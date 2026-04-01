<script setup lang="ts">
const props = defineProps<{
  slug: string
}>()

const { views, loading, init, trackView } = useRealtimeViews(props.slug)

onMounted(async () => {
  init()
  await trackView()
})

onUnmounted(() => {
  // Cleanup handled by composable
})
</script>

<template>
  <div class="inline-flex items-center gap-1.5 text-xs font-mono text-gray-500">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="text-gray-400"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
    <span v-if="loading" class="animate-pulse">...</span>
    <span v-else class="tabular-nums">{{ views.toLocaleString() }} {{ views === 1 ? 'view' : 'views' }}</span>
  </div>
</template>
