<script setup lang="ts">
defineProps({
  src: {
    type: String,
    default: "",
  },
  alt: {
    type: String,
    default: "",
  },
  width: {
    type: [String, Number],
    default: undefined,
  },
  height: {
    type: [String, Number],
    default: undefined,
  },
});
</script>

<template>
  <figure class="my-8">
    <NuxtImg
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      sizes="(min-width: 1024px) 720px, 100vw"
      class="w-full rounded-lg border border-border object-cover"
    />
    <figcaption
      v-if="alt"
      class="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-faint-ink"
    >
      {{ alt }}
    </figcaption>
  </figure>
</template>
