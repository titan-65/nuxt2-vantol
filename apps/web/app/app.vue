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
        const dark = stored ? stored === 'dark' : true
        document.documentElement.classList.toggle('dark', dark)
        document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
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
