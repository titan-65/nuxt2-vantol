<script setup lang="ts">
const route = useRoute();
const seriesSlug = computed(() => route.params.series as string);

const { data: landing } = await useAsyncData("learn-landing-" + route.path, () => {
  return queryCollection("tutorials").path(route.path).first() as Promise<any>;
});

const { data: steps } = await useAsyncData("learn-steps-" + seriesSlug.value, async () => {
  const items = (await queryCollection("tutorials")
    .where("series", "=", seriesSlug.value)
    .all()) as any[];
  return items
    .filter((doc: any) => typeof doc.order === "number")
    .sort((a: any, b: any) => a.order - b.order);
});

if (!landing.value) {
  throw createError({ statusCode: 404, statusMessage: "Series not found" });
}

const { completed, isComplete, seriesProgress } = useTutorialProgress(seriesSlug.value);
const percent = computed(() => seriesProgress(steps.value?.length || 0).value);

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
    landing.value?.title ? `${landing.value.title} | VantolBennett` : "Learn | VantolBennett",
  description: () => landing.value?.description || "",
  ogTitle: () => landing.value?.title || "",
  ogDescription: () => landing.value?.description || "",
  ogImage: () => landing.value?.img || "",
  ogUrl: () => canonicalUrl.value,
});

function formatDate(date: string | undefined) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
</script>

<template>
  <div v-if="landing" class="reading-page min-h-screen bg-background text-foreground">
    <LearnHeaderNav />

    <div class="mx-auto max-w-[880px] px-6 py-12 md:py-16">
      <NuxtLink
        to="/learn"
        class="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        All tutorials
      </NuxtLink>

      <header class="mt-8 border-b border-border pb-8">
        <div class="flex flex-wrap items-center gap-3">
          <span
            v-if="landing.nuxtVersion"
            class="rounded border border-blue/30 bg-blue/10 px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.08em] text-blue"
          >
            Nuxt v{{ landing.nuxtVersion }}
          </span>
          <span
            v-if="landing.difficulty"
            class="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground"
          >
            {{ landing.difficulty }}
          </span>
          <span v-if="landing.releaseDate" class="font-mono text-[10px] text-faint-ink">
            Released {{ formatDate(landing.releaseDate) }}
          </span>
          <span v-if="landing.estMinutes" class="font-mono text-[10px] text-faint-ink">
            · ~{{ landing.estMinutes }} min
          </span>
        </div>

        <h1 class="display mt-4 max-w-[20ch] text-[clamp(2.2rem,4vw,3.2rem)]">
          {{ landing.title }}
        </h1>

        <a
          v-if="landing.sourceUrl && landing.nuxtVersion"
          :href="landing.sourceUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-secondary mt-6"
        >
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          Based on the official Nuxt release notes
        </a>
      </header>

      <div class="article-prose mt-10 mb-12">
        <ContentRenderer :value="landing" />
      </div>

      <div class="card p-6">
        <div class="flex items-center justify-between gap-4">
          <h2 class="label">Steps</h2>
          <ClientOnly>
            <span class="meta">{{ completed.length }} / {{ steps?.length || 0 }} done</span>
          </ClientOnly>
        </div>

        <ClientOnly>
          <div v-if="steps?.length" class="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div class="h-full bg-blue transition-all" :style="{ width: percent + '%' }" />
          </div>
        </ClientOnly>

        <ol class="mt-6 space-y-1">
          <li v-for="(step, i) in steps" :key="step.path">
            <NuxtLink
              :to="step.path"
              class="group flex items-center gap-4 rounded-md border border-transparent px-3 py-2.5 transition-all hover:border-border hover:bg-surface-2"
            >
              <ClientOnly>
                <span
                  class="grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-medium"
                  :class="
                    isComplete(step.path)
                      ? 'border-blue bg-blue text-background'
                      : 'border-border text-muted-foreground'
                  "
                >
                  <svg
                    v-if="isComplete(step.path)"
                    class="h-3.5 w-3.5"
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
                    class="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border text-[11px] font-medium text-muted-foreground"
                    >{{ i + 1 }}</span
                  >
                </template>
              </ClientOnly>

              <div class="min-w-0 flex-1">
                <p
                  class="truncate text-[14px] font-medium transition-colors group-hover:text-blue"
                >
                  {{ step.title }}
                </p>
                <p
                  v-if="step.feature"
                  class="truncate font-mono text-[10px] uppercase tracking-[0.08em] text-faint-ink"
                >
                  {{ step.feature }}
                </p>
              </div>

              <svg
                class="h-4 w-4 shrink-0 text-faint-ink transition-colors group-hover:text-blue"
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
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>
