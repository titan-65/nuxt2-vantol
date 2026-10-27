<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    stage?: number | string;
    path?: string;
    height?: number | string;
    title?: string;
  }>(),
  {
    stage: 1,
    path: "",
    height: 720,
    title: "Jumble Cookies · live stage",
  },
);

const config = useRuntimeConfig();

const base = computed(() => String(config.public.jumbleUrl || "").replace(/\/$/, ""));

const stageNumber = computed(() => {
  const value = Number(props.stage);
  return Number.isFinite(value) ? Math.min(Math.max(Math.trunc(value), 1), 8) : 1;
});

const heightValue = computed(() => {
  const value = Number(props.height);
  return Number.isFinite(value) ? Math.min(Math.max(Math.trunc(value), 360), 900) : 720;
});

const src = computed(() => {
  if (!base.value) return "";
  const query = new URLSearchParams({ embed: "1" });
  if (props.path) query.set("path", props.path);
  return `${base.value}/preview/${stageNumber.value}?${query.toString()}`;
});

const appUrl = computed(() => `${base.value}/`);
</script>

<template>
  <figure class="card my-8 overflow-hidden">
    <div
      class="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-4 py-2.5"
    >
      <div class="flex items-center gap-2">
        <span class="flex gap-1" aria-hidden="true">
          <span class="h-1.5 w-1.5 rounded-full bg-border-strong" />
          <span class="h-1.5 w-1.5 rounded-full bg-border-strong" />
          <span class="h-1.5 w-1.5 rounded-full bg-border-strong" />
        </span>
        <span class="font-mono text-[10px] text-muted-foreground">
          jumble / preview / {{ stageNumber }}
        </span>
      </div>
      <div class="flex items-center gap-3">
        <span
          class="rounded border border-blue/30 bg-blue/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-blue"
        >
          Live stage
        </span>
        <a
          v-if="base"
          :href="appUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          Open app ↗
        </a>
      </div>
    </div>

    <iframe
      v-if="base"
      :src="src"
      :title="title"
      :style="{ height: `${heightValue}px` }"
      class="block w-full bg-[#fff8ec]"
      loading="lazy"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      allow="clipboard-write"
    />
    <div v-else class="px-6 py-12 text-center text-[14px] text-muted-foreground">
      Set <code class="font-mono text-[12px]">NUXT_PUBLIC_JUMBLE_URL</code> to load the live stage.
    </div>

    <figcaption
      class="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.1em] text-faint-ink"
    >
      <span>{{ title }}</span>
      <span>Stage {{ stageNumber }} / 8</span>
    </figcaption>
  </figure>
</template>
