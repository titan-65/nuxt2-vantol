<script setup lang="ts">
useHead({
  title: 'Gallery | Vantol Bennett'
})

type GalleryItem = {
  title: string
  type: 'Photo' | 'Screenshot' | 'Sketch'
  year: string
  note: string
  img: string
}

const { data: galleryData } = await useAsyncData('gallery-data', () => {
  return queryCollection('gallery').first()
})

const items = computed(() => galleryData.value?.items || [])
</script>

<template>
  <main class="container mx-auto px-6 py-10">
    <section class="border border-black/10 bg-white p-6 md:p-10">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Gallery</p>
          <h1 class="mt-2 text-3xl md:text-4xl font-bold tracking-tight">Visual Notes & Builds</h1>
          <p class="mt-3 text-sm font-mono text-gray-600 max-w-2xl">
            A lightweight space for design snapshots, build screenshots, and experiments.
            I’ll keep it curated—less feed, more archive.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <NuxtLink
            to="/explore"
            class="border border-black/20 bg-[#F3F3F3] px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors"
          >
            Developer Exploration ->
          </NuxtLink>
        </div>
      </div>

      <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <article
          v-for="(item, idx) in items"
          :key="idx"
          class="border border-black/10 bg-[#F3F3F3] p-5"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{{ item.type }}</p>
              <h2 class="mt-2 font-bold tracking-tight">{{ item.title }}</h2>
            </div>
            <span class="text-xs font-mono text-gray-500">{{ item.year }}</span>
          </div>

          <a
            class="mt-4 block border border-black/10 bg-white overflow-hidden"
            :href="item.img"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              :src="item.img"
              :alt="item.title"
              class="w-full aspect-[4/3] object-cover"
              loading="lazy"
            />
          </a>

          <p class="mt-4 text-xs font-mono text-gray-600">
            {{ item.note }}
          </p>
        </article>
      </div>

      <div class="mt-8 border-t border-black/10 pt-6">
        <p class="text-xs font-mono text-gray-500">
          Tip: update the <code>items</code> array in this page with your Cloudinary URLs.
        </p>
      </div>
    </section>
  </main>
</template>
