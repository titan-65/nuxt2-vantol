<script setup lang="ts">
import { MessageSquare, Trash2, LogIn } from 'lucide-vue-next'

useHead({
  title: 'Guestbook - VantolBennett'
})

const { entries, loading, init, addEntry, deleteEntry, cleanup } = useGuestbook()
const { user, loading: authLoading, isAdmin, init: authInit, signInWithGoogle } = useFirebaseAuth()

const newMessage = ref('')
const submitting = ref(false)
const error = ref('')

onMounted(async () => {
  await authInit()
  init()
})

onUnmounted(() => {
  cleanup()
})

const handleSubmit = async () => {
  if (!newMessage.value.trim()) return
  if (!user.value) return

  submitting.value = true
  error.value = ''

  try {
    await addEntry(newMessage.value)
    newMessage.value = ''
  } catch (e: any) {
    error.value = e.message || 'Failed to post message'
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id: string) => {
  try {
    await deleteEntry(id)
  } catch (e: any) {
    error.value = e.message || 'Failed to delete entry'
  }
}

function formatDate(timestamp: number) {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="min-h-screen bg-[#F3F3F3] font-sans">
    <div class="container mx-auto px-6 py-20">
      <div class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="mb-12">
          <div class="flex items-center gap-2 mb-4">
            <span class="w-2 h-2 bg-[#FF4F4F] rounded-full"></span>
            <span class="text-xs font-medium tracking-widest text-gray-500 uppercase">Community</span>
          </div>
          <h1 class="text-4xl md:text-5xl font-medium tracking-tight mb-4">Guestbook</h1>
          <p class="text-lg text-gray-600 font-light">
            Leave a message, say hello, or share something cool. Sign in with Google to post.
          </p>
        </div>

        <ClientOnly>
          <!-- Sign-in / Message Form -->
          <div class="bg-white border border-black/20 p-6 mb-8">
            <div v-if="authLoading" class="flex items-center justify-center py-4">
              <div class="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
            </div>

            <div v-else-if="!user" class="text-center py-4">
              <p class="text-sm text-gray-500 font-mono mb-4">Sign in to leave a message</p>
              <button
                @click="signInWithGoogle"
                class="inline-flex items-center gap-2 bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
              >
                <LogIn class="w-4 h-4" />
                Sign in with Google
              </button>
            </div>

            <div v-else>
              <div class="flex items-center gap-3 mb-4">
                <img
                  :src="user.photoURL || ''"
                  :alt="user.displayName || 'User'"
                  class="w-8 h-8 rounded-full border border-black/10 object-cover"
                />
                <span class="text-sm font-medium">{{ user.displayName }}</span>
              </div>

              <form @submit.prevent="handleSubmit">
                <textarea
                  v-model="newMessage"
                  placeholder="Leave a message..."
                  rows="3"
                  maxlength="500"
                  class="w-full border border-black/20 bg-[#F3F3F3] p-3 text-sm font-mono outline-none focus:border-black transition-colors resize-none"
                ></textarea>

                <div class="flex items-center justify-between mt-3">
                  <span class="text-[10px] font-mono text-gray-400">{{ newMessage.length }}/500</span>
                  <button
                    type="submit"
                    :disabled="!newMessage.trim() || submitting"
                    class="bg-black text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {{ submitting ? 'Posting...' : 'Post' }}
                  </button>
                </div>

                <p v-if="error" class="text-xs text-red-600 font-mono mt-2">{{ error }}</p>
              </form>
            </div>
          </div>

          <!-- Entries -->
          <div v-if="loading" class="space-y-4">
            <div v-for="i in 3" :key="i" class="bg-white border border-black/20 p-6 animate-pulse">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div class="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div class="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>

          <div v-else-if="entries.length === 0" class="bg-white border border-black/20 p-12 text-center">
            <MessageSquare class="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p class="text-gray-500 font-mono text-sm">No messages yet. Be the first to sign the guestbook!</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="entry in entries"
              :key="entry.id"
              class="bg-white border border-black/20 p-6 hover:border-black transition-colors group"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-center gap-3">
                  <img
                    v-if="entry.authorPhoto"
                    :src="entry.authorPhoto"
                    :alt="entry.authorName"
                    class="w-8 h-8 rounded-full border border-black/10 object-cover"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500"
                  >
                    {{ entry.authorName.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <span class="text-sm font-bold">{{ entry.authorName }}</span>
                    <span class="text-[10px] font-mono text-gray-400 ml-2">{{ formatDate(entry.createdAt) }}</span>
                  </div>
                </div>

                <button
                  v-if="user && (user.email === entry.authorEmail || isAdmin)"
                  @click="handleDelete(entry.id)"
                  class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all p-1"
                  title="Delete message"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>

              <p class="mt-3 text-sm text-gray-700 font-mono leading-relaxed whitespace-pre-wrap">{{ entry.message }}</p>
            </div>
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
