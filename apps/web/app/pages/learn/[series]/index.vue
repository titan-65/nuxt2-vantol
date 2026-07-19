<script setup lang="ts">
const route = useRoute()
const seriesSlug = computed(() => route.params.series as string)

const { data: landing } = await useAsyncData('learn-landing-' + route.path, () => {
  return queryCollection('tutorials').path(route.path).first() as Promise<any>
})

const { data: steps } = await useAsyncData('learn-steps-' + seriesSlug.value, async () => {
  const items = await queryCollection('tutorials')
    .where('series', '=', seriesSlug.value)
    .all() as any[]
  return items
    .filter((doc: any) => typeof doc.order === 'number')
    .sort((a: any, b: any) => a.order - b.order)
})

if (!landing.value) {
  throw createError({ statusCode: 404, statusMessage: 'Series not found' })
}

const { completed, isComplete, seriesProgress } = useTutorialProgress(seriesSlug.value)
const percent = computed(() => seriesProgress(steps.value?.length || 0).value)

const runtimeConfig = useRuntimeConfig()
const requestOrigin = computed(() => {
  if (import.meta.server) {
    try {
      return useRequestURL().origin
    } catch {
      return runtimeConfig.public.siteUrl || ''
    }
  }
  return runtimeConfig.public.siteUrl || ''
})
const canonicalUrl = computed(() => `${requestOrigin.value}${route.path}`)

useSeoMeta({
  title: () => (landing.value?.title ? `${landing.value.title} | VantolBennett` : 'Learn | VantolBennett'),
  description: () => landing.value?.description || '',
  ogTitle: () => landing.value?.title || '',
  ogDescription: () => landing.value?.description || '',
  ogImage: () => landing.value?.img || '',
  ogUrl: () => canonicalUrl.value
})

function formatDate(date: string | undefined) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>

<template>
  <div v-if="landing" class="min-h-screen bg-[#0a0a0a] text-white font-sans">
    <div class="max-w-[880px] mx-auto px-6 py-12">
      <NuxtLink to="/learn" class="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors mb-8">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        All tutorials
      </NuxtLink>

      <!-- Header -->
      <header class="mb-10 border-b border-white/10 pb-8">
        <div class="flex items-center gap-3 mb-5 flex-wrap">
          <span v-if="landing.nuxtVersion" class="px-2.5 py-1 bg-[#f5c542] text-black text-[10px] font-bold uppercase tracking-widest rounded-md">
            Nuxt v{{ landing.nuxtVersion }}
          </span>
          <span v-if="landing.difficulty" class="text-[11px] uppercase tracking-wider text-zinc-500">{{ landing.difficulty }}</span>
          <span v-if="landing.releaseDate" class="text-[11px] text-zinc-600">Released {{ formatDate(landing.releaseDate) }}</span>
          <span v-if="landing.estMinutes" class="text-[11px] text-zinc-600">• ~{{ landing.estMinutes }} min</span>
        </div>
        <h1 class="text-3xl md:text-5xl font-semibold tracking-tight mb-6 leading-tight">{{ landing.title }}</h1>

        <a
          v-if="landing.sourceUrl && landing.nuxtVersion"
          :href="landing.sourceUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-[#f5c542] transition-colors border border-white/10 rounded-lg px-3 py-2"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Based on the official Nuxt release notes
        </a>
      </header>

      <!-- Intro body -->
      <div class="prose prose-invert max-w-none font-light prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-[#f5c542] prose-a:no-underline hover:prose-a:underline prose-code:text-[#f5c542] prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-white/10 mb-12">
        <ContentRenderer :value="landing" />
      </div>

      <!-- Progress + step list -->
      <div class="border border-white/10 bg-[#111] rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Steps</h2>
          <ClientOnly>
            <span class="text-[11px] text-zinc-500">{{ completed.length }} / {{ steps?.length || 0 }} done</span>
          </ClientOnly>
        </div>

        <ClientOnly>
          <div v-if="steps?.length" class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-6">
            <div class="h-full bg-[#f5c542] transition-all" :style="{ width: percent + '%' }" />
          </div>
        </ClientOnly>

        <ol class="space-y-2">
          <li v-for="(step, i) in steps" :key="step.path">
            <NuxtLink
              :to="step.path"
              class="group flex items-center gap-4 p-3 rounded-lg border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all"
            >
              <ClientOnly>
                <span
                  class="shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-bold"
                  :class="isComplete(step.path) ? 'bg-[#f5c542] border-[#f5c542] text-black' : 'border-white/20 text-zinc-500'"
                >
                  <svg v-if="isComplete(step.path)" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                  <template v-else>{{ i + 1 }}</template>
                </span>
                <template #fallback>
                  <span class="shrink-0 w-6 h-6 rounded-full border border-white/20 text-zinc-500 flex items-center justify-center text-[11px] font-bold">{{ i + 1 }}</span>
                </template>
              </ClientOnly>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-white group-hover:text-[#f5c542] transition-colors truncate">{{ step.title }}</p>
                <p v-if="step.feature" class="text-[11px] text-zinc-600 truncate">{{ step.feature }}</p>
              </div>
              <svg class="w-4 h-4 text-zinc-600 group-hover:text-[#f5c542] transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>
