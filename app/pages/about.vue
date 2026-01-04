<script setup lang="ts">
useSeoMeta({
  title: 'About - VantolBennett',
  description: 'Learn more about Vantol R. Bennett, Jamaican Educator & Developer, Founder of Zhyjenae.',
})

const { data: aboutData } = await useAsyncData('about-data', () => {
  return queryCollection('about').first()
})

const skills = computed(() => aboutData.value?.skills || [])
const experience = computed(() => aboutData.value?.experience || [])
</script>

<template>
  <div class="min-h-screen bg-[#F3F3F3] font-sans">
    <!-- Hero Section -->
    <section class="py-20 border-b border-black/10">
      <div class="container mx-auto px-6">
        <div class="grid gap-12 lg:grid-cols-2 items-center">
          <div class="space-y-6">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 bg-[#FF4F4F] rounded-full"></span>
              <span class="text-xs font-medium tracking-widest text-gray-500 uppercase">ABOUT ME</span>
            </div>
            
            <h1 class="text-5xl md:text-7xl font-medium tracking-tight leading-[1.1]">
              Vantol R. Bennett
            </h1>
            
            <div class="border-l-2 border-black/10 pl-6 py-2">
              <p class="text-xl text-gray-600 font-light leading-relaxed mb-4">
                Jamaican Educator & Developer passionate about creating innovative solutions that bridge technology and education.
              </p>
              <p class="text-gray-500 font-mono text-sm uppercase tracking-wide">
                Founder of Zhyjenae
              </p>
            </div>

            <p class="text-lg font-light leading-relaxed border border-black/10 bg-white p-6 italic text-gray-600">
              "The best way to write code all day is by doing it! Evolve with innovation."
            </p>
          </div>
          
          <div class="relative">
            <div class="border border-black/20 bg-white p-2 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div class="aspect-square overflow-hidden bg-gray-100 border border-black/10">
                <img
                  src="https://res.cloudinary.com/ddszyeplg/image/upload/v1656478354/IMG_1412_orxemy.jpg"
                  alt="Vantol Bennett"
                  class="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <div class="mt-2 flex justify-between items-center px-1">
                <div class="flex gap-1">
                  <div class="w-2 h-2 rounded-full bg-black/20"></div>
                  <div class="w-2 h-2 rounded-full bg-black/20"></div>
                </div>
                <span class="text-[10px] font-mono text-gray-400">PROFILE.JPG</span>
              </div>
            </div>
            <!-- Decorative dots -->
            <div class="absolute -z-10 -bottom-4 -left-4 w-24 h-24 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.2)_1px,transparent_0)] bg-size-[4px_4px]"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Skills Section -->
    <section class="py-20 border-b border-black/10">
      <div class="container mx-auto px-6">
        <div class="mb-12">
          <h2 class="text-3xl font-medium mb-4">Skills & Technologies</h2>
          <p class="text-gray-600 font-light max-w-2xl">
            Tools and technologies I work with regularly to build digital products.
          </p>
        </div>
        
        <div class="grid gap-6 md:grid-cols-3">
          <div 
            v-for="skill in skills" 
            :key="skill.category"
            class="bg-white border border-black/20 p-6 hover:border-black transition-colors"
          >
            <h3 class="text-xs font-bold uppercase tracking-widest mb-6 border-b border-black/10 pb-2">
              {{ skill.category }}
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="item in skill.items"
                :key="item"
                class="px-2 py-1 text-xs font-mono border border-black/20 text-gray-600 uppercase hover:bg-black hover:text-white transition-colors cursor-default"
              >
                {{ item }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Experience Section -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-6">
        <div class="mb-12">
          <h2 class="text-3xl font-medium mb-4">Experience</h2>
          <p class="text-gray-600 font-light max-w-2xl">
            My professional journey and contributions.
          </p>
        </div>
        
        <div class="grid gap-6 max-w-4xl">
          <div 
            v-for="exp in experience" 
            :key="exp.title"
            class="group border border-black/20 p-8 hover:border-black transition-colors flex flex-col md:flex-row gap-6 md:gap-12"
          >
            <div class="md:w-1/4">
              <span class="inline-block px-2 py-1 text-xs font-mono bg-black text-white mb-2">
                {{ exp.period }}
              </span>
              <p class="text-sm font-bold uppercase tracking-wider text-gray-500">
                {{ exp.company }}
              </p>
            </div>
            
            <div class="md:w-3/4">
              <h3 class="text-xl font-bold mb-2 group-hover:underline decoration-1 underline-offset-4">
                {{ exp.title }}
              </h3>
              <p class="text-gray-600 font-light leading-relaxed">
                {{ exp.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
