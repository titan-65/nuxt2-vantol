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
  <div class="my-8 border border-white/10 p-2 bg-zinc-900 rounded-xl flex flex-col items-center">
    <NuxtImg
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      sizes="100vw"
      class="w-full h-auto object-cover rounded-lg"
    />
    <p v-if="alt" class="mt-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
      {{ alt }}
    </p>
  </div>
</template>