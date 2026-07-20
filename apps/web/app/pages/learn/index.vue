<script setup lang="ts">
const { data: series } = await useAsyncData('learn-series', async () => {
  const items = await queryCollection('tutorials').all() as any[]
  return items
    .filter((doc: any) => !doc.order && doc.path?.split('/').filter(Boolean).length === 2)
    .map((doc: any) => ({ ...doc, seriesSlug: doc.series || doc.path?.split('/').pop() }))
    .sort((a: any, b: any) => {
      const dateA = new Date(a.releaseDate || 0).getTime()
      const dateB = new Date(b.releaseDate || 0).getTime()
      return dateB - dateA
    })
})

useSeoMeta({
  title: 'Learn | VantolBennett',
  description: 'Hands-on tutorials where we learn new framework features together, one release at a time.',
  ogTitle: 'Learn — one release at a time',
  ogDescription: 'Hands-on tutorials where we learn new framework features together, one release at a time.'
})

function formatDate(date: string | undefined) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en', { year: 'numeric', month: 'long' })
}
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a] text-white font-sans">
    <div class="max-w-[1088px] mx-auto px-6 py-12">
      <!-- Header -->
      <div class="mb-10 border-b border-white/10 pb-6">
        <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Learn</p>
        <h1 class="text-4xl font-semibold tracking-tight">Learning, one release at a time</h1>
        <p class="text-sm text-zinc-500 mt-3 max-w-2xl leading-relaxed">
          I build with these tools every day — but new releases ship features I've never touched.
          These are hands-on tutorials where we learn them together, step by step, straight from the source.
        </p>
      </div>

      <div v-if="!series?.length" class="text-center py-20 border border-dashed border-white/10 bg-[#111] rounded-xl">
        <p class="text-zinc-500 text-sm">No tutorials yet — check back soon.</p>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <NuxtLink
          v-for="s in series"
          :key="s.seriesSlug"
          :to="s.path"
          class="group flex flex-col bg-[#111] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all"
        >
          <div v-if="s.img" class="aspect-[16/9] overflow-hidden bg-zinc-900">
            <NuxtImg :src="s.img" :alt="s.title" class="w-full h-full object-cover" sizes="600px" />
          </div>
          <div class="p-6 flex flex-col flex-1">
            <div class="flex items-center gap-3 mb-3 flex-wrap">
              <span v-if="s.nuxtVersion" class="px-2.5 py-1 bg-[#f5c542] text-black text-[10px] font-bold uppercase tracking-widest rounded-md">
                v{{ s.nuxtVersion }}
              </span>
              <span v-if="s.difficulty" class="text-[11px] uppercase tracking-wider text-zinc-500">{{ s.difficulty }}</span>
              <span v-if="s.releaseDate" class="text-[11px] text-zinc-600">{{ formatDate(s.releaseDate) }}</span>
            </div>
            <h2 class="text-xl font-semibold text-white mb-2 group-hover:text-[#f5c542] transition-colors">
              {{ s.title }}
            </h2>
            <p class="text-zinc-500 text-sm leading-relaxed line-clamp-2">{{ s.description }}</p>
            <span class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-300 group-hover:text-[#f5c542] transition-colors">
              Start learning
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="group-hover:translate-x-0.5 transition-transform">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
