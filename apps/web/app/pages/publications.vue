<script setup lang="ts">
useSeoMeta({
  title: 'Publications - VantolBennett',
  description: 'Published books and written works by Vantol R. Bennett.',
})

const { data: publicationsData } = await useAsyncData('publications-data', () => {
  return queryCollection('publications').first()
})

const publications = computed(() => publicationsData.value?.items || [])
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a] text-white font-sans">
    <!-- Hero Section -->
    <section class="py-20 border-b border-white/10">
      <div class="max-w-5xl mx-auto px-6">
        <div class="max-w-3xl">
          <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Publications</p>

          <h1 class="text-5xl md:text-6xl font-semibold tracking-tight mb-8">
            Published Works
          </h1>

          <p class="text-xl text-zinc-400 font-light leading-relaxed border-l-2 border-white/10 pl-6">
            Books and written works exploring modern web development, frameworks, and the craft of building software.
          </p>
        </div>
      </div>
    </section>

    <!-- Publications -->
    <section class="py-16 md:py-24">
      <div class="max-w-5xl mx-auto px-6">
        <div class="space-y-24">
          <PublicationCard
            v-for="publication in publications"
            :key="publication.title"
            :item="publication"
          />
        </div>
      </div>
    </section>

    <!-- Empty State -->
    <section v-if="publications.length === 0" class="py-24">
      <div class="max-w-5xl mx-auto px-6">
        <div class="max-w-2xl mx-auto text-center border border-white/10 p-12 bg-[#111] rounded-xl">
          <p class="text-zinc-500 text-sm uppercase tracking-wider">
            More publications coming soon.
          </p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 border-t border-white/10">
      <div class="max-w-5xl mx-auto px-6">
        <div class="max-w-2xl mx-auto text-center border border-white/10 p-8 bg-[#111] rounded-xl">
          <p class="text-zinc-400 font-light mb-4">
            Interested in collaborating on a technical book or publication?
          </p>
          <NuxtLink
            to="/contact"
            class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-[#f5c542] text-black px-6 py-3 hover:bg-[#e0b13a] transition-colors rounded-lg"
          >
            Get in Touch
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
