<script setup lang="ts">
defineProps<{
  item: {
    title: string;
    preview: string;
    tag: string;
    image: string;
    url: string;
    git: string;
    stack: {
      Backend?: string;
      Frontend?: string;
      css?: string;
    };
    path: string;
  };
}>();
</script>

<template>
  <div
    class="group flex flex-col bg-[#111] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300"
  >
    <!-- Image -->
    <div class="relative h-48 overflow-hidden">
      <img
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        :src="item.image"
        :alt="item.title"
        width="1200"
        height="800"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent opacity-40" />
      <div class="absolute bottom-3 left-3">
        <span
          class="inline-block bg-black/60 backdrop-blur-sm border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md text-zinc-300"
        >
          {{ item.tag }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 p-5 flex flex-col">
      <h3 class="text-base font-semibold mb-2 group-hover:text-[#f5c542] transition-colors">
        {{ item.title }}
      </h3>

      <p class="text-sm text-zinc-500 mb-5 line-clamp-2 flex-1">
        {{ item.preview }}
      </p>

      <!-- Stack -->
      <div class="space-y-2 mb-5">
        <div v-if="item.stack?.Backend" class="flex items-center gap-2 text-[11px] text-zinc-600">
          <span class="w-14 font-medium text-zinc-400 uppercase">Backend</span>
          <span>{{ item.stack.Backend }}</span>
        </div>
        <div v-if="item.stack?.Frontend" class="flex items-center gap-2 text-[11px] text-zinc-600">
          <span class="w-14 font-medium text-zinc-400 uppercase">Frontend</span>
          <span>{{ item.stack.Frontend }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-white/10">
        <a
          v-if="item.url"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#f5c542] text-black hover:bg-[#e0b13a] transition-colors"
        >
          Live Demo
        </a>
        <a
          v-if="item.git"
          :href="item.git"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-white/10 text-zinc-300 hover:bg-white/5 hover:border-white/20 transition-colors"
        >
          GitHub
        </a>
      </div>
    </div>
  </div>
</template>
