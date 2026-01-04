<script setup lang="ts">
useHead({
  title: 'Developer Exploration | Vantol Bennett'
})

type ExploreCard = {
  title: string
  label: string
  description: string
  to?: string
  status: 'Active' | 'Draft' | 'Planned'
}

const { data: exploreData } = await useAsyncData('explore-data', () => {
  return queryCollection('explore').first()
})

const cards = computed<ExploreCard[]>(() => (exploreData.value?.cards as ExploreCard[]) || [])

const quickLinks = [
  { name: 'Blog', to: '/blog' },
  { name: 'Projects', to: '/projects' },
  { name: 'Gallery', to: '/gallery' }
]
</script>

<template>
  <main class="container mx-auto px-6 py-10">
    <section class="border border-black/10 bg-white p-6 md:p-10">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Developer Exploration</p>
          <h1 class="mt-2 text-3xl md:text-4xl font-bold tracking-tight">Labs, Notes, and Patterns</h1>
          <p class="mt-3 text-sm font-mono text-gray-600 max-w-2xl">
            This page is a hub for the stuff I’m testing and learning in public—without the pressure of a polished post.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <NuxtLink
            v-for="link in quickLinks"
            :key="link.to"
            :to="link.to"
            class="border border-black/20 bg-[#F3F3F3] px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors"
          >
            {{ link.name }} ->
          </NuxtLink>
        </div>
      </div>

      <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <component
          :is="card.to ? 'NuxtLink' : 'article'"
          v-for="card in cards"
          :key="card.title"
          :to="card.to"
          :target="card.to?.startsWith('http') ? '_blank' : undefined"
          class="block border border-black/10 bg-[#F3F3F3] p-5 hover:border-black/30 transition-colors"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{{ card.label }}</p>
              <h2 class="mt-2 font-bold tracking-tight">{{ card.title }}</h2>
            </div>
            <span
              class="text-[10px] font-bold uppercase tracking-[0.2em]"
              :class="{
                'text-green-700': card.status === 'Active',
                'text-gray-500': card.status === 'Draft',
                'text-blue-700': card.status === 'Planned'
              }"
            >
              {{ card.status }}
            </span>
          </div>

          <p class="mt-4 text-xs font-mono text-gray-600">
            {{ card.description }}
          </p>

          <div class="mt-5 border-t border-black/10 pt-4">
            <p v-if="card.to" class="text-[11px] font-mono text-black font-bold">
              Explore ->
            </p>
            <p v-else class="text-[11px] font-mono text-gray-500">
              Coming soon...
            </p>
          </div>
        </component>
      </div>

      <!-- <div class="mt-8 border-t border-black/10 pt-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="border border-black/10 bg-white p-5">
            <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Focus</p>
            <p class="mt-2 text-xs font-mono text-gray-600">
              Nuxt Content v3, component-driven writing, performance basics, and clean UI systems.
            </p>
          </div>
          <div class="border border-black/10 bg-white p-5">
            <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">How to use</p>
            <p class="mt-2 text-xs font-mono text-gray-600">
              Treat this like a map. I’ll link out to posts, projects, and experiments as they’re published.
            </p>
          </div>
        </div>
      </div> -->
    </section>
  </main>
</template>
