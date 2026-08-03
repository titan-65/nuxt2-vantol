<script setup lang="ts">
const { data: projects } = await useAsyncData("projects", async () => {
  const items = (await queryCollection("projects").all()) as any[];
  return items.map((p: any) => ({ ...p, _path: p.path, slug: p.path.split("/").pop() }));
});

const allTechnologies = computed(() => {
  const techs = new Set<string>();
  projects.value?.forEach((project: any) => {
    if (project.stack?.Frontend) techs.add(project.stack.Frontend);
    if (project.stack?.Backend) techs.add(project.stack.Backend);
    if (project.stack?.Framework) techs.add(project.stack.Framework);
  });
  return Array.from(techs).sort();
});

const selectedTech = ref<string | null>(null);
const viewMode = ref<"grid" | "list">("grid");

const filteredProjects = computed(() => {
  if (!selectedTech.value) return projects.value || [];

  return (projects.value || []).filter((project: any) => {
    const stack = project.stack || {};
    return (
      stack.Frontend === selectedTech.value ||
      stack.Backend === selectedTech.value ||
      stack.Framework === selectedTech.value
    );
  });
});

const clearFilter = () => {
  selectedTech.value = null;
};
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a] text-white font-sans">
    <div class="max-w-[1088px] mx-auto px-6 py-12">
      <div class="text-center mb-16 border-b border-white/10 pb-12">
        <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Portfolio</p>
        <h1 class="text-4xl md:text-5xl font-semibold tracking-tight mb-4">Projects</h1>
        <p class="text-zinc-500 font-light max-w-2xl mx-auto">
          A collection of projects built with various technologies including Vue.js, Nuxt.js, React,
          and more.
        </p>
      </div>

      <!-- Controls -->
      <div
        class="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-white/10 pb-6"
      >
        <div class="flex flex-wrap justify-center gap-2">
          <button
            @click="clearFilter"
            :class="[
              'px-4 py-2 text-xs font-bold uppercase tracking-widest border rounded-lg transition-colors',
              !selectedTech
                ? 'bg-[#f5c542] text-black border-[#f5c542]'
                : 'bg-transparent text-zinc-500 border-white/10 hover:border-white/30 hover:text-white',
            ]"
          >
            All
          </button>
          <button
            v-for="tech in allTechnologies"
            :key="tech"
            @click="selectedTech = selectedTech === tech ? null : tech"
            :class="[
              'px-4 py-2 text-xs font-bold uppercase tracking-widest border rounded-lg transition-colors',
              selectedTech === tech
                ? 'bg-[#f5c542] text-black border-[#f5c542]'
                : 'bg-transparent text-zinc-500 border-white/10 hover:border-white/30 hover:text-white',
            ]"
          >
            {{ tech }}
          </button>
        </div>

        <div
          class="flex items-center gap-0 border border-white/10 rounded-lg overflow-hidden bg-[#111]"
        >
          <button
            @click="viewMode = 'grid'"
            :class="[
              'p-2 transition-colors border-r border-white/10',
              viewMode === 'grid'
                ? 'bg-white/10 text-white'
                : 'bg-transparent text-zinc-500 hover:text-white',
            ]"
            aria-label="Grid view"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
          <button
            @click="viewMode = 'list'"
            :class="[
              'p-2 transition-colors',
              viewMode === 'list'
                ? 'bg-white/10 text-white'
                : 'bg-transparent text-zinc-500 hover:text-white',
            ]"
            aria-label="List view"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        v-if="filteredProjects.length === 0"
        class="text-center py-20 border border-dashed border-white/10 bg-[#111] rounded-xl"
      >
        <p class="text-zinc-500 text-sm mb-4">No projects found</p>
        <button
          @click="clearFilter"
          class="text-zinc-400 hover:text-[#f5c542] text-xs font-bold uppercase tracking-widest transition-colors"
        >
          Clear filter
        </button>
      </div>

      <div
        v-else-if="viewMode === 'grid'"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <ProjectCard v-for="project in filteredProjects" :key="project.slug" :item="project" />
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="project in filteredProjects"
          :key="project.slug"
          class="bg-[#111] border border-white/10 rounded-xl p-6 flex flex-col md:flex-row gap-6 hover:border-white/20 transition-colors group"
        >
          <div class="md:w-64 h-48 md:h-auto overflow-hidden shrink-0 rounded-lg bg-zinc-900">
            <img
              :src="project.image"
              :alt="project.title"
              width="1200"
              height="800"
              class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
          </div>

          <div class="flex-1 flex flex-col">
            <div class="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 class="text-xl font-semibold mb-2 group-hover:text-[#f5c542] transition-colors">
                  {{ project.title }}
                </h3>
                <p class="text-zinc-500 text-sm line-clamp-2">
                  {{ project.preview }}
                </p>
              </div>
              <span
                v-if="project.active"
                class="px-2 py-1 text-[10px] font-bold bg-[#f5c542] text-black uppercase tracking-wider rounded-md shrink-0"
              >
                Active
              </span>
            </div>

            <div class="flex flex-wrap gap-2 mb-6">
              <span
                v-if="project.stack?.Frontend"
                class="px-2 py-1 text-[10px] font-mono border border-white/10 text-zinc-400 uppercase rounded-md"
              >
                {{ project.stack.Frontend }}
              </span>
              <span
                v-if="project.stack?.Backend"
                class="px-2 py-1 text-[10px] font-mono border border-white/10 text-zinc-400 uppercase rounded-md"
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
                class="py-2 px-4 bg-[#f5c542] text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#e0b13a] transition-colors"
              >
                Live Demo
              </a>
              <a
                v-if="project.git"
                :href="project.git"
                target="_blank"
                rel="noopener noreferrer"
                class="py-2 px-4 border border-white/10 text-zinc-300 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-white/5 hover:border-white/20 transition-colors"
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
