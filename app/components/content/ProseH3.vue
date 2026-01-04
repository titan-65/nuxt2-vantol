<script setup lang="ts">
defineProps<{ id: string }>()
</script>

<template>
  <h3 :id="id" class="text-xl font-bold mt-8 mb-4 tracking-tight group flex items-center gap-2">
    <slot />
    <a :href="`#${id}`" class="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 text-sm font-mono">#</a>
  </h3>
</template>
