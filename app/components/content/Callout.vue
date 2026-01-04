<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string
}>()
</script>

<template>
  <div class="my-8 border border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
    <div v-if="title" class="mb-4">
      <h4 class="text-xs font-bold uppercase tracking-[0.2em] text-black border-b border-black/10 pb-2 flex items-center gap-2">
        <span v-if="icon" class="text-lg">{{ icon }}</span>
        {{ title }}
      </h4>
    </div>
    <div class="prose prose-sm prose-neutral max-w-none italic text-gray-700">
      <slot />
    </div>
  </div>
</template>
