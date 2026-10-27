<script setup lang="ts">
useHead({
  title: "Admin - VantolBennett",
});

definePageMeta({
  middleware: ["admin-auth"],
});

const { subscribers, loading, totalCount, fetchSubscribers, exportCSV } = useNewsletter();
const {
  totalViews,
  totalComments,
  totalSubscribers: analyticsSubscribers,
  popularPosts,
  loading: analyticsLoading,
  fetchAnalytics,
} = useAnalytics();

onMounted(() => {
  fetchSubscribers();
  fetchAnalytics();
});

function formatDate(timestamp: number) {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground font-sans">
    <div class="max-w-4xl mx-auto px-6 py-20">
      <div class="max-w-3xl mx-auto text-center mb-16">
        <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Administration
        </p>
        <h1 class="text-4xl md:text-5xl font-semibold tracking-tight mb-6">Content Management</h1>
        <p class="text-xl text-muted-foreground font-light leading-relaxed">
          Manage your blog posts and site content using Nuxt Studio.
        </p>
      </div>

      <!-- Analytics Stats Row -->
      <div class="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto mb-8">
        <div class="bg-card border border-border rounded-xl p-6 text-center">
          <div class="text-3xl font-bold mb-1">
            {{ analyticsLoading ? "..." : totalViews.toLocaleString() }}
          </div>
          <div class="text-xs text-muted-foreground uppercase tracking-widest">Total Views</div>
        </div>
        <div class="bg-card border border-border rounded-xl p-6 text-center">
          <div class="text-3xl font-bold mb-1">
            {{ analyticsLoading ? "..." : totalComments.toLocaleString() }}
          </div>
          <div class="text-xs text-muted-foreground uppercase tracking-widest">Total Comments</div>
        </div>
        <div class="bg-card border border-border rounded-xl p-6 text-center">
          <div class="text-3xl font-bold mb-1">
            {{ analyticsLoading ? "..." : analyticsSubscribers.toLocaleString() }}
          </div>
          <div class="text-xs text-muted-foreground uppercase tracking-widest">Subscribers</div>
        </div>
      </div>

      <!-- Popular Posts Panel -->
      <div class="max-w-4xl mx-auto mb-12" v-if="popularPosts.length > 0">
        <div class="bg-card border border-border rounded-xl p-6">
          <div class="flex items-center gap-2 mb-4">
            <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
            <h2 class="text-lg font-semibold uppercase tracking-wide">Popular Posts</h2>
          </div>
          <div class="divide-y divide-border">
            <div
              v-for="(post, index) in popularPosts"
              :key="post.slug"
              class="py-3 flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <span class="text-xs text-muted-foreground w-4">{{ index + 1 }}</span>
                <NuxtLink
                  :to="`/blog/${post.slug}`"
                  class="text-sm font-medium hover:text-blue transition-colors"
                >
                  {{ post.title }}
                </NuxtLink>
              </div>
              <div class="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{{ post.views }} views</span>
                <span>{{ post.comments }} comments</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto mb-12">
        <!-- Local Content Card -->
        <div
          class="bg-card border border-border rounded-xl p-8 hover:border-border-strong transition-colors flex flex-col md:col-span-2"
        >
          <h2 class="text-xl font-semibold mb-3 uppercase tracking-wide">Local Content</h2>
          <p class="text-sm text-muted-foreground mb-6 flex-grow">
            Edit markdown files directly in your local environment. Changes in
            <code class="text-blue">content/</code> are reflected immediately.
          </p>
          <div class="mt-auto">
            <a
              href="https://github.com/titan-65/nuxt2-vantol"
              target="_blank"
              class="block w-full py-3 border border-border text-center text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors rounded-lg"
            >
              View Repository
            </a>
          </div>
        </div>
      </div>

      <!-- Newsletter Subscribers Panel -->
      <div class="max-w-4xl mx-auto">
        <div class="bg-card border border-border rounded-xl p-8">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 bg-success rounded-full"></span>
              <h2 class="text-xl font-semibold uppercase tracking-wide">Newsletter Subscribers</h2>
              <span class="text-xs text-muted-foreground">({{ totalCount }})</span>
            </div>
            <button
              @click="exportCSV"
              :disabled="subscribers.length === 0"
              class="px-4 py-2 border border-border text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
            >
              Export CSV
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-8">
            <div
              class="inline-block w-5 h-5 border-2 border-border-strong border-t-white rounded-full animate-spin"
            ></div>
          </div>

          <!-- Subscribers List -->
          <div v-else-if="subscribers.length > 0" class="divide-y divide-border">
            <div
              v-for="(sub, index) in subscribers"
              :key="index"
              class="py-3 flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <span class="text-sm">{{ sub.email }}</span>
                <span class="text-[10px] text-muted-foreground uppercase bg-accent px-2 py-0.5 rounded">{{
                  sub.source
                }}</span>
              </div>
              <span class="text-xs text-muted-foreground">{{ formatDate(sub.subscribedAt) }}</span>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-8">
            <p class="text-sm text-muted-foreground">No subscribers yet.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
