<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    version?: string;
  }>(),
  {
    title: "Interactive Learning Platform",
    version: "4.x",
  },
);
</script>

<template>
  <header
    class="w-full bg-[#0d0d0d] border-b border-amber-500/20 py-3.5 px-6 flex items-center justify-between text-white font-sans"
  >
    <div class="flex items-center space-x-3">
      <div
        class="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center text-xs"
      >
        🎓
      </div>
      <div>
        <div class="flex items-center space-x-2">
          <span class="text-xs font-bold tracking-wide text-white">{{ title }}</span>
          <span
            class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold uppercase"
          >
            NUXT LAYER
          </span>
        </div>
        <p class="text-[10px] text-zinc-400 font-mono">
          Isolated Learning Atmosphere — Nuxt v{{ version }}
        </p>
      </div>
    </div>

    <div class="flex items-center space-x-4">
      <NuxtLink
        to="/blog"
        class="text-xs text-zinc-400 hover:text-white transition-colors font-medium"
      >
        ← Switch to Editorial Blog Site
      </NuxtLink>
    </div>
  </header>
</template>
