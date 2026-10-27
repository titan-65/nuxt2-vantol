<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";

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

const tocLinks = computed(
  () => (post.value?.body?.toc?.links || []).filter((link: any) => link.depth <= 3) as any[],
);

const readingTime = computed(() => {
  if (post.value?.readTime) return post.value.readTime;
  if (post.value?.body) {
    const text = JSON.stringify(post.value.body);
    const words = text.match(/\w+/g)?.length || 0;
    return Math.max(1, Math.ceil(words / 200));
  }
  return 1;
});

const runtimeConfig = useRuntimeConfig();
const requestOrigin = computed(() => {
  const configured = String(runtimeConfig.public.siteUrl || "").replace(/\/$/, "");
  if (configured) return configured;

  if (import.meta.server) {
    try {
      return useRequestURL().origin;
    } catch {
      return "";
    }
  }
  return "";
});
const canonicalUrl = computed(
  () => post.value?.canonical || `${requestOrigin.value}${route.path}`,
);
const ogImage = computed(() => post.value?.ogImage || post.value?.img || "");

function formatDate(date: string | Date | undefined) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function tagLabel(tag: string | undefined) {
  return (tag || "").replace(/^["'“”\s]+|["'“”\s]+$/g, "").trim();
}

function isoDate(date: string | Date | undefined) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

const activeHeading = ref("");
let headingObserver: IntersectionObserver | null = null;

onMounted(async () => {
  await nextTick();
  const headings = Array.from(
    document.querySelectorAll<HTMLElement>(".article-prose h2[id], .article-prose h3[id]"),
  );
  if (!headings.length) return;

  headingObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) activeHeading.value = visible[0].target.id;
    },
    { rootMargin: "-18% 0px -68% 0px" },
  );

  headings.forEach((heading) => headingObserver?.observe(heading));
});

onBeforeUnmount(() => {
  headingObserver?.disconnect();
});

useSeoMeta({
  title: () => (post.value?.title ? `${post.value.title} | Vantol Bennett` : "Vantol Bennett"),
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
    script: jsonLd ? [{ type: "application/ld+json", innerHTML: JSON.stringify(jsonLd) }] : [],
  };
});
</script>

