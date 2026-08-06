<script setup lang="ts">
const route = useRoute();
const seriesSlug = computed(() => route.params.series as string);
const stepParam = computed(() => route.params.step as string);

const { data: step } = await useAsyncData("learn-step-" + route.path, () => {
  return queryCollection("tutorials").path(route.path).first() as Promise<any>;
});

if (!step.value) {
  throw createError({ statusCode: 404, statusMessage: "Lesson not found" });
}

const { data: siblings } = await useAsyncData("learn-siblings-" + seriesSlug.value, async () => {
  const items = (await queryCollection("tutorials")
    .where("series", "=", seriesSlug.value)
    .all()) as any[];
  return items
    .filter((doc: any) => typeof doc.order === "number")
    .sort((a: any, b: any) => a.order - b.order);
});

const { data: landing } = await useAsyncData("learn-landing-for-step-" + seriesSlug.value, () => {
  return queryCollection("tutorials").path(`/learn/${seriesSlug.value}`).first() as Promise<any>;
});

const seriesPath = computed(() => `/learn/${seriesSlug.value}`);

const currentIndex = computed(() =>
  (siblings.value || []).findIndex((s: any) => s.path === route.path),
);
const totalSteps = computed(() => siblings.value?.length || 0);
const stepNumber = computed(() => currentIndex.value + 1);

const prev = computed(() => {
  const i = currentIndex.value;
  return i > 0 ? siblings.value?.[i - 1] : null;
});
const next = computed(() => {
  const i = currentIndex.value;
  return i >= 0 && i < (siblings.value?.length || 0) - 1 ? siblings.value?.[i + 1] : null;
});

const { isComplete, toggle } = useTutorialProgress(seriesSlug.value);

const runtimeConfig = useRuntimeConfig();
const requestOrigin = computed(() => {
  if (import.meta.server) {
    try {
      return useRequestURL().origin;
    } catch {
      return runtimeConfig.public.siteUrl || "";
    }
  }
  return runtimeConfig.public.siteUrl || "";
});
const canonicalUrl = computed(() => `${requestOrigin.value}${route.path}`);

useSeoMeta({
  title: () =>
    step.value?.title ? `${step.value.title} | Learn | VantolBennett` : "Learn | VantolBennett",
  description: () => step.value?.description || "",
  ogTitle: () => step.value?.title || "",
  ogDescription: () => step.value?.description || "",
  ogUrl: () => canonicalUrl.value,
});

function markComplete() {
  toggle(route.path);
  if (next.value) {
    navigateTo(next.value.path);
  }
}
</script>

