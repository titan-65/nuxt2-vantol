<script setup lang="ts">
useSeoMeta({
  title: 'Uses - VantolBennett',
  description: 'Tech stack, tools, and gear I use for development and content creation',
})

const { data: usesData } = await useAsyncData('uses-data', () => {
  return queryCollection('uses').first()
})

const categories = computed(() => usesData.value?.categories || [])
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a] text-white font-sans">
    <!-- Hero Section -->
    <section class="py-20 border-b border-white/10">
      <div class="max-w-5xl mx-auto px-6">
        <div class="max-w-3xl">
          <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Tech Stack</p>
          
          <h1 class="text-5xl md:text-6xl font-semibold tracking-tight mb-8">
            Uses
          </h1>
          
          <p class="text-xl text-zinc-400 font-light leading-relaxed border-l-2 border-white/10 pl-6">
            A comprehensive list of tools, software, and gear I use for development and content creation.
            Updated regularly to reflect my current setup.
          </p>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="py-16 md:py-24">
      <div class="max-w-5xl mx-auto px-6">
        <div class="space-y-16">
          <div
            v-for="(category, index) in categories"
            :key="category.title"
            class="relative"
          >
            <div class="absolute left-0 top-0 bottom-0 w-px bg-white/10 -ml-3 hidden lg:block"></div>
            
            <div class="grid lg:grid-cols-4 gap-8">
              <div class="lg:col-span-1">
                <h2 class="text-xl font-semibold mb-2 sticky top-24">{{ category.title }}</h2>
                <p class="text-sm text-zinc-500 sticky top-32">{{ category.description }}</p>
              </div>
              
              <div class="lg:col-span-3 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div 
                  v-for="item in category.items" 
                  :key="item.name" 
                  class="bg-[#111] border border-white/10 rounded-xl p-5 hover:border-white/20 hover:bg-white/[0.02] transition-all group"
                >
                  <h3 class="font-semibold text-sm mb-2 group-hover:text-[#f5c542] transition-colors">
                    {{ item.name }}
                  </h3>
                  <p class="text-xs text-zinc-500 leading-relaxed">
                    {{ item.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer Note -->
    <section class="py-16 border-t border-white/10">
      <div class="max-w-5xl mx-auto px-6">
        <div class="max-w-2xl mx-auto text-center border border-white/10 p-8 bg-[#111] rounded-xl">
          <p class="text-zinc-400 font-light mb-4">
            This page is regularly updated as I discover new tools and refine my workflow.
          </p>
          <NuxtLink 
            to="/contact" 
            class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-[#f5c542] text-black px-6 py-3 hover:bg-[#e0b13a] transition-colors rounded-lg"
          >
            Have a recommendation?
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
