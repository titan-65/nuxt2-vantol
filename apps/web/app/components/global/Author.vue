<script setup lang="ts">
defineProps<{
  author: {
    name: string;
    img: string;
    website?: string;
  };
}>();
</script>

<template>
  <div class="flex items-center gap-4 my-12 border-t border-white/10 pt-12">
    <NuxtLink :to="`/blog/author/${author?.name}`" class="flex items-center gap-4 group">
      <div class="relative">
        <NuxtImg
          :src="author?.img"
          :alt="author?.name"
          width="96"
          height="80"
          class="h-20 w-24 border border-white/10 rounded-lg object-cover"
        />
        <div
          class="absolute -bottom-2 -right-2 w-6 h-6 bg-[#f5c542] text-black flex items-center justify-center border-2 border-[#0a0a0a] rounded-full"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      </div>
      <div>
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1">
          Written by
        </p>
        <p class="text-xl font-semibold text-white group-hover:text-[#f5c542] transition-colors">
          {{ author?.name }}
        </p>
        <p
          v-if="author?.website"
          class="text-xs font-mono text-zinc-500 mt-1 uppercase tracking-widest"
        >
          {{ author.website }}
        </p>
      </div>
    </NuxtLink>
  </div>
</template>
