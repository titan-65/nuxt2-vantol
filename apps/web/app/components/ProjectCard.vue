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
    class="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:border-border-strong transition-all duration-300"
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
      <div class="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-40" />
      <div class="absolute bottom-3 left-3">
        <span
          class="inline-block bg-foreground/60 backdrop-blur-sm border border-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md text-foreground"
        >
          {{ item.tag }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 p-5 flex flex-col">
      <h3 class="text-base font-semibold mb-2 group-hover:text-blue transition-colors">
        {{ item.title }}
      </h3>

      <p class="text-sm text-muted-foreground mb-5 line-clamp-2 flex-1">
        {{ item.preview }}
      </p>

      <!-- Stack -->
      <div class="space-y-2 mb-5">
        <div v-if="item.stack?.Backend" class="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span class="w-14 font-medium text-muted-foreground uppercase">Backend</span>
          <span>{{ item.stack.Backend }}</span>
        </div>
        <div v-if="item.stack?.Frontend" class="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span class="w-14 font-medium text-muted-foreground uppercase">Frontend</span>
          <span>{{ item.stack.Frontend }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-border">
        <a
          v-if="item.url"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-brand text-brand-foreground hover:bg-brand-hover transition-colors"
        >
          Live Demo
        </a>
        <a
          v-if="item.git"
          :href="item.git"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-accent hover:border-border-strong transition-colors"
        >
          GitHub
        </a>
      </div>
    </div>
  </div>
</template>
