<script setup lang="ts">
defineProps<{
  quote: string;
  author: string;
  source: string;
}>();
</script>

<template>
  <div
    class="bg-[#111] border border-white/10 rounded-xl p-8 relative overflow-hidden group hover:border-white/20 transition-colors"
  >
    <div
      class="absolute top-0 left-0 w-1 h-full bg-zinc-800 group-hover:bg-[#f5c542] transition-colors"
    ></div>
    <blockquote
      class="text-xl md:text-2xl font-medium leading-tight mb-6 relative z-10 text-zinc-200"
    >
      "{{ quote }}"
    </blockquote>
    <div class="flex items-center gap-3">
      <div>
        <div class="font-bold text-sm uppercase tracking-wider">{{ author }}</div>
        <div class="font-mono text-xs text-zinc-500 uppercase mt-0.5">{{ source }}</div>
      </div>
    </div>
  </div>
</template>
