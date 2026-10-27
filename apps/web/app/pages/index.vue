<script setup lang="ts">
const { data: posts } = await useAsyncData("home-posts", async () => {
  const items = (await queryCollection("blog").order("date", "DESC").limit(7).all()) as any[];
  return items.map((post) => ({
    ...post,
    slug: post.path?.split("/").pop(),
  }));
});

const { data: series } = await useAsyncData("home-series", async () => {
  const items = (await queryCollection("tutorials").all()) as any[];
  return items
    .filter((doc: any) => !doc.order && doc.path?.split("/").filter(Boolean).length === 2)
    .map((doc: any) => ({ ...doc, slug: doc.path?.split("/").pop() }))
    .sort(
      (a: any, b: any) =>
        new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime(),
    )
    .slice(0, 4);
});

const featured = computed(() => posts.value?.[0]);
const recent = computed(() => posts.value?.slice(1, 4) ?? []);
const recentCards = computed(() => posts.value?.slice(1, 4) ?? []);
const leadSeries = computed(() => series.value?.[0]);
const moreSeries = computed(() => series.value?.slice(1, 4) ?? []);

const stack = ["Nuxt", "Vue", "TypeScript", "Nitro", "Vite", "Node"];

function formatDate(date: string | Date | undefined) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function isoDate(date: string | Date | undefined) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

