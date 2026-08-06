<script setup lang="ts">
const props = defineProps<{
  currentSlug: string;
  currentTag?: string;
  currentKeywords?: string[];
}>();

const { data: relatedPosts } = await useAsyncData(`related-${props.currentSlug}`, async () => {
  const posts = (await queryCollection("blog").all()) as any[];

  const scored = posts
    .filter((p) => p.path?.split("/").pop() !== props.currentSlug)
    .map((post) => {
      let score = 0;
      if (props.currentTag && post.tag === props.currentTag) {
        score += 3;
      }
      if (props.currentKeywords && post.keywords) {
        const matchingKeywords = props.currentKeywords.filter((k) => post.keywords.includes(k));
        score += matchingKeywords.length;
      }
      return { ...post, score, slug: post.path?.split("/").pop() };
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (scored.length < 3) {
    const remainingPosts = posts
      .filter((p) => {
        const slug = p.path?.split("/").pop();
        return slug !== props.currentSlug && !scored.find((s) => s.slug === slug);
      })
      .slice(0, 3 - scored.length)
      .map((p) => ({ ...p, slug: p.path?.split("/").pop() }));
    return [...scored, ...remainingPosts];
  }

  return scored;
});
</script>

<template>
  <div v-if="relatedPosts && relatedPosts.length > 0" class="mt-12 pt-8 border-t border-white/10">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <NuxtLink
        v-for="post in relatedPosts"
        :key="post.slug"
        :to="`/blog/${post.slug}`"
        class="group block border border-white/10 bg-[#111] rounded-xl overflow-hidden hover:border-white/20 transition-colors"
      >
        <div class="relative h-32 overflow-hidden">
          <NuxtImg
            :src="post.img"
            :alt="post.title"
            width="400"
            height="256"
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent opacity-40" />
        </div>
        <div class="p-4">
          <span
            v-if="post.tag"
            class="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-[#f5c542] text-black rounded-md mb-2"
          >
            {{ post.tag }}
          </span>
          <h4 class="font-medium text-sm line-clamp-2 group-hover:text-[#f5c542] transition-colors">
            {{ post.title }}
          </h4>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
