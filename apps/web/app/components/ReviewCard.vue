<script setup lang="ts">
defineProps<{
  quote: string;
  author: string;
  source: string;
}>();
</script>

<template>
  <div
    class="bg-card border border-border rounded-xl p-8 relative overflow-hidden group hover:border-border-strong transition-colors"
  >
    <div
      class="absolute top-0 left-0 w-1 h-full bg-muted group-hover:bg-brand transition-colors"
    ></div>
    <blockquote
      class="text-xl md:text-2xl font-medium leading-tight mb-6 relative z-10 text-foreground"
    >
      "{{ quote }}"
    </blockquote>
    <div class="flex items-center gap-3">
      <div>
        <div class="font-bold text-sm uppercase tracking-wider">{{ author }}</div>
        <div class="font-mono text-xs text-muted-foreground uppercase mt-0.5">{{ source }}</div>
      </div>
    </div>
  </div>
</template>
