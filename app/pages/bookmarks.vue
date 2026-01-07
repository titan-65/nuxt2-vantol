<script setup lang="ts">
useHead({
  title: 'Saved Posts - VantolBennett'
})

const { bookmarks, removeBookmark, loadBookmarks } = useBookmarks()

onMounted(() => {
  loadBookmarks()
})

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="min-h-screen bg-[#F3F3F3] font-sans">
    <div class="container mx-auto px-6 py-20">
      <div class="max-w-3xl mx-auto">
        <!-- Header -->
        <div class="mb-12">
          <div class="flex items-center gap-2 mb-4">
            <span class="w-2 h-2 bg-[#FF4F4F] rounded-full"></span>
            <span class="text-xs font-medium tracking-widest text-gray-500 uppercase">Reading List</span>
          </div>
          <h1 class="text-4xl md:text-5xl font-medium tracking-tight mb-4">Saved Posts</h1>
          <p class="text-lg text-gray-600 font-light">
            Posts you've saved to read later.
          </p>
        </div>

        <!-- Bookmarks List -->
        <ClientOnly>
          <div v-if="bookmarks.length > 0" class="space-y-4">
            <div 
              v-for="bookmark in bookmarks" 
              :key="bookmark.slug"
              class="bg-white border border-black/20 p-6 flex items-center justify-between hover:border-black transition-colors"
            >
              <div class="flex-1 min-w-0">
                <NuxtLink 
                  :to="`/blog/${bookmark.slug}`"
                  class="text-lg font-medium hover:underline block truncate"
                >
                  {{ bookmark.title }}
                </NuxtLink>
                <span class="text-xs font-mono text-gray-400 mt-1">
                  Saved {{ formatDate(bookmark.savedAt) }}
                </span>
              </div>
              <button 
                @click="removeBookmark(bookmark.slug)"
                class="ml-4 text-xs font-mono text-gray-400 hover:text-red-600 transition-colors uppercase"
              >
                Remove
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="bg-white border border-black/20 p-12 text-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none"
              stroke="currentColor" 
              stroke-width="1.5"
              class="mx-auto mb-4 text-gray-300"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            <p class="text-gray-500 font-mono text-sm mb-4">No saved posts yet</p>
            <NuxtLink 
              to="/blog"
              class="inline-block px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
            >
              Browse Posts
            </NuxtLink>
          </div>

          <template #fallback>
            <div class="bg-white border border-black/20 p-12 text-center">
              <div class="inline-block w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>
