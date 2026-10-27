<script setup lang="ts">
const props = defineProps<{
  item: {
    title: string;
    description: string;
    tag: string;
    slug: string;
    date?: string | Date;
    author: {
      name: string;
      img: string;
    };
    path: string;
    excerpt?: any;
  };
}>();

function formatDate(date: string | Date | undefined) {
  if (!date) return "";
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString("en", options);
}
</script>

<template>
  <div class="mt-6">
    <div
      class="group flex flex-col md:flex-row gap-6 p-5 md:p-6 bg-card border border-border rounded-xl hover:border-border-strong transition-all"
    >
      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3 mb-3 flex-wrap">
          <span class="text-[11px] text-muted-foreground uppercase tracking-wider">{{
            formatDate(item.date)
          }}</span>
          <span class="w-1 h-1 rounded-full bg-border-strong" />
          <NuxtLink
            :to="`/blog?tag=${item.tag}`"
            class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-blue transition-colors"
          >
            {{ item.tag }}
          </NuxtLink>
        </div>

        <NuxtLink :to="`/blog/${item.slug}`" class="block group/title">
          <h2
            class="text-xl md:text-2xl font-semibold text-foreground mb-3 group-hover/title:text-blue transition-colors"
          >
            {{ item.title }}
          </h2>
        </NuxtLink>

        <div class="text-muted-foreground text-sm mb-5 leading-relaxed line-clamp-2">
          <ContentRenderer v-if="item.excerpt" :value="item.excerpt" />
          <p v-else>{{ item.description }}</p>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <NuxtLink
              :to="`/blog/${item.slug}`"
              class="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-blue transition-colors"
            >
              Read Post
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="group-hover:translate-x-0.5 transition-transform"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </NuxtLink>
            <BookmarkButton :slug="item.slug" :title="item.title" />
          </div>

          <div v-if="item.author" class="flex items-center gap-2">
            <NuxtImg
              v-if="item.author.img"
              :src="item.author.img"
              alt="avatar"
              width="24"
              height="24"
              class="w-6 h-6 rounded-full border border-border"
            />
            <NuxtLink
              :to="`/blog/author/${item.author.name}`"
              class="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {{ item.author.name }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
