<script setup lang="ts">
defineProps({
  src: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: ''
  },
  width: {
    type: [String, Number],
    default: undefined
  },
  height: {
    type: [String, Number],
    default: undefined
  }
})
</script>

<template>
  <div class="my-8 border border-black/10 p-2 bg-gray-50 flex flex-col items-center">
    <img
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      class="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-500"
      loading="lazy"
    />
    <p v-if="alt" class="mt-2 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
      {{ alt }}
    </p>
  </div>
</template>
