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
  <main class="min-h-screen bg-[#0a0a0a] text-white font-sans">
    <div class="max-w-5xl mx-auto px-6 py-10">
      <section class="border border-white/10 bg-[#111] rounded-xl p-6 md:p-10">
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Gallery</p>
            <h1 class="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">Visual Notes & Builds</h1>
            <p class="mt-3 text-sm text-zinc-400 max-w-2xl">
              A lightweight space for design snapshots, build screenshots, and experiments.
              I'll keep it curated—less feed, more archive.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <NuxtLink
              to="/explore"
              class="border border-white/10 bg-[#0a0a0a] px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors rounded-lg text-zinc-300"
            >
              Developer Exploration
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="inline ml-1"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </NuxtLink>
          </div>
        </div>

        <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <article
            v-for="(item, idx) in items"
            :key="idx"
            class="border border-white/10 bg-[#0a0a0a] rounded-xl p-5 hover:border-white/20 transition-colors"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{{ item.type }}</p>
                <h2 class="mt-2 font-semibold tracking-tight">{{ item.title }}</h2>
              </div>
              <span class="text-xs text-zinc-600">{{ item.year }}</span>
            </div>

            <a
              class="mt-4 block rounded-lg overflow-hidden bg-zinc-900"
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

            <p class="mt-4 text-xs text-zinc-500">
              {{ item.note }}
            </p>
          </article>
        </div>

        <div class="mt-8 border-t border-white/10 pt-6">
          <p class="text-xs text-zinc-600">
            Tip: update the <code class="text-[#f5c542]">items</code> array in this page with your Cloudinary URLs.
          </p>
        </div>
      </section>
    </div>
  </main>
</template>
