<script setup lang="ts">
const route = useRoute()
const { data: post } = await useAsyncData('post-' + route.path, () => {
  return queryCollection('blog').path(route.path).first() as Promise<any>
})

const { data: surround } = await useAsyncData('surround-' + route.path, () => {
  return queryCollectionItemSurroundings('blog', route.path, {
    fields: ['title', 'path']
  }) as Promise<any[]>
})

const prev = computed(() => surround.value?.[0])
const next = computed(() => surround.value?.[1])

const readingTime = computed(() => {
  if (post.value?.readTime) return post.value.readTime
  if (post.value?.body) {
    const text = JSON.stringify(post.value.body)
    const words = text.match(/\w+/g)?.length || 0
    return Math.ceil(words / 200)
  }
  return 1
})

function formatDate(date: string | Date | undefined) {
  if (!date) return ''
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(date).toLocaleDateString('en', options)
}

useHead({
  title: () => post.value?.title ? `${post.value.title} | VantolBennett` : 'VantolBennett',
  meta: [
    { name: 'description', content: () => post.value?.description || '' },
    { property: 'og:title', content: () => post.value?.title || '' },
    { property: 'og:description', content: () => post.value?.description || '' },
    { property: 'og:image', content: () => post.value?.img || '' },
  ]
})
</script>

<template>
  <div v-if="post" class="min-h-screen bg-[#F3F3F3] font-sans">
    <ReadingProgress />
    <div class="container mx-auto px-6 py-12">
      <div class="lg:flex gap-12">
        <!-- Sidebar / TOC -->
        <aside class="hidden lg:block w-64 shrink-0">
          <div class="sticky top-24 border border-black/20 bg-white p-6">
            <h3 class="text-xs font-bold uppercase tracking-widest mb-4 border-b border-black/10 pb-2">Table of Contents</h3>
            <nav class="text-sm">
              <ul class="space-y-2">
                <li v-for="link of (post.body?.toc?.links || [])" :key="link.id">
                  <NuxtLink
                    :to="`#${link.id}`"
                    class="block text-gray-500 hover:text-black hover:underline transition-colors font-mono text-xs"
                    :class="{
                      'pl-0': link.depth === 2,
                      'pl-4': link.depth === 3,
                    }"
                  >{{ link.text }}</NuxtLink>
                </li>
              </ul>
            </nav>
          </div>
        </aside>
        
        <!-- Main Content -->
        <div class="flex-auto min-w-0">
          <article class="bg-white border border-black/20 p-8 md:p-12">
            <!-- Header -->
            <header class="mb-12 border-b border-black/10 pb-8">
              <div class="flex items-center gap-3 mb-6">
                <NuxtLink
                  :to="`/blog?tag=${post.tag}`"
                  class="px-2 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                >
                  {{ post.tag }}
                </NuxtLink>
                <span class="text-xs font-mono text-gray-500 uppercase">{{ formatDate(post.date || post.createdAt) }}</span>
                <span class="text-xs font-mono text-gray-500 uppercase">• {{ readingTime }} min read</span>
              </div>
              
              <h1 class="text-3xl md:text-5xl font-medium tracking-tight mb-8 leading-tight">
                {{ post.title }}
              </h1>
              
              <div class="flex items-center gap-4">
                <img :src="post.author?.img || post.img" class="h-10 w-10 rounded-full border border-black/10 grayscale" />
                <div>
                  <p class="text-xs font-bold uppercase tracking-wider text-black">By {{ post.author?.name }}</p>
                  <p class="text-xs font-mono text-gray-500">Author</p>
                </div>
              </div>
            </header>
            
            <!-- Hero Image -->
            <div class="mb-12 border border-black/10 p-2 bg-gray-50">
              <img :src="post.img" class="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-500" />
            </div>
            
            <!-- Content -->
            <div class="prose prose-neutral max-w-none font-light prose-headings:font-medium prose-headings:tracking-tight prose-a:text-black prose-a:underline prose-a:decoration-1 prose-a:underline-offset-4 hover:prose-a:decoration-2">
              <ContentRenderer :value="post" />
            </div>
            
            <!-- Footer -->
            <div class="mt-12 pt-8 border-t border-black/10">
              <div class="flex flex-col sm:flex-row justify-between items-center gap-6">
                <div class="w-full sm:w-auto">
                  <h4 class="text-xs font-bold uppercase tracking-widest mb-4">Share this post</h4>
                  <ShareButtons :title="post.title" :description="post.description" />
                </div>
                
                <div class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <PrevNext :prev="prev" :next="next" />
                </div>
              </div>
              
              <div class="mt-12">
                <Newsletter />
              </div>
            </div>
          </article>
          
          <div class="mt-12">
            <h3 class="text-xl font-medium mb-6">Related Posts</h3>
            <RelatedPosts
              :current-slug="route.params.slug as string"
              :current-tag="post.tag"
              :current-keywords="post.keywords"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles for the post article */
</style>
