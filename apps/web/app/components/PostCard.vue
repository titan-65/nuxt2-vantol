<script setup lang="ts">
const props = defineProps<{
  item: {
    title: string;
    description: string;
    tag: string;
    language: string;
    slug: string;
    img: string;
    readTime?: number;
    rating: number;
    path: string;
    body?: any;
    excerpt?: any;
  };
}>();

const readingTime = computed(() => {
  if (props.item.readTime) return props.item.readTime;
  if (props.item.body) {
    const text = JSON.stringify(props.item.body);
    const words = text.match(/\w+/g)?.length || 0;
    return Math.ceil(words / 200);
  }
  return 1;
});
</script>

<template>
  <div
    class="group flex flex-col bg-[#111] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300"
  >
    <!-- Image -->
    <div class="relative h-48 overflow-hidden">
      <NuxtImg
        :src="item.img"
        :alt="item.title"
        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent opacity-60" />
      <div class="absolute top-3 left-3">
        <span
          class="inline-block bg-black/60 backdrop-blur-sm border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md text-zinc-300"
        >
          {{ item.tag }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 p-5 flex flex-col">
      <h3
        class="text-base font-semibold leading-snug mb-2 group-hover:text-[#f5c542] transition-colors"
      >
        {{ item.title }}
      </h3>

      <div class="text-sm text-zinc-500 line-clamp-2 mb-4 flex-1">
        <ContentRenderer v-if="item.excerpt" :value="item.excerpt" />
        <p v-else>{{ item.description }}</p>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
        <div class="flex items-center gap-3 text-[11px] text-zinc-600">
          <span class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ readingTime }} min
          </span>
          <span
            class="px-1.5 py-0.5 text-[10px] font-mono border border-white/10 rounded text-zinc-500 uppercase"
          >
            {{ item.language }}
          </span>
        </div>

        <NuxtLink
          :to="`/blog/${item.slug}`"
          class="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:border-[#f5c542] hover:bg-[#f5c542]/10 transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="text-zinc-500 group-hover:text-[#f5c542] transition-colors"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
