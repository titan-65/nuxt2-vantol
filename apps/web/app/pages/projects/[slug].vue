<script setup lang="ts">
const route = useRoute();
const { data: project } = await useAsyncData("project-" + route.path, () => {
  return queryCollection("projects").path(route.path).first() as Promise<any>;
});

const runtimeConfig = useRuntimeConfig();
const requestOrigin = computed(() => {
  if (import.meta.server) {
    try {
      return useRequestURL().origin;
    } catch {
      return runtimeConfig.public.siteUrl || "";
    }
  }
  return runtimeConfig.public.siteUrl || "";
});
const canonicalUrl = computed(() => `${requestOrigin.value}${route.path}`);
const ogImage = computed(() => project.value?.image || "");

useSeoMeta({
  title: () =>
    project.value?.title
      ? `${project.value.title} | Projects | VantolBennett`
      : "Projects | VantolBennett",
  description: () => project.value?.preview || "",
  ogTitle: () => project.value?.title || "",
  ogDescription: () => project.value?.preview || "",
  ogImage: () => ogImage.value,
  ogUrl: () => canonicalUrl.value,
  twitterCard: "summary_large_image",
  twitterTitle: () => project.value?.title || "",
  twitterDescription: () => project.value?.preview || "",
  twitterImage: () => ogImage.value,
});

useHead(() => {
  const jsonLd = project.value
    ? {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: project.value.title,
        description: project.value.preview,
        image: ogImage.value ? [ogImage.value] : undefined,
        url: canonicalUrl.value,
        datePublished: project.value.date || project.value.createdAt,
        dateModified: project.value.updatedAt || project.value.date || project.value.createdAt,
      }
    : null;

  return {
    link: [{ rel: "canonical", href: canonicalUrl.value }],
    script: jsonLd ? [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }] : [],
  };
});
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a] text-white font-sans">
    <div class="max-w-[1088px] mx-auto px-6 py-12">
      <div v-if="project" class="max-w-4xl mx-auto">
        <div class="mb-8">
          <NuxtLink
            to="/projects"
            class="text-xs font-bold uppercase tracking-widest hover:text-[#f5c542] transition-colors flex items-center gap-2 mb-6 text-zinc-400"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Projects
          </NuxtLink>

          <div class="bg-[#111] border border-white/10 rounded-xl p-8 md:p-12">
            <h1 class="text-3xl md:text-5xl font-semibold tracking-tight mb-6">
              {{ project.title }}
            </h1>

            <div class="flex flex-wrap gap-4 mb-8 text-xs text-zinc-500 uppercase">
              <div v-if="project.stack?.Frontend">
                <span class="font-bold text-zinc-300">Frontend:</span> {{ project.stack.Frontend }}
              </div>
              <div v-if="project.stack?.Backend">
                <span class="font-bold text-zinc-300">Backend:</span> {{ project.stack.Backend }}
              </div>
              <div v-if="project.tag">
                <span class="font-bold text-zinc-300">Tag:</span> {{ project.tag }}
              </div>
            </div>

            <div class="mb-8 rounded-xl overflow-hidden bg-zinc-900">
              <img
                :src="project.image"
                :alt="project.title"
                width="1600"
                height="900"
                class="w-full h-auto object-cover"
              />
            </div>

            <div
              class="prose prose-invert max-w-none font-light prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-[#f5c542] prose-strong:text-white prose-code:text-[#f5c542] prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-white/10"
            >
              <ContentRenderer :value="project" />
            </div>

            <div class="mt-12 pt-8 border-t border-white/10 flex gap-4">
              <a
                v-if="project.url"
                :href="project.url"
                target="_blank"
                class="px-6 py-3 bg-[#f5c542] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#e0b13a] transition-colors rounded-lg"
              >
                View Live Site
              </a>
              <a
                v-if="project.git"
                :href="project.git"
                target="_blank"
                class="px-6 py-3 border border-white/10 text-zinc-300 text-xs font-bold uppercase tracking-widest hover:bg-white/5 hover:border-white/20 transition-colors rounded-lg"
              >
                View Source
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
