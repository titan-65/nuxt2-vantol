<script setup lang="ts">
import { Eye, Heart, MessageCircle, TrendingUp, BarChart3, Award } from "lucide-vue-next";

useHead({
  title: "Blog Stats - VantolBennett",
});

const { data: posts } = await useAsyncData("stats-posts", async () => {
  const items = (await queryCollection("blog").order("date", "DESC").all()) as any[];
  return items.map((p) => ({ ...p, _path: p.path, slug: p.path.split("/").pop() }));
});

const { stats, totalViews, totalLikes, totalComments, loading, init, cleanup } = useBlogStats();

onMounted(() => {
  if (posts.value) {
    init(posts.value);
  }
});

onUnmounted(() => {
  cleanup();
});

const topPosts = computed(() => stats.value.slice(0, 5));

const maxViews = computed(() => {
  if (!stats.value.length) return 1;
  return Math.max(...stats.value.map((s: { views: number }) => s.views), 1);
});
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a] text-white font-sans">
    <div class="max-w-4xl mx-auto px-6 py-20">
      <!-- Header -->
      <div class="mb-12">
        <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Analytics</p>
        <h1 class="text-4xl md:text-5xl font-semibold tracking-tight mb-4">Blog Stats</h1>
        <p class="text-lg text-zinc-400 font-light">
          Real-time statistics from across the blog, powered by Firebase.
        </p>
      </div>

      <ClientOnly>
        <!-- Loading State -->
        <div v-if="loading" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              v-for="i in 3"
              :key="i"
              class="bg-[#111] border border-white/10 rounded-xl p-6 animate-pulse"
            >
              <div class="h-4 bg-zinc-800 rounded w-20 mb-4"></div>
              <div class="h-8 bg-zinc-800 rounded w-16"></div>
            </div>
          </div>
        </div>

        <!-- Stats Content -->
        <div v-else class="space-y-8">
          <!-- Summary Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              class="bg-[#111] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors group"
            >
              <div class="flex items-center gap-2 mb-3">
                <Eye class="w-4 h-4 text-zinc-500 group-hover:text-[#f5c542] transition-colors" />
                <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500"
                  >Total Views</span
                >
              </div>
              <p class="text-3xl font-bold tracking-tight">{{ totalViews.toLocaleString() }}</p>
            </div>

            <div
              class="bg-[#111] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors group"
            >
              <div class="flex items-center gap-2 mb-3">
                <Heart class="w-4 h-4 text-zinc-500 group-hover:text-red-400 transition-colors" />
                <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500"
                  >Total Likes</span
                >
              </div>
              <p class="text-3xl font-bold tracking-tight">{{ totalLikes.toLocaleString() }}</p>
            </div>

            <div
              class="bg-[#111] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors group"
            >
              <div class="flex items-center gap-2 mb-3">
                <MessageCircle
                  class="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors"
                />
                <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500"
                  >Total Comments</span
                >
              </div>
              <p class="text-3xl font-bold tracking-tight">{{ totalComments.toLocaleString() }}</p>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="bg-[#111] border border-white/10 rounded-xl p-6">
            <div class="flex items-center gap-2 mb-1">
              <BarChart3 class="w-4 h-4 text-zinc-500" />
              <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500"
                >Quick Stats</span
              >
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-4">
              <div>
                <p class="text-xs text-zinc-500">Posts</p>
                <p class="text-xl font-bold">{{ stats.length }}</p>
              </div>
              <div>
                <p class="text-xs text-zinc-500">Avg Views</p>
                <p class="text-xl font-bold">
                  {{ stats.length ? Math.round(totalViews / stats.length).toLocaleString() : 0 }}
                </p>
              </div>
              <div>
                <p class="text-xs text-zinc-500">Avg Likes</p>
                <p class="text-xl font-bold">
                  {{ stats.length ? Math.round(totalLikes / stats.length).toLocaleString() : 0 }}
                </p>
              </div>
              <div>
                <p class="text-xs text-zinc-500">Most Viewed</p>
                <p class="text-xl font-bold truncate" :title="topPosts[0]?.title">
                  {{ topPosts[0]?.views.toLocaleString() || 0 }}
                </p>
              </div>
            </div>
          </div>

          <!-- Top Posts -->
          <div class="bg-[#111] border border-white/10 rounded-xl p-6">
            <div class="flex items-center gap-2 mb-6">
              <Award class="w-4 h-4 text-zinc-500" />
              <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500"
                >Top Posts</span
              >
            </div>

            <div class="space-y-4">
              <NuxtLink
                v-for="(post, index) in topPosts"
                :key="post.slug"
                :to="`/blog/${post.slug}`"
                class="block group"
              >
                <div class="flex items-center gap-4">
                  <span class="text-xs text-zinc-600 w-6 text-right">#{{ index + 1 }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium truncate group-hover:text-[#f5c542] transition-colors">
                      {{ post.title }}
                    </p>
                    <div class="flex items-center gap-4 mt-1">
                      <span class="text-xs text-zinc-500 flex items-center gap-1">
                        <Eye class="w-3 h-3" /> {{ post.views.toLocaleString() }}
                      </span>
                      <span class="text-xs text-zinc-500 flex items-center gap-1">
                        <Heart class="w-3 h-3" /> {{ post.likes }}
                      </span>
                      <span class="text-xs text-zinc-500 flex items-center gap-1">
                        <MessageCircle class="w-3 h-3" /> {{ post.commentCount }}
                      </span>
                    </div>
                  </div>
                </div>
                <!-- Bar chart -->
                <div class="ml-10 mt-2">
                  <div class="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-[#f5c542] rounded-full transition-all duration-500"
                      :style="{ width: `${(post.views / maxViews) * 100}%` }"
                    ></div>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>

          <!-- All Posts Table -->
          <div class="bg-[#111] border border-white/10 rounded-xl p-6">
            <div class="flex items-center gap-2 mb-6">
              <TrendingUp class="w-4 h-4 text-zinc-500" />
              <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500"
                >All Posts</span
              >
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-white/10">
                    <th
                      class="text-left py-3 text-xs font-bold uppercase tracking-widest text-zinc-500"
                    >
                      Post
                    </th>
                    <th
                      class="text-right py-3 text-xs font-bold uppercase tracking-widest text-zinc-500 w-20"
                    >
                      Views
                    </th>
                    <th
                      class="text-right py-3 text-xs font-bold uppercase tracking-widest text-zinc-500 w-20"
                    >
                      Likes
                    </th>
                    <th
                      class="text-right py-3 text-xs font-bold uppercase tracking-widest text-zinc-500 w-24"
                    >
                      Comments
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="post in stats"
                    :key="post.slug"
                    class="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td class="py-3 pr-4">
                      <NuxtLink
                        :to="`/blog/${post.slug}`"
                        class="font-medium hover:text-[#f5c542] transition-colors truncate block max-w-xs"
                      >
                        {{ post.title }}
                      </NuxtLink>
                    </td>
                    <td class="py-3 text-right text-zinc-500">{{ post.views.toLocaleString() }}</td>
                    <td class="py-3 text-right text-zinc-500">{{ post.likes }}</td>
                    <td class="py-3 text-right text-zinc-500">{{ post.commentCount }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <template #fallback>
          <div class="bg-[#111] border border-white/10 rounded-xl p-12 text-center">
            <div
              class="inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"
            ></div>
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
