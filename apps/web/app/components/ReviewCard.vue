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
