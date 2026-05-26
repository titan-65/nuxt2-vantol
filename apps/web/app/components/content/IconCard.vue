<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: 'Default title'
  },
  description: {
    type: String,
    default: 'Default description'
  },
  icon: {
    type: String,
    default: 'i-lucide-box'
  }
})
</script>

<template>
  <div class="p-6 border border-white/10 bg-[#111] hover:border-white/20 transition-colors group my-6 rounded-xl">
    <div class="w-12 h-12 flex items-center justify-center bg-[#0a0a0a] border border-white/10 rounded-lg mb-4 group-hover:border-white/20 transition-colors">
      <div :class="icon" class="w-6 h-6 text-[#f5c542]" />
    </div>
    <h2 class="text-xl font-semibold mb-2 tracking-tight">
      {{ title }}
    </h2>
    <p class="text-sm text-zinc-500 font-light leading-relaxed">
      {{ description }}
    </p>
    <div v-if="$slots.default" class="mt-4 pt-4 border-t border-white/10 prose prose-invert prose-sm max-w-none">
      <slot />
    </div>
  </div>
</template>
