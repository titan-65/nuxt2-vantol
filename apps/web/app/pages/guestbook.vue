<script setup lang="ts">
import { MessageSquare, Trash2, LogIn } from "lucide-vue-next";

useHead({
  title: "Guestbook - VantolBennett",
});

const { entries, loading, init, addEntry, deleteEntry, cleanup } = useGuestbook();
const { user, loading: authLoading, isAdmin, init: authInit, signInWithGoogle } = useFirebaseAuth();

const newMessage = ref("");
const submitting = ref(false);
const error = ref("");

onMounted(async () => {
  await authInit();
  init();
});

onUnmounted(() => {
  cleanup();
});

const handleSubmit = async () => {
  if (!newMessage.value.trim()) return;
  if (!user.value) return;

  submitting.value = true;
  error.value = "";

  try {
    await addEntry(newMessage.value);
    newMessage.value = "";
  } catch (e: any) {
    error.value = e.message || "Failed to post message";
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (id: string) => {
  try {
    await deleteEntry(id);
  } catch (e: any) {
    error.value = e.message || "Failed to delete entry";
  }
};

function formatDate(timestamp: number) {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground font-sans">
    <div class="max-w-2xl mx-auto px-6 py-20">
      <!-- Header -->
      <div class="mb-12">
        <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Community</p>
        <h1 class="text-4xl md:text-5xl font-semibold tracking-tight mb-4">Guestbook</h1>
        <p class="text-lg text-muted-foreground font-light">
          Leave a message, say hello, or share something cool. Sign in with Google to post.
        </p>
      </div>

      <ClientOnly>
        <!-- Sign-in / Message Form -->
        <div class="bg-card border border-border rounded-xl p-6 mb-8">
          <div v-if="authLoading" class="flex items-center justify-center py-4">
            <div
              class="w-5 h-5 border-2 border-border-strong border-t-white rounded-full animate-spin"
            ></div>
          </div>

          <div v-else-if="!user" class="text-center py-4">
            <p class="text-sm text-muted-foreground mb-4">Sign in to leave a message</p>
            <button
              @click="signInWithGoogle"
              class="inline-flex items-center gap-2 bg-brand text-brand-foreground px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-brand-hover transition-colors rounded-lg"
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
                class="w-8 h-8 rounded-full border border-border object-cover"
              />
              <span class="text-sm font-medium">{{ user.displayName }}</span>
            </div>

            <form @submit.prevent="handleSubmit">
              <textarea
                v-model="newMessage"
                placeholder="Leave a message..."
                rows="3"
                maxlength="500"
                class="w-full border border-border bg-background p-3 text-sm text-foreground placeholder-zinc-600 outline-none focus:border-blue transition-colors resize-none rounded-lg"
              ></textarea>

              <div class="flex items-center justify-between mt-3">
                <span class="text-[10px] text-muted-foreground">{{ newMessage.length }}/500</span>
                <button
                  type="submit"
                  :disabled="!newMessage.trim() || submitting"
                  class="bg-brand text-brand-foreground px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-brand-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded-lg"
                >
                  {{ submitting ? "Posting..." : "Post" }}
                </button>
              </div>

              <p v-if="error" class="text-xs text-danger mt-2">{{ error }}</p>
            </form>
          </div>
        </div>

        <!-- Entries -->
        <div v-if="loading" class="space-y-4">
          <div
            v-for="i in 3"
            :key="i"
            class="bg-card border border-border rounded-xl p-6 animate-pulse"
          >
            <div class="flex items-center gap-3 mb-3">
              <div class="w-8 h-8 bg-muted rounded-full"></div>
              <div class="h-4 bg-muted rounded w-24"></div>
            </div>
            <div class="h-4 bg-muted rounded w-full"></div>
          </div>
        </div>

        <div
          v-else-if="entries.length === 0"
          class="bg-card border border-border rounded-xl p-12 text-center"
        >
          <MessageSquare class="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p class="text-muted-foreground text-sm">No messages yet. Be the first to sign the guestbook!</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="entry in entries"
            :key="entry.id"
            class="bg-card border border-border rounded-xl p-6 hover:border-border-strong transition-colors group"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-center gap-3">
                <img
                  v-if="entry.authorPhoto"
                  :src="entry.authorPhoto"
                  :alt="entry.authorName"
                  class="w-8 h-8 rounded-full border border-border object-cover"
                />
                <div
                  v-else
                  class="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground"
                >
                  {{ entry.authorName.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <span class="text-sm font-semibold">{{ entry.authorName }}</span>
                  <span class="text-[10px] text-muted-foreground ml-2">{{
                    formatDate(entry.createdAt)
                  }}</span>
                </div>
              </div>

              <button
                v-if="user && (user.email === entry.authorEmail || isAdmin)"
                @click="handleDelete(entry.id)"
                class="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-danger transition-all p-1"
                title="Delete message"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>

            <p class="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {{ entry.message }}
            </p>
          </div>
        </div>

        <template #fallback>
          <div class="bg-card border border-border rounded-xl p-12 text-center">
            <div
              class="inline-block w-5 h-5 border-2 border-border-strong border-t-white rounded-full animate-spin"
            ></div>
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
