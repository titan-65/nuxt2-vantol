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
  <div class="min-h-screen bg-[#0a0a0a] text-white font-sans">
    <div class="max-w-3xl mx-auto px-6 py-20">
      <!-- Header -->
      <div class="mb-12">
        <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Reading List</p>
        <h1 class="text-4xl md:text-5xl font-semibold tracking-tight mb-4">Saved Posts</h1>
        <p class="text-lg text-zinc-400 font-light">
          Posts you've saved to read later.
        </p>
      </div>

      <!-- Bookmarks List -->
      <ClientOnly>
        <div v-if="bookmarks.length > 0" class="space-y-4">
          <div 
            v-for="bookmark in bookmarks" 
            :key="bookmark.slug"
            class="bg-[#111] border border-white/10 rounded-xl p-6 flex items-center justify-between hover:border-white/20 transition-colors"
          >
            <div class="flex-1 min-w-0">
              <NuxtLink 
                :to="`/blog/${bookmark.slug}`"
                class="text-lg font-medium hover:text-[#f5c542] transition-colors block truncate"
              >
                {{ bookmark.title }}
              </NuxtLink>
              <span class="text-xs text-zinc-600 mt-1">
                Saved {{ formatDate(bookmark.savedAt) }}
              </span>
            </div>
            <button 
              @click="removeBookmark(bookmark.slug)"
              class="ml-4 text-xs font-medium text-zinc-500 hover:text-red-400 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="bg-[#111] border border-white/10 rounded-xl p-12 text-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none"
            stroke="currentColor" 
            stroke-width="1.5"
            class="mx-auto mb-4 text-zinc-700"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <p class="text-zinc-500 text-sm mb-4">No saved posts yet</p>
          <NuxtLink 
            to="/blog"
            class="inline-block px-6 py-3 bg-[#f5c542] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#e0b13a] transition-colors rounded-lg"
          >
            Browse Posts
          </NuxtLink>
        </div>

        <template #fallback>
          <div class="bg-[#111] border border-white/10 rounded-xl p-12 text-center">
            <div class="inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
