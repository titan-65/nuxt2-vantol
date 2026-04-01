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
  <div class="min-h-screen bg-[#F3F3F3] font-sans">
    <!-- Hero Section -->
    <section class="py-20 border-b border-black/10">
      <div class="container mx-auto px-6">
        <div class="max-w-3xl">
          <div class="flex items-center gap-2 mb-4">
            <span class="w-2 h-2 bg-[#FF4F4F] rounded-full"></span>
            <span class="text-xs font-medium tracking-widest text-gray-500 uppercase">TECH STACK</span>
          </div>
          
          <h1 class="text-5xl md:text-6xl font-medium tracking-tight mb-8">
            Uses
          </h1>
          
          <p class="text-xl text-gray-600 font-light leading-relaxed border-l-2 border-black/10 pl-6">
            A comprehensive list of tools, software, and gear I use for development and content creation.
            Updated regularly to reflect my current setup.
          </p>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="py-16 md:py-24">
      <div class="container mx-auto px-6">
        <div class="space-y-16">
          <div
            v-for="(category, index) in categories"
            :key="category.title"
            class="relative"
          >
            <!-- Vertical connecting line style decoration -->
            <div class="absolute left-0 top-0 bottom-0 w-px bg-black/10 -ml-3 hidden lg:block"></div>
            
            <div class="grid lg:grid-cols-4 gap-8">
              <div class="lg:col-span-1">
                <h2 class="text-xl font-bold uppercase tracking-wide mb-2 sticky top-24">{{ category.title }}</h2>
                <p class="text-sm text-gray-500 font-mono sticky top-32">{{ category.description }}</p>
              </div>
              
              <div class="lg:col-span-3 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div 
                  v-for="item in category.items" 
                  :key="item.name" 
                  class="bg-white border border-black/20 p-5 hover:border-black hover:shadow-sm transition-all group"
                >
                  <h3 class="font-bold text-sm mb-2 group-hover:underline decoration-1 underline-offset-4">
                    {{ item.name }}
                  </h3>
                  <p class="text-xs text-gray-500 font-light leading-relaxed">
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
    <section class="py-16 bg-white border-t border-black/10">
      <div class="container mx-auto px-6">
        <div class="max-w-2xl mx-auto text-center border border-black/20 p-8 bg-[#F3F3F3]">
          <p class="text-gray-600 font-light mb-4">
            This page is regularly updated as I discover new tools and refine my workflow.
          </p>
          <NuxtLink 
            to="/contact" 
            class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            Have a recommendation? ->
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
