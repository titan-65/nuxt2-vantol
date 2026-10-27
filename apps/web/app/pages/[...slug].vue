<script setup lang="ts">
const route = useRoute();

const { data: page } = await useAsyncData("catchall-" + route.path, async () => {
  try {
    const standalonePage = await queryCollection("pages").path(route.path).first();
    if (standalonePage) return standalonePage;
  } catch (e) {}

  try {
    const blogPage = await queryCollection("blog").path(route.path).first();
    if (blogPage) return blogPage;
  } catch (e) {}

  try {
    const projectPage = await queryCollection("projects").path(route.path).first();
    if (projectPage) return projectPage;
  } catch (e) {}

  return null;
});

if (!page.value && !import.meta.dev) {
  throw createError({ statusCode: 404, statusMessage: "Page not found" });
}
</script>

<template>
  <main class="min-h-screen bg-background text-foreground font-sans">
    <div class="max-w-[1088px] mx-auto px-6 py-12">
      <div
        v-if="page"
        class="bg-card border border-border rounded-xl p-8 md:p-12 max-w-4xl mx-auto"
      >
        <h1 class="text-4xl font-semibold tracking-tight mb-8">{{ page.title }}</h1>
        <div
          class="prose  max-w-none font-light prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-blue prose-strong:text-foreground"
        >
          <ContentRenderer :value="page" />
        </div>
      </div>
      <div
        v-else
        class="text-center py-20 border border-border bg-card rounded-xl max-w-4xl mx-auto"
      >
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Error 404</p>
        <h1 class="text-2xl font-mono uppercase tracking-widest mb-8">Page Not Found</h1>
        <NuxtLink
          to="/"
          class="inline-block border border-border px-6 py-3 text-xs font-bold uppercase hover:bg-accent hover:border-border-strong transition-all rounded-lg text-foreground"
        >
          Back Home
        </NuxtLink>
      </div>
    </div>
  </main>
</template>
