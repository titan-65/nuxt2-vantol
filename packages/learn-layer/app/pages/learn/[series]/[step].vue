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
  const configured = String(runtimeConfig.public.siteUrl || "").replace(/\/$/, "");
  if (configured) return configured;

  if (import.meta.server) {
    try {
      return useRequestURL().origin;
    } catch {
      return "";
    }
  }
  return "";
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
  <div v-if="step" class="reading-page min-h-screen bg-background text-foreground">
    <LearnHeaderNav />
    <ReadingProgress />

    <div class="mx-auto max-w-[1088px] px-6 py-12 md:py-16">
      <div class="flex flex-col gap-10 lg:flex-row lg:gap-12">
        <aside class="hidden w-64 shrink-0 lg:block">
          <div class="card sticky top-24 p-6">
            <NuxtLink
              :to="seriesPath"
              class="block text-[14px] font-medium transition-colors hover:text-blue"
            >
              {{ landing?.title || "Series" }}
            </NuxtLink>
            <p
              v-if="landing?.nuxtVersion"
              class="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-faint-ink"
            >
              Nuxt v{{ landing.nuxtVersion }}
            </p>

            <ol class="mt-5 space-y-1">
              <li v-for="(s, i) in siblings" :key="s.path">
                <NuxtLink
                  :to="s.path"
                  class="flex items-center gap-3 rounded-md px-2 py-1.5 text-[12px] transition-colors"
                  :class="
                    s.path === route.path
                      ? 'bg-surface-2 text-foreground'
                      : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
                  "
                >
                  <ClientOnly>
                    <span
                      class="grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] font-medium"
                      :class="
                        isComplete(s.path)
                          ? 'border-blue bg-blue text-background'
                          : 'border-border'
                      "
                    >
                      <svg
                        v-if="isComplete(s.path)"
                        class="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
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
                        class="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border text-[10px] font-medium"
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

        <div class="min-w-0 flex-auto">
          <article class="card p-6 md:p-10">
            <header class="mb-10 border-b border-border pb-8">
              <div class="flex flex-wrap items-center gap-3">
                <NuxtLink
                  :to="seriesPath"
                  class="rounded border border-blue/30 bg-blue/10 px-2.5 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.08em] text-blue"
                >
                  Step {{ stepNumber }} of {{ totalSteps }}
                </NuxtLink>
                <span v-if="step.feature" class="font-mono text-[10px] text-muted-foreground">
                  {{ step.feature }}
                </span>
                <span aria-hidden="true" class="text-faint-ink">|</span>
                <ViewCounter :slug="`learn-${seriesSlug}-${stepParam}`" />
                <ReactionButton :slug="`learn-${seriesSlug}-${stepParam}`" />
              </div>

              <h1 class="display mt-4 max-w-[22ch] text-[clamp(2.2rem,4vw,3.2rem)]">
                {{ step.title }}
              </h1>
              <p class="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
                {{ step.description }}
              </p>

              <div class="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div v-if="step.sourcePRs?.length" class="flex flex-wrap items-center gap-2">
                  <span class="font-mono text-[10px] uppercase tracking-[0.08em] text-faint-ink"
                    >Source</span
                  >
                  <a
                    v-for="(pr, i) in step.sourcePRs"
                    :key="pr"
                    :href="pr"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-[11px] text-blue underline underline-offset-4 hover:text-blue-hover"
                  >
                    PR #{{ i + 1 }}
                  </a>
                </div>
                <BookmarkButton :slug="`learn-${seriesSlug}-${stepParam}`" :title="step.title" />
              </div>
            </header>

            <div class="article-prose">
              <ContentRenderer :value="step" />
            </div>

            <div class="mt-12 border-t border-border pt-8">
              <ClientOnly>
                <button
                  type="button"
                  class="btn mb-8 w-full sm:w-auto"
                  :class="isComplete(route.path) ? 'btn-secondary' : 'btn-primary'"
                  @click="markComplete"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
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
                  class="flex items-center gap-1 text-[13px] text-blue transition-colors hover:text-blue-hover"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span class="line-clamp-1 font-medium">{{ prev.title }}</span>
                </NuxtLink>
                <span v-else>&nbsp;</span>

                <NuxtLink
                  v-if="next"
                  :to="next.path"
                  class="flex items-center gap-1 text-[13px] text-blue transition-colors hover:text-blue-hover"
                >
                  <span class="line-clamp-1 font-medium">{{ next.title }}</span>
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
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
                  class="flex items-center gap-1 text-[13px] text-blue transition-colors hover:text-blue-hover"
                >
                  <span class="font-medium">Back to series</span>
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
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
