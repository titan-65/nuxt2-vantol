<script setup lang="ts">
defineProps<{
  gap?: string
}>()
</script>

<template>
  <div 
    class="flex flex-wrap my-8"
    :class="[gap ? `gap-${gap}` : 'gap-4']"
  >
    <div class="flex flex-wrap items-center gap-4">
      <slot />
    </div>
  </div>
</template>
