<script setup lang="ts">
const route = useRoute();
const slug = computed(() => {
  const param = route.params.slug;
  return Array.isArray(param) ? param.join("/") : param;
});
const slugValue = computed(() => slug.value || "");

const { data: post } = await useAsyncData("post-" + route.path, () => {
  return queryCollection("blog").path(route.path).first() as Promise<any>;
});

const { data: surround } = await useAsyncData("surround-" + route.path, () => {
  return queryCollectionItemSurroundings("blog", route.path, {
    fields: ["title", "path"],
  }) as Promise<any[]>;
});

const prev = computed(() => surround.value?.[0]);
const next = computed(() => surround.value?.[1]);

const readingTime = computed(() => {
  if (post.value?.readTime) return post.value.readTime;
  if (post.value?.body) {
    const text = JSON.stringify(post.value.body);
    const words = text.match(/\w+/g)?.length || 0;
    return Math.ceil(words / 200);
  }
  return 1;
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
const canonicalUrl = computed(() => post.value?.canonical || `${requestOrigin.value}${route.path}`);
const ogImage = computed(() => post.value?.ogImage || post.value?.img || "");

function formatDate(date: string | Date | undefined) {
  if (!date) return "";
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString("en", options);
}

useSeoMeta({
  title: () => (post.value?.title ? `${post.value.title} | VantolBennett` : "VantolBennett"),
  description: () => post.value?.description || "",
  ogTitle: () => post.value?.title || "",
  ogDescription: () => post.value?.description || "",
  ogImage: () => ogImage.value,
  ogUrl: () => canonicalUrl.value,
  twitterCard: "summary_large_image",
  twitterTitle: () => post.value?.title || "",
  twitterDescription: () => post.value?.description || "",
  twitterImage: () => ogImage.value,
});

useHead(() => {
  const jsonLd = post.value
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.value.title,
        description: post.value.description,
        image: ogImage.value ? [ogImage.value] : undefined,
        datePublished: post.value.date || post.value.createdAt,
        dateModified: post.value.updatedAt || post.value.date || post.value.createdAt,
        author: post.value.author?.name
          ? {
              "@type": "Person",
              name: post.value.author.name,
              url: post.value.author.website || undefined,
            }
          : undefined,
        mainEntityOfPage: canonicalUrl.value,
      }
    : null;

  return {
    link: [{ rel: "canonical", href: canonicalUrl.value }],
    script: jsonLd ? [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }] : [],
  };
});
</script>

<template>
  <div v-if="post" class="min-h-screen bg-[#0a0a0a] text-white font-sans">
    <ReadingProgress />
    <div class="max-w-[1088px] mx-auto px-6 py-12">
      <div class="lg:flex gap-12">
        <!-- Sidebar / TOC -->
        <aside class="hidden lg:block w-64 shrink-0">
          <div class="sticky top-24 border border-white/10 bg-[#111] rounded-xl p-6">
            <h3
              class="text-[11px] font-bold uppercase tracking-widest mb-4 pb-2 border-b border-white/10 text-zinc-500"
            >
              Contents
            </h3>
            <nav class="text-sm">
              <ul class="space-y-2">
                <li v-for="link of post.body?.toc?.links || []" :key="link.id">
                  <NuxtLink
                    :to="`#${link.id}`"
                    class="block text-zinc-500 hover:text-white transition-colors text-xs"
                    :class="{
                      'pl-0': link.depth === 2,
                      'pl-4': link.depth === 3,
                    }"
                    >{{ link.text }}</NuxtLink
                  >
                </li>
              </ul>
            </nav>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="flex-auto min-w-0">
          <article class="bg-[#111] border border-white/10 rounded-xl p-8 md:p-12">
            <!-- Header -->
            <header class="mb-12 border-b border-white/10 pb-8">
              <div class="flex flex-wrap items-center gap-3 mb-6">
                <NuxtLink
                  :to="`/blog?tag=${post.tag}`"
                  class="px-2.5 py-1 bg-[#f5c542] text-black text-[10px] font-bold uppercase tracking-widest rounded-md hover:bg-[#e0b13a] transition-colors"
                >
                  {{ post.tag }}
                </NuxtLink>
                <span class="text-xs text-zinc-500">{{
                  formatDate(post.date || post.createdAt)
                }}</span>
                <span class="text-xs text-zinc-600">• {{ readingTime }} min read</span>
                <span class="text-xs text-zinc-700">|</span>
                <ViewCounter :slug="slugValue" />
                <PresenceIndicator :slug="slugValue" />
                <ReactionButton :slug="slugValue" />
              </div>

              <h1 class="text-3xl md:text-5xl font-semibold tracking-tight mb-8 leading-tight">
                {{ post.title }}
              </h1>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <NuxtImg
                    :src="post.author?.img || post.img"
                    :alt="post.author?.name || post.title"
                    width="40"
                    height="40"
                    class="h-10 w-10 rounded-full border border-white/10"
                  />
                  <div>
                    <p class="text-xs font-bold uppercase tracking-wider text-white">
                      By {{ post.author?.name }}
                    </p>
                    <p class="text-xs text-zinc-500">Author</p>
                  </div>
                </div>
                <BookmarkButton :slug="slugValue" :title="post.title" />
              </div>
            </header>

            <!-- Hero Image -->
            <div class="mb-12 rounded-xl overflow-hidden bg-zinc-900">
              <NuxtImg
                :src="post.img"
                :alt="post.title"
                sizes="100vw"
                class="w-full h-auto object-cover"
              />
            </div>

            <!-- Content -->
            <div
              class="prose prose-invert max-w-none font-light prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-[#f5c542] prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-code:text-[#f5c542] prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-white/10"
            >
              <ContentRenderer :value="post" />
            </div>

            <!-- Footer -->
            <div class="mt-12 pt-8 border-t border-white/10">
              <div class="flex flex-col sm:flex-row justify-between items-center gap-6">
                <div class="w-full sm:w-auto">
                  <h4 class="text-xs font-bold uppercase tracking-widest mb-4 text-zinc-500">
                    Share this post
                  </h4>
                  <ShareButtons :title="post.title" :description="post.description" />
                </div>

                <div
                  class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end"
                >
                  <PrevNext :prev="prev" :next="next" />
                </div>
              </div>

              <div class="mt-12">
                <Newsletter />
              </div>
            </div>

            <!-- Comments Section -->
            <div class="mt-12">
              <RealtimeComments :slug="slugValue" />
            </div>
          </article>

          <div class="mt-12">
            <h3 class="text-xl font-semibold mb-6">Related Posts</h3>
            <RelatedPosts
              :current-slug="route.params.slug as string"
              :current-tag="post.tag"
              :current-keywords="post.keywords"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles for the post article */
</style>
