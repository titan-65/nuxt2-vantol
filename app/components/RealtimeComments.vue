<script setup lang="ts">
const props = defineProps<{
  slug: string
}>()

const { comments, loading, init, addComment, deleteComment, cleanup } = useRealtimeComments(props.slug)
const { user, isAdmin, signInWithGoogle, signOut, init: initAuth } = useFirebaseAuth()

const newComment = ref('')
const isSubmitting = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  await initAuth()
  init()
})

onUnmounted(() => {
  cleanup()
})

const handleSubmit = async () => {
  if (!newComment.value.trim() || isSubmitting.value) return

  isSubmitting.value = true
  error.value = null

  try {
    await addComment(newComment.value)
    newComment.value = ''
  } catch (e: any) {
    error.value = e.message || 'Failed to add comment'
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async (commentId: string) => {
  if (!confirm('Are you sure you want to delete this comment?')) return

  try {
    await deleteComment(commentId)
  } catch (e: any) {
    error.value = e.message || 'Failed to delete comment'
  }
}

const canDelete = (comment: any) => {
  if (!user.value) return false
  return isAdmin.value || comment.authorEmail === user.value.email
}

function formatDate(timestamp: number) {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="border border-black/20 bg-white p-6 md:p-8">
    <div class="flex items-center gap-2 mb-6">
      <span class="w-2 h-2 bg-[#FF4F4F] rounded-full"></span>
      <h3 class="text-xs font-bold uppercase tracking-widest">Comments</h3>
      <span class="text-xs font-mono text-gray-400">({{ comments.length }})</span>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
    </div>

    <template v-else>
      <!-- Comments List -->
      <div v-if="comments.length > 0" class="space-y-6 mb-8">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="border-b border-black/10 pb-6 last:border-b-0 last:pb-0"
        >
          <div class="flex items-start gap-3">
            <img
              :src="comment.authorPhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comment.authorName)"
              :alt="comment.authorName"
              class="w-8 h-8 rounded-full border border-black/10 grayscale"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2 mb-1">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold uppercase tracking-wider">{{ comment.authorName }}</span>
                  <span class="text-[10px] font-mono text-gray-400">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <button
                  v-if="canDelete(comment)"
                  @click="handleDelete(comment.id)"
                  class="text-[10px] font-mono text-gray-400 hover:text-red-600 transition-colors uppercase"
                >
                  Delete
                </button>
              </div>
              <p class="text-sm text-gray-700 font-light leading-relaxed">{{ comment.text }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- No Comments -->
      <div v-else class="text-center py-8 border-b border-black/10 mb-8">
        <p class="text-sm font-mono text-gray-400">No comments yet. Be the first!</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-xs font-mono text-red-700">
        {{ error }}
      </div>

      <!-- Comment Form -->
      <div v-if="user">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <img
              :src="user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || 'U')"
              :alt="user.displayName || 'User'"
              class="w-8 h-8 rounded-full border border-black/10"
            />
            <span class="text-xs font-mono text-gray-500">Commenting as <strong class="text-black">{{ user.displayName }}</strong></span>
          </div>
          <button
            @click="signOut"
            class="text-[10px] font-mono text-gray-400 hover:text-black transition-colors uppercase"
          >
            Sign out
          </button>
        </div>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <textarea
            v-model="newComment"
            placeholder="Write a comment..."
            rows="3"
            class="w-full px-4 py-3 border border-black/20 bg-gray-50 text-sm font-mono focus:outline-none focus:border-black transition-colors resize-none"
            :disabled="isSubmitting"
          ></textarea>
          <button
            type="submit"
            :disabled="!newComment.trim() || isSubmitting"
            class="px-6 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Posting...' : 'Post Comment' }}
          </button>
        </form>
      </div>

      <!-- Sign In Prompt -->
      <div v-else class="text-center py-6 border border-dashed border-black/20 rounded">
        <p class="text-sm font-mono text-gray-500 mb-4">Sign in to join the conversation</p>
        <button
          @click="signInWithGoogle"
          class="inline-flex items-center gap-2 px-6 py-3 border border-black/20 bg-white text-xs font-bold uppercase tracking-widest hover:bg-black/5 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" class="text-gray-500">
            <path fill="currentColor" d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 1 1 0-12.065c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0 0 12.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </template>
  </div>
</template>
