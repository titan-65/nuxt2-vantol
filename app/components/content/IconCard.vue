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
  <div class="p-6 border border-black/10 bg-white hover:border-black transition-colors group my-6">
    <div class="w-12 h-12 flex items-center justify-center bg-[#F3F3F3] border border-black/10 mb-4 group-hover:border-black transition-colors">
      <div :class="icon" class="w-6 h-6 text-black" />
    </div>
    <h2 class="text-xl font-bold mb-2 tracking-tight">
      {{ title }}
    </h2>
    <p class="text-sm text-gray-600 font-light leading-relaxed">
      {{ description }}
    </p>
    <div v-if="$slots.default" class="mt-4 pt-4 border-t border-black/5 prose prose-sm max-w-none">
      <slot />
    </div>
  </div>
</template>
