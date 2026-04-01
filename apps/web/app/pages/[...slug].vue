<script setup lang="ts">
const route = useRoute()

// Attempt to find a page in any collection that matches the current path
const { data: page } = await useAsyncData('catchall-' + route.path, async () => {
  // We check collections in order of specificity/likelihood
  // 1. Standalone pages (hello.md, etc.)
  // 2. Blog posts
  // 3. Projects
  try {
    const standalonePage = await queryCollection('pages').path(route.path).first()
    if (standalonePage) return standalonePage
  } catch (e) {}

  try {
    const blogPage = await queryCollection('blog').path(route.path).first()
    if (blogPage) return blogPage
  } catch (e) {}

  try {
    const projectPage = await queryCollection('projects').path(route.path).first()
    if (projectPage) return projectPage
  } catch (e) {}

  return null
})

if (!page.value && !import.meta.dev) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}
</script>

<template>
  <main class="container mx-auto px-6 py-12">
    <div v-if="page" class="bg-white border border-black/20 p-8 md:p-12 max-w-4xl mx-auto">
      <h1 class="text-4xl font-medium tracking-tight mb-8">{{ page.title }}</h1>
      <div class="prose prose-neutral max-w-none font-light">
        <ContentRenderer :value="page" />
      </div>
    </div>
    <div v-else class="text-center py-20 border border-black/10 bg-white max-w-4xl mx-auto">
      <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Error 404</p>
      <h1 class="text-2xl font-mono uppercase tracking-widest mb-8">Page Not Found</h1>
      <NuxtLink to="/" class="inline-block border border-black px-6 py-3 text-xs font-bold uppercase hover:bg-black hover:text-white transition-all">
        Back Home
      </NuxtLink>
    </div>
  </main>
</template>
