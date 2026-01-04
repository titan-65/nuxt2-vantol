<script setup lang="ts">
const { data: projects } = await useAsyncData('projects', async () => {
  // Debug: Try fetching with leading slash and ensure we are hitting the right path
  const items = await queryCollection('projects').all() as any[]
  return items.map((p: any) => ({ ...p, _path: p.path, slug: p.path.split('/').pop() }))
})

const allTechnologies = computed(() => {
  const techs = new Set<string>()
  projects.value?.forEach((project: any) => {
    if (project.stack?.Frontend) techs.add(project.stack.Frontend)
    if (project.stack?.Backend) techs.add(project.stack.Backend)
    if (project.stack?.Framework) techs.add(project.stack.Framework)
  })
  return Array.from(techs).sort()
})

const selectedTech = ref<string | null>(null)
const viewMode = ref<'grid' | 'list'>('grid')

const filteredProjects = computed(() => {
  if (!selectedTech.value) return projects.value || []
  
  return (projects.value || []).filter((project: any) => {
    const stack = project.stack || {}
    return stack.Frontend === selectedTech.value || 
           stack.Backend === selectedTech.value || 
           stack.Framework === selectedTech.value
  })
})

const clearFilter = () => {
  selectedTech.value = null
}
</script>

<template>
  <div class="min-h-screen bg-[#F3F3F3] font-sans">
    <div class="container mx-auto px-6 py-12">
      <div class="text-center mb-16 border-b border-black/10 pb-12">
        <div class="flex items-center justify-center gap-2 mb-4">
          <span class="w-2 h-2 bg-[#FF4F4F] rounded-full"></span>
          <span class="text-xs font-medium tracking-widest text-gray-500 uppercase">PORTFOLIO</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-medium tracking-tight mb-4">Projects</h1>
        <p class="text-gray-600 font-light max-w-2xl mx-auto">
          A collection of projects built with various technologies including Vue.js, Nuxt.js, React, and more.
        </p>
      </div>
      
      <!-- Controls -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-black/10 pb-6">
        <div class="flex flex-wrap justify-center gap-2">
          <button
            @click="clearFilter"
            :class="[
              'px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors',
              !selectedTech
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-500 border-black/20 hover:border-black hover:text-black'
            ]"
          >
            All
          </button>
          <button
            v-for="tech in allTechnologies"
            :key="tech"
            @click="selectedTech = selectedTech === tech ? null : tech"
            :class="[
              'px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors',
              selectedTech === tech
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-500 border-black/20 hover:border-black hover:text-black'
            ]"
          >
            {{ tech }}
          </button>
        </div>
        
        <div class="flex items-center gap-0 border border-black/20 bg-white">
          <button
            @click="viewMode = 'grid'"
            :class="[
              'p-2 transition-colors border-r border-black/20 last:border-0',
              viewMode === 'grid'
                ? 'bg-black text-white'
                : 'bg-transparent text-gray-400 hover:text-black'
            ]"
            aria-label="Grid view"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
            </svg>
          </button>
          <button
            @click="viewMode = 'list'"
            :class="[
              'p-2 transition-colors',
              viewMode === 'list'
                ? 'bg-black text-white'
                : 'bg-transparent text-gray-400 hover:text-black'
            ]"
            aria-label="List view"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div v-if="filteredProjects.length === 0" class="text-center py-20 border border-dashed border-black/20 bg-white">
        <p class="text-gray-500 font-mono text-sm uppercase mb-4">No projects found</p>
        <button @click="clearFilter" class="text-black border-b border-black hover:opacity-50 text-xs font-bold uppercase tracking-widest">
          Clear filter
        </button>
      </div>
      
      <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ProjectCard
          v-for="project in filteredProjects"
          :key="project.slug"
          :item="project"
        />
      </div>
      
      <div v-else class="space-y-6">
        <div
          v-for="project in filteredProjects"
          :key="project.slug"
          class="bg-white border border-black/20 p-6 flex flex-col md:flex-row gap-6 hover:border-black transition-colors group"
        >
          <div class="md:w-64 h-48 md:h-auto overflow-hidden shrink-0 border border-black/10">
            <img
              :src="project.image"
              :alt="project.title"
              class="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
            />
          </div>
          
          <div class="flex-1 flex flex-col">
            <div class="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 class="text-xl font-bold mb-2 group-hover:underline decoration-1 underline-offset-4">
                  {{ project.title }}
                </h3>
                <p class="text-gray-600 font-light text-sm line-clamp-2">
                  {{ project.preview }}
                </p>
              </div>
              <span
                v-if="project.active"
                class="px-2 py-1 text-[10px] font-mono bg-black text-white uppercase tracking-widest shrink-0"
              >
                Active
              </span>
            </div>
            
            <div class="flex flex-wrap gap-2 mb-6">
              <span
                v-if="project.stack?.Frontend"
                class="px-2 py-1 text-[10px] font-mono border border-black/20 text-gray-600 uppercase"
              >
                {{ project.stack.Frontend }}
              </span>
              <span
                v-if="project.stack?.Backend"
                class="px-2 py-1 text-[10px] font-mono border border-black/20 text-gray-600 uppercase"
              >
                {{ project.stack.Backend }}
              </span>
            </div>
            
            <div class="flex gap-3 mt-auto">
              <a
                v-if="project.url"
                :href="project.url"
                target="_blank"
                rel="noopener noreferrer"
                class="py-2 px-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
              >
                Live Demo
              </a>
              <a
                v-if="project.git"
                :href="project.git"
                target="_blank"
                rel="noopener noreferrer"
                class="py-2 px-4 border border-black/20 hover:bg-black/5 text-xs font-bold uppercase tracking-widest transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
