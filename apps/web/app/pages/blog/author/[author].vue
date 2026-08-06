<script setup lang="ts">
const route = useRoute();
const authorName = route.params.author as string;

const { data: posts } = await useAsyncData(`author-${authorName}`, async () => {
  const items = (await queryCollection("blog").all()) as any[];
  const regex = new RegExp(authorName, "i");
  return items
    .filter((p) => regex.test(p.author?.name || ""))
    .map((p) => ({ ...p, slug: p.path?.split("/").pop() }));
});

const author = computed(() => posts.value?.[0]?.author);

function formatDate(date: string | Date) {
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString("en", options);
}
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a] text-white font-sans py-12">
    <div class="max-w-[1088px] mx-auto px-6">
      <div
        v-if="author"
        class="text-center mb-12 border border-white/10 bg-[#111] rounded-xl p-10 max-w-4xl mx-auto"
      >
        <div class="relative inline-block mb-6">
          <NuxtImg
            :src="author.img"
            :alt="author.name"
            width="128"
            height="128"
            class="w-32 h-32 rounded-full mx-auto object-cover border border-white/10"
          />
          <div
            class="absolute -bottom-2 -right-2 w-8 h-8 bg-[#f5c542] text-black rounded-full flex items-center justify-center border-4 border-[#111]"
          >
            <svg
              width="12"
              height="12"
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

        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">
          Author Profile
        </p>
        <h1 class="text-4xl md:text-5xl font-semibold tracking-tight leading-tight mb-4">
          {{ author.name }}
        </h1>
        <div
          class="flex items-center justify-center gap-4 text-xs text-zinc-500 uppercase tracking-widest"
        >
          <span>{{ posts?.length || 0 }} Articles</span>
          <span v-if="author.website" class="w-1 h-1 bg-zinc-700 rounded-full"></span>
          <a
            v-if="author.website"
            :href="`https://${author.website}`"
            target="_blank"
            class="hover:text-[#f5c542] transition-colors"
          >
            {{ author.website }}
          </a>
        </div>
      </div>

      <div v-if="posts && posts.length > 0" class="max-w-4xl mx-auto space-y-0">
        <CardLong v-for="post in posts" :key="post.slug" :item="post" />
      </div>

      <div
        v-else
        class="text-center py-20 border border-dashed border-white/10 bg-[#111] rounded-xl max-w-4xl mx-auto"
      >
        <p class="text-zinc-500 text-sm uppercase tracking-widest">
          No posts found for this author
        </p>
        <NuxtLink
          to="/blog"
          class="inline-block mt-8 border border-white/10 px-6 py-3 text-xs font-bold uppercase hover:bg-white/5 hover:border-white/20 transition-all rounded-lg text-zinc-300"
        >
          Back to all posts
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
