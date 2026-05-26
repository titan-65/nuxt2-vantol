<script setup lang="ts">
import { Analytics } from "@vercel/analytics/nuxt";

useHead({
  htmlAttrs: {
    class: "scroll-smooth",
  },
  script: [
    {
      innerHTML: `(() => {
        const stored = localStorage.getItem('colorMode')
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        document.documentElement.classList.toggle('dark', stored ? stored === 'dark' : prefersDark)
      })()`,
      tagPosition: "head",
    },
  ],
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <CommandPalette />
  <Analytics />
</template>
