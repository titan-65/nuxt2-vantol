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
  <div class="min-h-screen bg-[#0a0a0a] text-white font-sans">
    <!-- Hero Section -->
    <section class="py-20 border-b border-white/10">
      <div class="max-w-5xl mx-auto px-6">
        <div class="grid gap-12 lg:grid-cols-2 items-center">
          <div class="space-y-6">
            <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500">About Me</p>

            <h1 class="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]">
              Vantol R. Bennett
            </h1>

            <div class="border-l-2 border-white/10 pl-6 py-2">
              <p class="text-xl text-zinc-400 font-light leading-relaxed mb-4">
                Jamaican Educator & Developer passionate about creating innovative solutions that bridge technology and education.
              </p>
              <p class="text-zinc-500 text-sm uppercase tracking-wide">
                Founder of Zhyjenae
              </p>
            </div>

            <p class="text-lg font-light leading-relaxed border border-white/10 bg-[#111] p-6 rounded-xl italic text-zinc-400">
              "The best way to write code all day is by doing it! Evolve with innovation."
            </p>
          </div>

          <div class="relative">
            <div class="rounded-2xl overflow-hidden bg-zinc-900">
              <NuxtImg
                src="https://res.cloudinary.com/ddszyeplg/image/upload/v1656478354/IMG_1412_orxemy.jpg"
                alt="Vantol Bennett"
                sizes="(min-width: 1024px) 50vw, 100vw"
                class="w-full h-full object-cover aspect-square"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Skills Section -->
    <section class="py-20 border-b border-white/10">
      <div class="max-w-5xl mx-auto px-6">
        <div class="mb-12">
          <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Skills</p>
          <h2 class="text-3xl font-semibold mb-4">Skills & Technologies</h2>
          <p class="text-zinc-500 font-light max-w-2xl">
            Tools and technologies I work with regularly to build digital products.
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-3">
          <div
            v-for="skill in skills"
            :key="skill.category"
            class="bg-[#111] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors"
          >
            <h3 class="text-[11px] font-bold uppercase tracking-widest mb-6 text-zinc-500 pb-2 border-b border-white/10">
              {{ skill.category }}
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="item in skill.items"
                :key="item"
                class="px-2.5 py-1 text-[11px] font-mono border border-white/10 text-zinc-400 rounded-md hover:bg-white/5 hover:text-white transition-colors cursor-default"
              >
                {{ item }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Experience Section -->
    <section class="py-20">
      <div class="max-w-5xl mx-auto px-6">
        <div class="mb-12">
          <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Experience</p>
          <h2 class="text-3xl font-semibold mb-4">Experience</h2>
          <p class="text-zinc-500 font-light max-w-2xl">
            My professional journey and contributions.
          </p>
        </div>

        <div class="grid gap-4 max-w-4xl">
          <div
            v-for="exp in experience"
            :key="exp.title"
            class="group bg-[#111] border border-white/10 rounded-xl p-6 md:p-8 hover:border-white/20 transition-colors flex flex-col md:flex-row gap-6 md:gap-12"
          >
            <div class="md:w-1/4">
              <span class="inline-block px-2.5 py-1 text-[10px] font-bold bg-[#f5c542] text-black rounded-md mb-2 uppercase tracking-wider">
                {{ exp.period }}
              </span>
              <p class="text-sm font-semibold text-zinc-400">
                {{ exp.company }}
              </p>
            </div>

            <div class="md:w-3/4">
              <h3 class="text-xl font-semibold mb-2 group-hover:text-[#f5c542] transition-colors">
                {{ exp.title }}
              </h3>
              <p class="text-zinc-500 font-light leading-relaxed">
                {{ exp.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
