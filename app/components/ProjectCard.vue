<script setup lang="ts">
defineProps<{
  item: {
    title: string
    preview: string
    tag: string
    image: string
    url: string
    git: string
    stack: {
      Backend?: string
      Frontend?: string
      css?: string
    }
    path: string
  }
}>()
</script>

<template>
  <div class="group h-full flex flex-col border border-black/20 bg-white hover:border-black transition-all duration-300">
    <!-- Image -->
    <div class="relative h-48 overflow-hidden border-b border-black/20 group-hover:border-black transition-colors">
      <img
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter grayscale group-hover:grayscale-0"
        :src="item.image"
        :alt="item.title"
      />
      <div class="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-sm border-t border-black/20 p-2 flex items-center justify-between">
        <span class="text-xs font-mono font-bold uppercase tracking-wider">{{ item.tag }}</span>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 p-5 flex flex-col">
      <h3 class="text-xl font-bold mb-2 group-hover:underline decoration-1 underline-offset-4">
        {{ item.title }}
      </h3>

      <p class="text-sm text-gray-600 mb-6 font-light line-clamp-2 flex-1">
        {{ item.preview }}
      </p>

      <!-- Stack -->
      <div class="space-y-3 mb-6">
        <div v-if="item.stack?.Backend" class="flex items-center gap-2 text-xs font-mono text-gray-500">
          <span class="w-16 font-bold text-black uppercase">Backend:</span>
          <span>{{ item.stack.Backend }}</span>
        </div>
        <div v-if="item.stack?.Frontend" class="flex items-center gap-2 text-xs font-mono text-gray-500">
          <span class="w-16 font-bold text-black uppercase">Frontend:</span>
          <span>{{ item.stack.Frontend }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-black/10">
        <a
          v-if="item.url"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest bg-black text-white hover:bg-gray-800 transition-colors"
        >
          Live Demo
        </a>
        <a
          v-if="item.git"
          :href="item.git"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border border-black/20 hover:bg-black/5 transition-colors"
        >
          GitHub
        </a>
      </div>
    </div>
  </div>
</template>