function tagLabel(tag: string | undefined) {
  return (tag || "").replace(/^["'“”\s]+|["'“”\s]+$/g, "").trim();
}

function readingTime(post: any) {
  if (post?.readTime) return post.readTime;
  if (post?.body) {
    const text = JSON.stringify(post.body);
    const words = text.match(/\w+/g)?.length || 0;
    return Math.max(1, Math.ceil(words / 200));
  }
  return 1;
}
</script>

<template>
  <div class="reading-page">
    <section
      class="relative flex min-h-[calc(100svh-var(--header-height))] max-h-[1100px] flex-col overflow-hidden"
    >
      <div class="container-page relative flex flex-1 items-center">
        <div
          class="grid w-full grid-cols-12 items-center gap-x-6 gap-y-10 py-16 lg:py-10"
        >
          <div class="col-span-12 lg:col-span-4">
            <h1 class="display text-[clamp(3rem,4.6vw,4rem)]">
              Writing<br />that ships.
            </h1>
            <p class="mt-5 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
              Field notes on Nuxt, Vue, TypeScript, and the work of building software that survives
              contact with production.
            </p>
            <div class="mt-7 flex flex-wrap gap-3">
              <NuxtLink
                :to="featured ? `/blog/${featured.slug}` : '/blog'"
                class="btn btn-primary btn-pill h-10 px-5"
              >
                Read the latest
              </NuxtLink>
              <NuxtLink to="/blog" class="btn btn-secondary btn-pill h-10 px-5">
                Browse the archive
              </NuxtLink>
            </div>
          </div>

          <div
            class="relative col-span-12 flex items-center justify-center lg:col-span-5"
          >
            <div class="glow-field animate-breathe" aria-hidden="true" />
            <svg
              class="hero-mark"
              viewBox="0 0 480 440"
              fill="none"
              aria-hidden="true"
            >
              <path d="M48 42 L240 398 L432 42 L360 42 L240 254 L120 42 Z" fill="#000000" stroke="rgba(255,255,255,0.14)" stroke-width="1" />
            </svg>
          </div>

          <div class="col-span-12 lg:col-span-3 lg:justify-self-end">
            <ul class="space-y-2.5 text-[14px] text-muted-foreground">
              <li>For developers.</li>
              <li>By Vantol Bennett.</li>
              <li>Built in Jamaica.</li>
            </ul>
            <p class="mt-6 font-mono text-[11px] uppercase tracking-[0.08em] text-faint-ink">
              Essays / Series
            </p>
          </div>
        </div>
      </div>

      <div class="border-t border-border">
        <div
          class="container-page flex flex-wrap items-center gap-x-8 gap-y-4 py-6 md:justify-between"
        >
          <span class="meta">Built with</span>
          <span
            v-for="tool in stack"
            :key="tool"
            class="text-[15px] font-medium tracking-[-0.02em] text-muted-foreground opacity-70 transition-opacity hover:opacity-100"
          >
            {{ tool }}
          </span>
        </div>
      </div>
    </section>

    <section class="container-page pt-28 md:pt-40">
      <div class="grid gap-6 lg:grid-cols-12">
        <h2 class="section-title text-[clamp(2.5rem,4.2vw,3.5rem)] lg:col-span-7">
          Essays that survive production.
        </h2>
        <div class="lg:col-span-5 lg:pl-10">
          <p class="max-w-md text-[15px] leading-relaxed text-muted-foreground">
            The best way to master anything is to teach it. I write from shipped work — the release
            notes, the failure, the tradeoff that looked obvious in hindsight.
          </p>
          <p class="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-faint-ink">
            Vantol Bennett / Educator, developer
          </p>
        </div>
      </div>

      <div class="mt-12 grid gap-5 lg:grid-cols-12">
        <NuxtLink
          v-if="featured"
          :to="`/blog/${featured.slug}`"
          class="card group flex flex-col lg:col-span-8"
        >
          <div class="preview-panel relative aspect-[16/9] overflow-hidden border-b border-border bg-[#050505]">
            <div class="glow-field opacity-60" aria-hidden="true" />
            <div class="relative z-10 flex h-full flex-col p-5 md:p-7 text-[#ededed]">
              <div
                class="flex items-center gap-2 border-b border-[#1f1f1f] pb-3 font-mono text-[10px] text-[#a1a1a1]"
              >
                <span class="flex gap-1.5" aria-hidden="true">
                  <span class="h-1.5 w-1.5 rounded-full bg-border-strong" />
                  <span class="h-1.5 w-1.5 rounded-full bg-border-strong" />
                  <span class="h-1.5 w-1.5 rounded-full bg-border-strong" />
                </span>
                <span class="truncate">vantolbennett.com/blog/{{ featured.slug }}</span>
              </div>
              <div class="mt-auto pt-8">
                <p class="font-mono text-[12px] text-[#a1a1a1]">
                  <time :datetime="isoDate(featured.date)">{{ formatDate(featured.date) }}</time>
                  <span aria-hidden="true"> · </span>
                  {{ tagLabel(featured.tag) }}
                  <span aria-hidden="true"> · </span>
                  {{ readingTime(featured) }} min
                </p>
                <h3
                  class="mt-3 max-w-[22ch] text-[clamp(1.7rem,2.9vw,2.5rem)] font-medium leading-[1.08] tracking-[-0.045em] text-balance text-white"
                >
                  {{ featured.title }}
                </h3>
                <p
                  class="mt-3 max-w-xl text-[14px] leading-relaxed text-[#a1a1a1] line-clamp-3"
                >
                  {{ featured.description }}
                </p>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between p-5">
            <span class="text-[14px] text-blue">Read the essay →</span>
            <span class="meta">{{ tagLabel(featured.tag) }}</span>
          </div>
        </NuxtLink>

        <div class="lg:col-span-4">
          <p class="label mb-3">Recent essays</p>
          <div class="border-t border-border">
            <NuxtLink
              v-for="post in recent"
              :key="post.path"
              :to="`/blog/${post.slug}`"
              class="group block border-b border-border py-4"
            >
              <p class="meta">{{ formatDate(post.date) }} · {{ readingTime(post) }} min</p>
              <h3
                class="mt-1.5 text-[16px] font-medium leading-snug tracking-[-0.02em] transition-colors group-hover:text-blue"
              >
                {{ post.title }}
              </h3>
            </NuxtLink>
          </div>
          <NuxtLink
            to="/blog"
            class="mt-4 inline-flex text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            All essays →
          </NuxtLink>
        </div>
      </div>
    </section>

    <section v-if="series?.length" class="container-page pt-28 md:pt-40">
      <div class="grid gap-6 lg:grid-cols-12">
        <h2 class="section-title text-[clamp(2.5rem,4.2vw,3.5rem)] lg:col-span-7">
          Learn by building.
        </h2>
        <p class="max-w-md text-[15px] leading-relaxed text-muted-foreground lg:col-span-5 lg:pl-10">
          Step-by-step series from real releases. Every lesson is tied to something that shipped,
          not a toy example.
        </p>
      </div>

      <div class="mt-12 grid gap-5 lg:grid-cols-12">
        <NuxtLink
          v-if="leadSeries"
          :to="`/learn/${leadSeries.slug}`"
          class="card group flex flex-col lg:col-span-8"
        >
          <div class="preview-panel relative aspect-[16/9] overflow-hidden border-b border-border bg-[#050505]">
            <div class="glow-field opacity-50" aria-hidden="true" />
            <div class="relative z-10 flex h-full flex-col p-5 md:p-7 text-[#ededed]">
              <div
                class="flex items-center justify-between border-b border-[#1f1f1f] pb-3 font-mono text-[10px] text-[#a1a1a1]"
              >
                <span>{{ leadSeries.difficulty || "Tutorial series" }}</span>
                <span>{{ leadSeries.nuxtVersion ? `Nuxt v${leadSeries.nuxtVersion}` : "Series" }}</span>
              </div>
              <div class="mt-auto pt-8">
                <p class="font-mono text-[12px] text-[#a1a1a1]">
                  {{
                    leadSeries.releaseDate ? formatDate(leadSeries.releaseDate) : "Ongoing"
                  }}
                </p>
                <h3
                  class="mt-3 max-w-[24ch] text-[clamp(1.7rem,2.9vw,2.5rem)] font-medium leading-[1.08] tracking-[-0.045em] text-balance text-white"
                >
                  {{ leadSeries.title }}
                </h3>
                <p
                  class="mt-3 max-w-xl text-[14px] leading-relaxed text-[#a1a1a1] line-clamp-3"
                >
                  {{ leadSeries.description }}
                </p>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between p-5">
            <span class="text-[14px] text-blue">Open the series →</span>
            <span class="meta">{{ leadSeries.difficulty || "Tutorial" }}</span>
          </div>
        </NuxtLink>

        <div class="lg:col-span-4">
          <p class="label mb-3">More series</p>
          <div class="border-t border-border">
            <NuxtLink
              v-for="item in moreSeries"
              :key="item.slug"
              :to="`/learn/${item.slug}`"
              class="group block border-b border-border py-4"
            >
              <p class="meta">
                {{ item.nuxtVersion ? `v${item.nuxtVersion}` : item.difficulty || "Series" }}
              </p>
              <h3
                class="mt-1.5 text-[16px] font-medium leading-snug tracking-[-0.02em] transition-colors group-hover:text-blue"
              >
                {{ item.title }}
              </h3>
            </NuxtLink>
          </div>
          <NuxtLink
            to="/learn"
            class="mt-4 inline-flex text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            All series →
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="container-page pt-28 md:pt-40">
      <div class="flex items-end justify-between gap-6">
        <h2 class="section-title text-[clamp(2.5rem,4.2vw,3.5rem)]">Recently published.</h2>
        <NuxtLink
          to="/blog"
          class="hidden text-[13px] text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
        >
          All writing →
        </NuxtLink>
      </div>

      <div class="mt-10 grid gap-5 md:grid-cols-3">
        <NuxtLink
          v-for="post in recentCards"
          :key="`card-${post.path}`"
          :to="`/blog/${post.slug}`"
          class="card group flex flex-col"
        >
          <div class="aspect-[16/10] overflow-hidden border-b border-border bg-surface-2">
            <NuxtImg
              :src="post.img"
              :alt="post.title"
              sizes="(min-width: 768px) 33vw, 100vw"
              class="h-full w-full object-cover opacity-90 transition-all duration-500 group-hover:scale-[1.025] group-hover:opacity-100"
            />
          </div>
          <div class="flex flex-1 flex-col p-5">
            <p class="meta">{{ formatDate(post.date) }} · {{ tagLabel(post.tag) }}</p>
            <h3
              class="mt-2 text-[17px] font-medium leading-snug tracking-[-0.02em] transition-colors group-hover:text-blue"
            >
              {{ post.title }}
            </h3>
            <p class="mt-2 text-[14px] leading-relaxed text-muted-foreground line-clamp-2">
              {{ post.description }}
            </p>
            <span class="mt-auto pt-5 text-[13px] text-blue">Read more →</span>
          </div>
        </NuxtLink>
      </div>
    </section>

    <section class="container-page pt-28 md:pt-40">
      <Newsletter />
    </section>

    <section class="container-page pt-20 md:pt-28">
      <div
        class="relative overflow-hidden rounded-xl border border-border px-6 py-20 text-center md:py-24"
      >
        <div class="glow-field opacity-60" aria-hidden="true" />
        <h2 class="display relative mx-auto max-w-[16ch] text-[clamp(2.4rem,5vw,4rem)]">
          Start with the newest note.
        </h2>
        <p class="relative mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          No feed. No algorithm. Just the next thing I learned, written down properly.
        </p>
        <div class="relative mt-8 flex flex-wrap justify-center gap-3">
          <NuxtLink
            :to="featured ? `/blog/${featured.slug}` : '/blog'"
            class="btn btn-primary btn-pill h-10 px-5"
          >
            Read the latest
          </NuxtLink>
          <NuxtLink to="/about" class="btn btn-secondary btn-pill h-10 px-5">
            About Vantol
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