<template>
  <div v-if="post" class="reading-page pb-8">
    <ReadingProgress />

    <div class="container-page pt-12 md:pt-20">
      <nav
        class="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <NuxtLink to="/blog" class="link hover:text-foreground">Writing</NuxtLink>
        <span aria-hidden="true">/</span>
        <NuxtLink :to="`/blog?tag=${encodeURIComponent(tagLabel(post.tag))}`" class="link hover:text-foreground">{{
          tagLabel(post.tag)
        }}</NuxtLink>
      </nav>

      <header class="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div class="lg:col-span-9">
          <p class="ledger-meta">
            <time :datetime="isoDate(post.date || post.createdAt)">{{
              formatDate(post.date || post.createdAt)
            }}</time>
            <span aria-hidden="true"> · </span>
            {{ readingTime }} min read
          </p>

          <h1
            class="display mt-4 max-w-[22ch] text-[clamp(2.8rem,5vw,4rem)]"
          >
            {{ post.title }}
          </h1>

          <p
            class="mt-6 max-w-2xl text-[clamp(1.1rem,1.6vw,1.35rem)] leading-[1.6] text-muted-foreground"
          >
            {{ post.description }}
          </p>

          <div
            class="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-border pt-4"
          >
            <div class="flex items-center gap-3">
              <NuxtImg
                v-if="post.author?.img"
                :src="post.author.img"
                :alt="post.author.name"
                width="36"
                height="36"
                class="h-9 w-9 border border-border object-cover grayscale"
              />
              <div>
                <p class="text-[13px] font-medium">{{ post.author?.name || "Vantol Bennett" }}</p>
                <p class="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  {{ post.author?.title || "Educator / Developer" }}
                </p>
              </div>
            </div>

            <BookmarkButton :slug="slugValue" :title="post.title" />
          </div>
        </div>

      </header>
    </div>

    <div class="container-page mt-10 grid gap-10 lg:grid-cols-12 lg:gap-10">
      <aside class="hidden lg:col-span-2 lg:block">
        <div class="sticky top-24 space-y-6">
          <div>
            <p class="label">Published</p>
            <p class="mt-1.5 text-[12px] text-muted-foreground">
              <time :datetime="isoDate(post.date || post.createdAt)">{{
                formatDate(post.date || post.createdAt)
              }}</time>
            </p>
          </div>
          <div>
            <p class="label">Reading</p>
            <p class="mt-1.5 text-[12px] text-muted-foreground">{{ readingTime }} minutes</p>
          </div>
          <div>
            <p class="label">Tag</p>
            <NuxtLink
              :to="`/blog?tag=${encodeURIComponent(tagLabel(post.tag))}`"
              class="link mt-1.5 inline-block text-[12px] text-muted-foreground hover:text-foreground"
            >
              {{ tagLabel(post.tag) }}
            </NuxtLink>
          </div>
          <div>
            <p class="label">Share</p>
            <ShareButtons :title="post.title" :description="post.description" class="mt-2" />
          </div>
        </div>
      </aside>

      <article class="min-w-0 lg:col-span-7">
        <details class="mb-8 border-y border-border py-3 lg:hidden">
          <summary class="label cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            Contents
            <span class="ml-2 font-mono text-[10px] text-faint-ink">({{ tocLinks.length }})</span>
          </summary>
          <nav class="mt-3 space-y-2" aria-label="Table of contents">
            <NuxtLink
              v-for="link in tocLinks"
              :key="`mobile-${link.id}`"
              :to="`#${link.id}`"
              class="block text-[13px] leading-snug text-muted-foreground hover:text-foreground"
              :class="link.depth === 3 ? 'pl-3' : ''"
            >
              {{ link.text }}
            </NuxtLink>
          </nav>
        </details>

        <div class="article-prose font-feature-reading">
          <ContentRenderer :value="post" />
        </div>

        <div class="mt-12 border-t border-border pt-6">
          <ShareButtons :title="post.title" :description="post.description" />
        </div>

        <div class="mt-10 border-t border-border pt-6">
          <PrevNext :prev="prev" :next="next" />
        </div>

        <div class="mt-8 flex items-center gap-5 border-t border-border pt-4">
          <ViewCounter :slug="slugValue" />
          <ReactionButton :slug="slugValue" />
          <PresenceIndicator :slug="slugValue" />
        </div>
      </article>

      <aside class="hidden lg:col-span-3 lg:block">
        <div class="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
          <div class="border-t border-border pt-4">
            <p class="label">In this essay</p>
            <nav class="mt-3 space-y-2" aria-label="Table of contents">
              <NuxtLink
                v-for="link in tocLinks"
                :key="link.id"
                :to="`#${link.id}`"
                class="block text-[12px] leading-snug transition-colors"
                :class="[
                  link.depth === 3 ? 'pl-3' : '',
                  activeHeading === link.id
                    ? 'font-medium text-blue'
                    : 'text-muted-foreground hover:text-foreground',
                ]"
                :aria-current="activeHeading === link.id ? 'location' : undefined"
              >
                {{ link.text }}
              </NuxtLink>
            </nav>
          </div>
          <div class="mt-8 border-t border-border pt-4">
            <p class="label">Notes</p>
            <p class="mt-3 text-[14px] leading-relaxed text-muted-foreground">
              This is a field note, not a finished manual. If something here is wrong or out of
              date, the guestbook and comments are open.
            </p>
          </div>
          <div class="mt-8 border-t border-border pt-4">
            <p class="label">Reading progress</p>
            <p class="mt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-faint-ink">
              {{ readingTime }} minutes · {{ tocLinks.length }} sections
            </p>
          </div>
        </div>
      </aside>
    </div>

    <section class="container-page mt-16">
      <Newsletter />
    </section>

    <div class="container-page mt-16 grid gap-12 lg:grid-cols-12 lg:gap-16">
      <section class="lg:col-span-8" aria-labelledby="comments-heading">
        <h2 id="comments-heading" class="text-[22px] font-medium tracking-[-0.035em]">Comments</h2>
        <p class="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Questions, corrections, and war stories are welcome. Sign in to join the thread.
        </p>
        <div class="mt-6">
          <RealtimeComments :slug="slugValue" />
        </div>
      </section>

      <aside class="lg:col-span-4">
        <h2 class="text-[22px] font-medium tracking-[-0.035em]">Related reading</h2>
        <p class="mt-2 font-serif text-[15px] leading-relaxed text-muted-foreground">
          More from the same corner of the field.
        </p>
        <div class="mt-6">
          <RelatedPosts
            :current-slug="route.params.slug as string"
            :current-tag="post.tag"
            :current-keywords="post.keywords"
          />
        </div>
      </aside>
    </div>
  </div>
</template>
