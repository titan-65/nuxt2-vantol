<script setup lang="ts">
const props = defineProps<{
  slug: string
}>()

const { activeReaders, init, joinPost, cleanup } = usePresence(props.slug)

onMounted(() => {
  init()
  joinPost()
})

onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div 
    v-if="activeReaders > 0" 
    class="inline-flex items-center gap-1.5 text-xs font-mono text-gray-500"
  >
    <span class="relative flex h-2 w-2">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
    </span>
    <span class="tabular-nums">
      {{ activeReaders }} {{ activeReaders === 1 ? 'person' : 'people' }} reading
    </span>
  </div>
</template>
