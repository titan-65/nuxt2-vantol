<script setup lang="ts">
const route = useRoute()

await navigateTo(`/blog/${route.params.slug}`, { replace: true })
</script>

<template>
  <div />
</template>
