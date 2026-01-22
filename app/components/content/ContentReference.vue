<script setup lang="ts">
defineProps<{
  index?: number | string
}>()
</script>

<template>
  <span class="sr-only" data-content-reference>
    <slot />
  </span>
</template>
