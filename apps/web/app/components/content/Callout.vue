<script setup lang="ts">
defineProps<{
  icon?: string;
  title?: string;
}>();
</script>

<template>
  <div class="my-8 border border-white/10 p-6 bg-[#111] rounded-xl">
    <div v-if="title" class="mb-4">
      <h4
        class="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 border-b border-white/10 pb-2 flex items-center gap-2"
      >
        <span v-if="icon" class="text-lg">{{ icon }}</span>
        {{ title }}
      </h4>
    </div>
    <div class="prose prose-sm prose-invert max-w-none italic text-zinc-400">
      <slot />
    </div>
  </div>
</template>