<template>
  <div v-if="step" class="min-h-screen bg-[#0a0a0a] text-white font-sans">
    <LearnHeaderNav />
    <ReadingProgress />
    <div class="max-w-[1088px] mx-auto px-6 py-12">
      <div class="lg:flex gap-12">
        <!-- Stepper sidebar -->
        <aside class="hidden lg:block w-64 shrink-0">
          <div class="sticky top-24 border border-white/10 bg-[#111] rounded-xl p-6">
            <NuxtLink
              :to="seriesPath"
              class="block text-sm font-semibold text-white hover:text-[#f5c542] transition-colors mb-1"
            >
              {{ landing?.title || "Series" }}
            </NuxtLink>
            <p
              v-if="landing?.nuxtVersion"
              class="text-[10px] uppercase tracking-widest text-zinc-600 mb-4"
            >
              Nuxt v{{ landing.nuxtVersion }}
            </p>
            <ol class="space-y-1">
              <li v-for="(s, i) in siblings" :key="s.path">
                <NuxtLink
                  :to="s.path"
                  class="flex items-center gap-3 px-2 py-1.5 rounded-lg text-xs transition-colors"
                  :class="
                    s.path === route.path
                      ? 'bg-white/10 text-white'
                      : 'text-zinc-500 hover:text-white hover:bg-white/5'
                  "
                >
                  <ClientOnly>
                    <span
                      class="shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold"
                      :class="
                        isComplete(s.path)
                          ? 'bg-[#f5c542] border-[#f5c542] text-black'
                          : 'border-white/20'
                      "
                    >
                      <svg
                        v-if="isComplete(s.path)"
                        class="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <template v-else>{{ i + 1 }}</template>
                    </span>
                    <template #fallback>
                      <span
                        class="shrink-0 w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-bold"
                        >{{ i + 1 }}</span
                      >
                    </template>
                  </ClientOnly>
                  <span class="truncate">{{ s.title }}</span>
                </NuxtLink>
              </li>
            </ol>
          </div>
        </aside>

        <!-- Main -->
        <div class="flex-auto min-w-0">
          <article class="bg-[#111] border border-white/10 rounded-xl p-8 md:p-12">
            <header class="mb-10 border-b border-white/10 pb-8">
              <div class="flex flex-wrap items-center gap-3 mb-6">
                <NuxtLink
                  :to="seriesPath"
                  class="px-2.5 py-1 bg-[#f5c542] text-black text-[10px] font-bold uppercase tracking-widest rounded-md hover:bg-[#e0b13a] transition-colors"
                >
                  Step {{ stepNumber }} of {{ totalSteps }}
                </NuxtLink>
                <span v-if="step.feature" class="text-xs text-zinc-500">{{ step.feature }}</span>
                <span class="text-xs text-zinc-700">|</span>
                <ViewCounter :slug="`learn-${seriesSlug}-${stepParam}`" />
                <ReactionButton :slug="`learn-${seriesSlug}-${stepParam}`" />
              </div>

              <h1 class="text-3xl md:text-4xl font-semibold tracking-tight mb-6 leading-tight">
                {{ step.title }}
              </h1>
              <p class="text-zinc-400 text-lg font-light leading-relaxed">{{ step.description }}</p>

              <div class="flex items-center justify-between mt-6">
                <div v-if="step.sourcePRs?.length" class="flex flex-wrap items-center gap-2">
                  <span class="text-[11px] text-zinc-600 uppercase tracking-wider">Source:</span>
                  <a
                    v-for="(pr, i) in step.sourcePRs"
                    :key="pr"
                    :href="pr"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-[11px] text-zinc-400 hover:text-[#f5c542] transition-colors underline"
                  >
                    PR #{{ i + 1 }}
                  </a>
                </div>
                <BookmarkButton :slug="`learn-${seriesSlug}-${stepParam}`" :title="step.title" />
              </div>
            </header>

            <!-- Content -->
            <div
              class="prose prose-invert max-w-none font-light prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-[#f5c542] prose-a:no-underline hover:prose-a:underline prose-code:text-[#f5c542] prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-white/10"
            >
              <ContentRenderer :value="step" />
            </div>

            <!-- Complete + nav -->
            <div class="mt-12 pt-8 border-t border-white/10">
              <ClientOnly>
                <button
                  type="button"
                  @click="markComplete"
                  class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors mb-8"
                  :class="
                    isComplete(route.path)
                      ? 'bg-white/10 text-white border border-white/20 hover:bg-white/15'
                      : 'bg-[#f5c542] text-black hover:bg-[#e0b13a]'
                  "
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span v-if="isComplete(route.path)"
                    >Completed{{ next ? " — next step" : "" }}</span
                  >
                  <span v-else>Mark complete{{ next ? " & continue" : "" }}</span>
                </button>
              </ClientOnly>

              <div class="flex justify-between gap-4">
                <NuxtLink
                  v-if="prev"
                  :to="prev.path"
                  class="flex items-center gap-1 text-[#f5c542] hover:underline transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span class="font-medium line-clamp-1">{{ prev.title }}</span>
                </NuxtLink>
                <span v-else>&nbsp;</span>

                <NuxtLink
                  v-if="next"
                  :to="next.path"
                  class="flex items-center gap-1 text-[#f5c542] hover:underline transition-colors"
                >
                  <span class="font-medium line-clamp-1">{{ next.title }}</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </NuxtLink>
                <NuxtLink
                  v-else
                  :to="seriesPath"
                  class="flex items-center gap-1 text-[#f5c542] hover:underline transition-colors"
                >
                  <span class="font-medium line-clamp-1">Back to series</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </NuxtLink>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>
