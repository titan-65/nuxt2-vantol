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
  <div class="min-h-screen bg-[#0a0a0a] text-white font-sans">
    <div class="max-w-5xl mx-auto px-6 py-12">
      <div class="flex flex-col lg:flex-row gap-12">
        <!-- Main Content -->
        <div class="w-full lg:w-8/12">
          <!-- Header -->
          <div class="mb-10 border-b border-white/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Blog</p>
              <h1 class="text-4xl font-semibold tracking-tight">Writing</h1>

              <p v-if="selectedTag" class="text-sm text-zinc-500 mt-2">
                Filter: <span class="text-white font-semibold">{{ selectedTag }}</span>
                <button @click="clearFilter" class="text-red-400 hover:underline ml-2 text-xs">
                  [Clear]
                </button>
              </p>
              <p class="text-xs text-zinc-600 mt-2">
                Showing {{ filteredPosts.length }} post{{ filteredPosts.length === 1 ? '' : 's' }}
                <span v-if="searchQuery"> for "{{ searchQuery }}"</span>
              </p>
            </div>

            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div class="flex items-center border border-white/10 bg-[#111] rounded-lg overflow-hidden focus-within:border-white/30 transition-colors">
                <svg class="w-4 h-4 text-zinc-600 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search posts"
                  class="px-3 py-2 bg-transparent text-xs text-white placeholder:text-zinc-600 focus:outline-none w-40 sm:w-52"
                />
              </div>
              <div class="flex items-center border border-white/10 bg-[#111] rounded-lg overflow-hidden">
                <select
                  v-model="sortOrder"
                  class="px-4 py-2 bg-transparent text-xs font-semibold text-zinc-400 focus:outline-none cursor-pointer"
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          <div v-if="filteredPosts.length === 0" class="text-center py-20 border border-dashed border-white/10 bg-[#111] rounded-xl">
            <p class="text-zinc-500 text-sm">No posts found</p>
          </div>

          <div class="space-y-0">
            <CardLong v-for="post in paginatedPosts" :key="post.slug" :item="post"/>
          </div>

          <div v-if="filteredPosts.length > postsPerPage" class="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6">
            <div class="text-xs text-zinc-600">
              Page {{ currentPage }} of {{ totalPages }}
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-2 text-xs font-semibold border border-white/10 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:border-white/30 text-zinc-400 hover:text-white transition-colors"
              >
                Prev
              </button>
              <button
                v-for="page in totalPages"
                :key="page"
                type="button"
                @click="goToPage(page)"
                :class="[
                  'px-3 py-2 text-xs font-semibold border rounded-lg transition-colors',
                  page === currentPage
                    ? 'bg-[#f5c542] text-black border-[#f5c542]'
                    : 'border-white/10 text-zinc-400 hover:border-white/30 hover:text-white'
                ]"
              >
                {{ page }}
              </button>
              <button
                type="button"
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-3 py-2 text-xs font-semibold border border-white/10 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:border-white/30 text-zinc-400 hover:text-white transition-colors"
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
        <div class="w-full lg:w-4/12 space-y-6">
          <!-- Authors Widget -->
          <div class="bg-[#111] border border-white/10 rounded-xl p-6">
            <h2 class="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-4 pb-2 border-b border-white/10">Authors</h2>
            <ul class="space-y-4">
              <PAuthor v-for="author in uniqueAuthors" :key="author.name" :author="author"/>
            </ul>
          </div>

          <!-- Tags Widget -->
          <div class="bg-[#111] border border-white/10 rounded-xl p-6">
            <h2 class="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-4 pb-2 border-b border-white/10">Tags</h2>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="tag in allTags"
                :key="tag"
                @click="selectedTag = selectedTag === tag ? null : tag"
                :class="[
                  'px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-colors',
                  selectedTag === tag
                    ? 'bg-[#f5c542] text-black border-[#f5c542]'
                    : 'bg-transparent text-zinc-500 border-white/10 hover:border-white/30 hover:text-white'
                ]"
              >
                {{ tag }}
              </button>
            </div>
          </div>

          <!-- RSS Widget -->
          <div class="bg-[#111] border border-white/10 rounded-xl p-6">
            <h2 class="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-4 pb-2 border-b border-white/10">Subscribe</h2>
            <p class="text-zinc-500 text-sm mb-4">Subscribe to the RSS feed to get updates.</p>
            <a
              href="/rss.xml"
              target="_blank"
              class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#f5c542] text-black text-xs font-bold rounded-lg hover:bg-[#e0b13a] transition-colors"
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
