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
  if (!confirm("Delete this comment?")) return;

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
  <div class="border-t border-border pt-6">
    <div class="flex items-baseline justify-between">
      <p class="label">Discussion</p>
      <span class="ledger-meta">{{ comments.length }}</span>
    </div>

    <div v-if="loading" class="py-8">
      <p class="font-serif text-[15px] text-muted-foreground">Loading the thread…</p>
    </div>

    <template v-else>
      <div v-if="comments.length > 0">
        <article
          v-for="comment in comments"
          :key="comment.id"
          class="border-b border-border py-5 last:border-b-0"
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
              class="h-8 w-8 border border-border object-cover grayscale"
            />
            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-3">
                <p class="text-[12px]">
                  <span class="font-semibold text-foreground">{{ comment.authorName }}</span>
                  <span class="ml-2 font-mono text-[9px] text-faint-ink">{{
                    formatDate(comment.createdAt)
                  }}</span>
                </p>
                <button
                  v-if="canDelete(comment)"
                  type="button"
                  class="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-danger"
                  @click="handleDelete(comment.id)"
                >
                  Delete
                </button>
              </div>
              <p class="mt-2 font-serif text-[15px] leading-[1.7] text-muted-foreground">
                {{ comment.text }}
              </p>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="border-b border-border py-8">
        <p class="font-serif text-[15px] text-muted-foreground">
          No comments yet. Be the first to add a note.
        </p>
      </div>

      <div
        v-if="error"
        class="mt-4 border border-danger/30 bg-danger/5 p-3 text-[12px] text-danger"
        role="alert"
      >
        {{ error }}
      </div>

      <div v-if="user" class="mt-6">
        <div class="mb-3 flex items-center justify-between gap-4">
          <div class="flex items-center gap-2.5">
            <NuxtImg
              :src="
                user.photoURL ||
                'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || 'U')
              "
              :alt="user.displayName || 'User'"
              width="28"
              height="28"
              class="h-7 w-7 border border-border object-cover grayscale"
            />
            <span class="text-[12px] text-muted-foreground">
              Commenting as <strong class="font-semibold text-foreground">{{
                user.displayName
              }}</strong>
            </span>
          </div>
          <button
            type="button"
            class="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground"
            @click="signOut"
          >
            Sign out
          </button>
        </div>

        <form class="space-y-3" @submit.prevent="handleSubmit">
          <label for="comment-body" class="sr-only">Comment</label>
          <textarea
            id="comment-body"
            v-model="newComment"
            placeholder="Add a correction, a question, or a war story…"
            rows="3"
            class="field min-h-[7rem] resize-y font-serif text-[15px] leading-relaxed"
            :disabled="isSubmitting"
          />
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="!newComment.trim() || isSubmitting"
          >
            {{ isSubmitting ? "Posting…" : "Post comment" }}
          </button>
        </form>
      </div>

      <div v-else class="mt-6 border-y border-border py-6">
        <p class="font-serif text-[15px] text-muted-foreground">
          Sign in to join the conversation.
        </p>
        <button type="button" class="btn btn-secondary mt-4" @click="signInWithGoogle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            class="text-muted-foreground"
            aria-hidden="true"
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
