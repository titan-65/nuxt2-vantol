<script setup lang="ts">
const route = useRoute()
const { data: project } = await useAsyncData('project-' + route.path, () => {
  return queryCollection('projects').path(route.path).first() as Promise<any>
})
</script>

<template>
  <div class="min-h-screen bg-[#F3F3F3] font-sans">
    <div class="container mx-auto px-6 py-12">
      <div v-if="project" class="max-w-4xl mx-auto">
        <div class="mb-8">
          <NuxtLink to="/projects" class="text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-2 mb-6">
            <- Back to Projects
          </NuxtLink>
          
          <div class="bg-white border border-black/20 p-8 md:p-12">
            <h1 class="text-3xl md:text-5xl font-medium tracking-tight mb-6">{{ project.title }}</h1>
            
            <div class="flex flex-wrap gap-4 mb-8 text-xs font-mono text-gray-500 uppercase">
              <div v-if="project.stack?.Frontend">
                <span class="font-bold text-black">Frontend:</span> {{ project.stack.Frontend }}
              </div>
              <div v-if="project.stack?.Backend">
                <span class="font-bold text-black">Backend:</span> {{ project.stack.Backend }}
              </div>
              <div v-if="project.tag">
                <span class="font-bold text-black">Tag:</span> {{ project.tag }}
              </div>
            </div>

            <div class="mb-8 border border-black/10 p-2 bg-gray-50">
               <img :src="project.image" class="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-500" />
            </div>
            
            <div class="prose prose-neutral max-w-none font-light">
              <ContentRenderer :value="project" />
            </div>
            
            <div class="mt-12 pt-8 border-t border-black/10 flex gap-4">
              <a 
                v-if="project.url" 
                :href="project.url" 
                target="_blank"
                class="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
              >
                View Live Site
              </a>
              <a 
                v-if="project.git" 
                :href="project.git" 
                target="_blank"
                class="px-6 py-3 border border-black/20 text-xs font-bold uppercase tracking-widest hover:bg-black/5 transition-colors"
              >
                View Source
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
