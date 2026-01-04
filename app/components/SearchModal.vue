<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const searchQuery = ref('')
const searchResults = ref<any[]>([])
const isSearching = ref(false)

const { data: allPosts } = await useAsyncData('all-posts-search', () => {
  return queryCollection('blog').all() as Promise<any[]>
})

const performSearch = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  
  isSearching.value = true
  const query = searchQuery.value.toLowerCase()
  
  searchResults.value = (allPosts.value || []).filter(post => {
    const titleMatch = post.title?.toLowerCase().includes(query)
    const descMatch = post.description?.toLowerCase().includes(query)
    const tagMatch = post.tag?.toLowerCase().includes(query)
    const keywordsMatch = post.keywords?.some((k: string) => k.toLowerCase().includes(query))
    return titleMatch || descMatch || tagMatch || keywordsMatch
  }).slice(0, 5)
  
  isSearching.value = false
}

watch(searchQuery, performSearch)

const handleClose = () => {
  searchQuery.value = ''
  searchResults.value = []
  emit('close')
}

const navigateToPost = (post: any) => {
  handleClose()
  navigateTo(`/blog/${post.path?.split('/').pop()}`)
}

onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
      handleClose()
    }
  }
  document.addEventListener('keydown', handleEscape)
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="handleClose"
    >
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="handleClose" />
      <div class="relative min-h-screen flex items-start justify-center pt-20 px-4">
        <div class="relative w-full max-w-xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
          <div class="p-4">
            <div class="flex items-center border-b border-gray-200 dark:border-gray-700 pb-4">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search posts..."
                class="w-full ml-3 bg-transparent outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400"
                autofocus
              />
              <button
                @click="handleClose"
                class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="py-4 max-h-96 overflow-y-auto">
              <div v-if="searchQuery && searchResults.length === 0 && !isSearching" class="text-center text-gray-500 py-8">
                No posts found for "{{ searchQuery }}"
              </div>
              <div v-else-if="!searchQuery" class="text-center text-gray-400 py-8">
                Start typing to search...
              </div>
              <div v-else class="space-y-2">
                <button
                  v-for="post in searchResults"
                  :key="post._path"
                  @click="navigateToPost(post)"
                  class="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <h3 class="font-medium text-gray-800 dark:text-gray-200">{{ post.title }}</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{{ post.description }}</p>
                  <span v-if="post.tag" class="inline-block mt-1 px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded">
                    {{ post.tag }}
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div class="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-xs text-gray-400 flex items-center justify-between">
            <span>Press ESC to close</span>
            <span>{{ searchResults.length }} result(s)</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
