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
  <div class="min-h-screen bg-[#F3F3F3] font-sans">
    <!-- Hero Section -->
    <section class="py-20 border-b border-black/10">
      <div class="container mx-auto px-6">
        <div class="max-w-3xl">
          <div class="flex items-center gap-2 mb-4">
            <span class="w-2 h-2 bg-[#FF4F4F] rounded-full"></span>
            <span class="text-xs font-medium tracking-widest text-gray-500 uppercase">PUBLICATIONS</span>
          </div>

          <h1 class="text-5xl md:text-6xl font-medium tracking-tight mb-8">
            Published Works
          </h1>

          <p class="text-xl text-gray-600 font-light leading-relaxed border-l-2 border-black/10 pl-6">
            Books and written works exploring modern web development, frameworks, and the craft of building software.
          </p>
        </div>
      </div>
    </section>

    <!-- Publications -->
    <section class="py-16 md:py-24">
      <div class="container mx-auto px-6">
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
      <div class="container mx-auto px-6">
        <div class="max-w-2xl mx-auto text-center border border-black/20 p-12 bg-white">
          <p class="text-gray-500 font-mono text-sm uppercase tracking-wider">
            More publications coming soon.
          </p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-white border-t border-black/10">
      <div class="container mx-auto px-6">
        <div class="max-w-2xl mx-auto text-center border border-black/20 p-8 bg-[#F3F3F3]">
          <p class="text-gray-600 font-light mb-4">
            Interested in collaborating on a technical book or publication?
          </p>
          <NuxtLink
            to="/contact"
            class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            Get in Touch ->
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
