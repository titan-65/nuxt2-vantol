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

function tagLabel(tag: string | undefined) {
  return (tag || "").replace(/^["'“”\s]+|["'“”\s]+$/g, "").trim();
}

function formatDate(date: string | Date | undefined) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}
</script>

<template>
  <div v-if="relatedPosts && relatedPosts.length > 0">
    <NuxtLink
      v-for="post in relatedPosts"
      :key="post.slug"
      :to="`/blog/${post.slug}`"
      class="group block border-t border-border py-4 first:border-t-0 first:pt-0"
    >
      <p class="ledger-meta">{{ formatDate(post.date) }} · {{ tagLabel(post.tag) }}</p>
      <p class="mt-2 text-[15px] font-medium leading-snug transition-colors group-hover:text-blue">
        {{ post.title }}
      </p>
    </NuxtLink>
  </div>
</template>
