<script setup lang="ts">
const { data: posts } = await useAsyncData('blog-posts', async () => {
  const items = await queryCollection('blog')
    .order('date', 'DESC')
    .all() as any[]
  return items.map((p: any) => ({ ...p, _path: p.path, slug: p.path.split('/').pop() }))
})

const route = useRoute()
const router = useRouter()

const uniqueAuthors = computed(() => {
  const authors = new Map<string, any>()
  posts.value?.forEach((post: any) => {
    if (post.author?.name && !authors.has(post.author.name)) {
      authors.set(post.author.name, post.author)
    }
  })
  return Array.from(authors.values())
})

const allTags = computed(() => {
  const tags = new Set<string>()
  posts.value?.forEach((post: any) => {
    if (post.tag) tags.add(post.tag)
  })
  return Array.from(tags).sort((a, b) => a.localeCompare(b))
})

const selectedTag = ref<string | null>(null)
const sortOrder = ref<'latest' | 'oldest'>('latest')
const searchQuery = ref('')
const currentPage = ref(1)
const postsPerPage = 6

watch(
  () => route.query.tag,
  (tag) => {
    selectedTag.value = typeof tag === 'string' && tag.length ? tag : null
    currentPage.value = 1
  },
  { immediate: true }
)

watch(selectedTag, (tag) => {
  router.replace({
    query: {
      ...route.query,
      tag: tag || undefined
    }
  })
})

const filteredPosts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  let result = posts.value || []

  if (selectedTag.value) {
    result = result.filter((post: any) => post.tag === selectedTag.value)
  }

  if (query) {
    result = result.filter((post: any) => {
      const titleMatch = post.title?.toLowerCase().includes(query)
      const descMatch = post.description?.toLowerCase().includes(query)
      const tagMatch = post.tag?.toLowerCase().includes(query)
      const keywordsMatch = post.keywords?.some((k: string) => k.toLowerCase().includes(query))
      return titleMatch || descMatch || tagMatch || keywordsMatch
    })
  }

  return result.sort((a: any, b: any) => {
    const dateA = new Date(a.date || a.createdAt).getTime()
    const dateB = new Date(b.date || b.createdAt).getTime()
    return sortOrder.value === 'latest' ? dateB - dateA : dateA - dateB
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredPosts.value.length / postsPerPage)))

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage
  return filteredPosts.value.slice(start, start + postsPerPage)
})

watch([searchQuery, sortOrder, selectedTag], () => {
  currentPage.value = 1
})

const clearFilter = () => {
  selectedTag.value = null
}

const goToPage = (page: number) => {
  const nextPage = Math.min(Math.max(1, page), totalPages.value)
  currentPage.value = nextPage
}
</script>

<template>
  <div class="min-h-screen bg-[#F3F3F3] font-sans">
    <div class="container mx-auto px-6 py-12">
      <div class="flex flex-col lg:flex-row gap-12">
        <!-- Main Content -->
        <div class="w-full lg:w-8/12">
          <!-- Header -->
          <div class="mb-10 border-b border-black/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="w-2 h-2 bg-[#FF4F4F] rounded-full"></span>
                <span class="text-xs font-medium tracking-widest text-gray-500 uppercase">BLOG</span>
              </div>
              <h1 class="text-4xl font-medium tracking-tight">Writing</h1>
              
              <p v-if="selectedTag" class="text-sm font-mono text-gray-500 mt-2">
                FILTER: <span class="text-black font-bold">{{ selectedTag }}</span>
                <button @click="clearFilter" class="text-red-500 hover:underline ml-2 uppercase text-xs">
                  [Clear]
                </button>
              </p>
              <p class="text-xs font-mono text-gray-500 mt-2">
                Showing {{ filteredPosts.length }} post{{ filteredPosts.length === 1 ? '' : 's' }}
                <span v-if="searchQuery"> for "{{ searchQuery }}"</span>
              </p>
            </div>
            
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div class="flex items-center border border-black/20 bg-white">
                <svg class="w-4 h-4 text-gray-500 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search posts"
                  class="px-3 py-2 bg-transparent text-xs font-mono tracking-widest focus:outline-none w-40 sm:w-52"
                />
              </div>
              <div class="flex items-center border border-black/20 bg-white">
              <select
                v-model="sortOrder"
                class="px-4 py-2 bg-transparent text-xs font-bold uppercase tracking-widest focus:outline-none cursor-pointer"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              </div>
            </div>
          </div>
          
          <div v-if="filteredPosts.length === 0" class="text-center py-20 border border-dashed border-black/20 bg-white">
            <p class="text-gray-500 font-mono text-sm">NO POSTS FOUND</p>
          </div>
          
          <div class="space-y-0">
            <CardLong v-for="post in paginatedPosts" :key="post.slug" :item="post"/>
          </div>

          <div v-if="filteredPosts.length > postsPerPage" class="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-black/10 pt-6">
            <div class="text-xs font-mono text-gray-500">
              Page {{ currentPage }} of {{ totalPages }}
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-2 text-xs font-bold uppercase tracking-widest border border-black/20 disabled:opacity-40 disabled:cursor-not-allowed hover:border-black"
              >
                Prev
              </button>
              <button
                v-for="page in totalPages"
                :key="page"
                type="button"
                @click="goToPage(page)"
                :class="[
                  'px-3 py-2 text-xs font-bold uppercase tracking-widest border transition-colors',
                  page === currentPage
                    ? 'bg-black text-white border-black'
                    : 'border-black/20 hover:border-black'
                ]"
              >
                {{ page }}
              </button>
              <button
                type="button"
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-3 py-2 text-xs font-bold uppercase tracking-widest border border-black/20 disabled:opacity-40 disabled:cursor-not-allowed hover:border-black"
              >
                Next
              </button>
            </div>
          </div>
          
          <div class="mt-16">
            <Newsletter />
          </div>
        </div>
        
        <!-- Sidebar -->
        <div class="w-full lg:w-4/12 space-y-8">
          <!-- Authors Widget -->
          <div class="border border-black/20 bg-white p-6">
            <h2 class="text-xs font-bold uppercase tracking-widest mb-4 border-b border-black/10 pb-2">Authors</h2>
            <ul class="space-y-4">
              <PAuthor v-for="author in uniqueAuthors" :key="author.name" :author="author"/>
            </ul>
          </div>
          
          <!-- Tags Widget -->
          <div class="border border-black/20 bg-white p-6">
            <h2 class="text-xs font-bold uppercase tracking-widest mb-4 border-b border-black/10 pb-2">Tags</h2>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="tag in allTags"
                :key="tag"
                @click="selectedTag = selectedTag === tag ? null : tag"
                :class="[
                  'px-3 py-1 text-[10px] font-mono uppercase border transition-colors',
                  selectedTag === tag
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-600 border-black/20 hover:border-black'
                ]"
              >
                {{ tag }}
              </button>
            </div>
          </div>
          
          <!-- RSS Widget -->
          <div class="border border-black/20 bg-white p-6">
            <h2 class="text-xs font-bold uppercase tracking-widest mb-4 border-b border-black/10 pb-2">Subscribe</h2>
            <p class="text-gray-600 text-sm font-light mb-4">Subscribe to the RSS feed to get updates.</p>
            <a
              href="/rss.xml"
              target="_blank"
              class="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/>
              </svg>
              RSS Feed
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
