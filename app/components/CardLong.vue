<script setup lang="ts">
const props = defineProps<{
  item: {
    title: string
    description: string
    tag: string
    slug: string
    date?: string | Date
    author: {
      name: string
      img: string
    }
    path: string
    excerpt?: any
  }
}>()

function formatDate(date: string | Date | undefined) {
  if (!date) return ''
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(date).toLocaleDateString('en', options)
}
</script>

<template>
  <div class="mt-6">
    <div class="group border border-black/20 bg-white hover:border-black transition-colors p-6 flex flex-col md:flex-row gap-6">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-3">
          <span class="text-xs font-mono text-gray-500 uppercase tracking-wider">{{ formatDate(item.date) }}</span>
          <span class="w-px h-3 bg-black/20"></span>
          <NuxtLink
            :to="`/blog?tag=${item.tag}`"
            class="text-xs font-mono font-bold uppercase tracking-wider hover:underline"
          >
            {{ item.tag }}
          </NuxtLink>
        </div>
        
        <NuxtLink
          :to="`/blog/${item.slug}`"
          class="block group-hover:underline decoration-1 underline-offset-4"
        >
          <h2 class="text-2xl font-bold text-black mb-3">
            {{ item.title }}
          </h2>
        </NuxtLink>
        
        <div class="text-gray-600 font-light mb-4 leading-relaxed excerpt-content">
          <ContentRenderer v-if="item.excerpt" :value="item.excerpt" />
          <p v-else>
            {{ item.description }}
          </p>
        </div>
        
        <div class="flex items-center justify-between mt-auto pt-4 border-t border-black/10">
          <NuxtLink
            :to="`/blog/${item.slug}`"
            class="text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white px-3 py-1 transition-colors border border-transparent hover:border-black -ml-3"
          >
            Read Post ->
          </NuxtLink>
          
          <div v-if="item.author">
            <NuxtLink
              :to="`/blog/author/${item.author.name}`"
              class="flex items-center gap-2 group/author"
            >
              <span class="text-xs font-mono text-gray-500 group-hover/author:text-black transition-colors">
                {{ item.author.name }}
              </span>
              <img
                v-if="item.author.img"
                :src="item.author.img"
                alt="avatar"
                class="w-6 h-6 rounded-full grayscale group-hover/author:grayscale-0 transition-all border border-black/10"
              />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
