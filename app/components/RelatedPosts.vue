<script setup lang="ts">
const props = defineProps<{
  currentSlug: string
  currentTag?: string
  currentKeywords?: string[]
}>()

const { data: relatedPosts } = await useAsyncData(
  `related-${props.currentSlug}`,
  async () => {
    const posts = await queryCollection('blog').all() as any[]
    
    const scored = posts
      .filter(p => p.path?.split('/').pop() !== props.currentSlug)
      .map(post => {
        let score = 0
        if (props.currentTag && post.tag === props.currentTag) {
          score += 3
        }
        if (props.currentKeywords && post.keywords) {
          const matchingKeywords = props.currentKeywords.filter(k => 
            post.keywords.includes(k)
          )
          score += matchingKeywords.length
        }
        return { ...post, score, slug: post.path?.split('/').pop() }
      })
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
    
    if (scored.length < 3) {
      const remainingPosts = posts
        .filter(p => {
          const slug = p.path?.split('/').pop()
          return slug !== props.currentSlug && !scored.find(s => s.slug === slug)
        })
        .slice(0, 3 - scored.length)
        .map(p => ({ ...p, slug: p.path?.split('/').pop() }))
      return [...scored, ...remainingPosts]
    }
    
    return scored
  }
)
</script>

<template>
  <div v-if="relatedPosts && relatedPosts.length > 0" class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
    <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Related Posts</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <NuxtLink
        v-for="post in relatedPosts"
        :key="post.slug"
        :to="`/blog/${post.slug}`"
        class="group block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
      >
        <div class="relative h-32 overflow-hidden">
          <img
            :src="post.img"
            :alt="post.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div class="p-4">
          <span v-if="post.tag" class="inline-block px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded mb-2">
            {{ post.tag }}
          </span>
          <h4 class="font-medium text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {{ post.title }}
          </h4>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
