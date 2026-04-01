<script setup lang="ts">
const props = defineProps<{
  slug: string
}>()

const { likeCount, hasLiked, loading, init, toggleLike } = useReactions(props.slug)

onMounted(() => {
  init()
})

const animating = ref(false)

const handleLike = async () => {
  animating.value = true
  await toggleLike()
  setTimeout(() => {
    animating.value = false
  }, 300)
}
</script>

<template>
  <ClientOnly>
    <button 
      @click="handleLike"
      class="group flex items-center gap-1.5 text-xs font-mono transition-colors"
      :class="hasLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'"
      :disabled="loading"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        :fill="hasLiked ? 'currentColor' : 'none'"
        stroke="currentColor" 
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="transition-transform"
        :class="{ 'scale-125': animating }"
      >
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
      </svg>
      <span>{{ loading ? '...' : likeCount }}</span>
    </button>
    <template #fallback>
      <span class="text-xs font-mono text-gray-400">...</span>
    </template>
  </ClientOnly>
</template>
