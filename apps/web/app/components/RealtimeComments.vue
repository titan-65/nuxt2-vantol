<script setup lang="ts">
const props = defineProps<{
  slug: string;
}>();

const { comments, loading, init, addComment, deleteComment, cleanup } = useRealtimeComments(
  props.slug,
);
const { user, isAdmin, signInWithGoogle, signOut, init: initAuth } = useFirebaseAuth();

const newComment = ref("");
const isSubmitting = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  await initAuth();
  init();
});

onUnmounted(() => {
  cleanup();
});

const handleSubmit = async () => {
  if (!newComment.value.trim() || isSubmitting.value) return;

  isSubmitting.value = true;
  error.value = null;

  try {
    await addComment(newComment.value);
    newComment.value = "";
  } catch (e: any) {
    error.value = e.message || "Failed to add comment";
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async (commentId: string) => {
  if (!confirm("Are you sure you want to delete this comment?")) return;

  try {
    await deleteComment(commentId);
  } catch (e: any) {
    error.value = e.message || "Failed to delete comment";
  }
};

const canDelete = (comment: any) => {
  if (!user.value) return false;
  return isAdmin.value || comment.authorEmail === user.value.email;
};

function formatDate(timestamp: number) {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>

<template>
  <div class="border border-white/10 bg-[#111] rounded-xl p-6 md:p-8">
    <div class="flex items-center gap-2 mb-6">
      <span class="text-xs font-bold uppercase tracking-widest text-zinc-500">Comments</span>
      <span class="text-xs text-zinc-600">({{ comments.length }})</span>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div
        class="inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"
      ></div>
    </div>

    <template v-else>
      <!-- Comments List -->
      <div v-if="comments.length > 0" class="space-y-6 mb-8">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="border-b border-white/10 pb-6 last:border-b-0 last:pb-0"
        >
          <div class="flex items-start gap-3">
            <NuxtImg
              :src="
                comment.authorPhoto ||
                'https://ui-avatars.com/api/?name=' + encodeURIComponent(comment.authorName)
              "
              :alt="comment.authorName"
              width="32"
              height="32"
              class="w-8 h-8 rounded-full border border-white/10"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2 mb-1">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold uppercase tracking-wider">{{
                    comment.authorName
                  }}</span>
                  <span class="text-[10px] text-zinc-600">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <button
                  v-if="canDelete(comment)"
                  @click="handleDelete(comment.id)"
                  class="text-[10px] text-zinc-500 hover:text-red-400 transition-colors uppercase"
                >
                  Delete
                </button>
              </div>
              <p class="text-sm text-zinc-400 font-light leading-relaxed">{{ comment.text }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- No Comments -->
      <div v-else class="text-center py-8 border-b border-white/10 mb-8">
        <p class="text-sm text-zinc-500">No comments yet. Be the first!</p>
      </div>

      <!-- Error Message -->
      <div
        v-if="error"
        class="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-xs text-red-400 rounded-lg"
      >
        {{ error }}
      </div>

      <!-- Comment Form -->
      <div v-if="user">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <NuxtImg
              :src="
                user.photoURL ||
                'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || 'U')
              "
              :alt="user.displayName || 'User'"
              width="32"
              height="32"
              class="w-8 h-8 rounded-full border border-white/10"
            />
            <span class="text-xs text-zinc-500"
              >Commenting as <strong class="text-white">{{ user.displayName }}</strong></span
            >
          </div>
          <button
            @click="signOut"
            class="text-[10px] text-zinc-500 hover:text-white transition-colors uppercase"
          >
            Sign out
          </button>
        </div>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <textarea
            v-model="newComment"
            placeholder="Write a comment..."
            rows="3"
            class="w-full px-4 py-3 border border-white/10 bg-[#0a0a0a] text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors resize-none rounded-lg"
            :disabled="isSubmitting"
          ></textarea>
          <button
            type="submit"
            :disabled="!newComment.trim() || isSubmitting"
            class="px-6 py-2 bg-[#f5c542] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#e0b13a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
          >
            {{ isSubmitting ? "Posting..." : "Post Comment" }}
          </button>
        </form>
      </div>

      <!-- Sign In Prompt -->
      <div v-else class="text-center py-6 border border-dashed border-white/10 rounded-lg">
        <p class="text-sm text-zinc-500 mb-4">Sign in to join the conversation</p>
        <button
          @click="signInWithGoogle"
          class="inline-flex items-center gap-2 px-6 py-3 border border-white/10 bg-[#111] text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors rounded-lg text-zinc-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            class="text-zinc-500"
          >
            <path
              fill="currentColor"
              d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 1 1 0-12.065c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0 0 12.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748z"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </template>
  </div>
</template>
