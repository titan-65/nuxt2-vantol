<script setup lang="ts">
defineProps<{ id: string }>()
</script>

<template>
  <h1 :id="id" class="text-3xl md:text-5xl font-medium tracking-tight mb-8 leading-tight">
    <slot />
  </h1>
</template>
