<script setup lang="ts">
useHead({
  title: "Gallery | Vantol Bennett",
});

type GalleryItem = {
  title: string;
  type: "Photo" | "Screenshot" | "Sketch";
  year: string;
  note: string;
  img: string;
};

const { data: galleryData } = await useAsyncData("gallery-data", () => {
  return queryCollection("gallery").first();
});

const items = computed(() => galleryData.value?.items || []);
</script>

<template>
  <main class="min-h-screen bg-background text-foreground font-sans">
    <div class="max-w-[1088px] mx-auto px-6 py-10">
      <section class="border border-border bg-card rounded-xl p-6 md:p-10">
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Gallery</p>
            <h1 class="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
              Visual Notes & Builds
            </h1>
            <p class="mt-3 text-sm text-muted-foreground max-w-2xl">
              A lightweight space for design snapshots, build screenshots, and experiments. I'll
              keep it curated—less feed, more archive.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <NuxtLink
              to="/explore"
              class="border border-border bg-background px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors rounded-lg text-foreground"
            >
              Developer Exploration
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="inline ml-1"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </div>

        <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <article
            v-for="(item, idx) in items"
            :key="idx"
            class="border border-border bg-background rounded-xl p-5 hover:border-border-strong transition-colors"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {{ item.type }}
                </p>
                <h2 class="mt-2 font-semibold tracking-tight">{{ item.title }}</h2>
              </div>
              <span class="text-xs text-muted-foreground">{{ item.year }}</span>
            </div>

            <a
              class="mt-4 block rounded-lg overflow-hidden bg-muted"
              :href="item.img"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                :src="item.img"
                :alt="item.title"
                width="1200"
                height="900"
                class="w-full aspect-4/3 object-cover hover:scale-105 transition-transform duration-500"
              />
            </a>

            <p class="mt-4 text-xs text-muted-foreground">
              {{ item.note }}
            </p>
          </article>
        </div>

        <div class="mt-8 border-t border-border pt-6">
          <p class="text-xs text-muted-foreground">
            Tip: update the <code class="text-blue">items</code> array in this page with your
            Cloudinary URLs.
          </p>
        </div>
      </section>
    </div>
  </main>
</template>
