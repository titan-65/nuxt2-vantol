<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    version?: string;
  }>(),
  {
    title: "Interactive Learning Platform",
    version: "4.x",
  },
);
</script>

<template>
  <header class="border-b border-border bg-surface">
    <div class="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3">
      <div class="flex flex-wrap items-center gap-3">
        <span
          class="grid h-7 w-7 place-items-center rounded-md border border-border bg-background font-mono text-[10px] font-medium text-foreground"
          aria-hidden="true"
          >L</span
        >
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[12px] font-medium text-foreground">{{ title }}</span>
          <span
            class="rounded border border-blue/30 bg-blue/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-blue"
          >
            Nuxt layer
          </span>
        </div>
        <p class="font-mono text-[10px] uppercase tracking-[0.08em] text-faint-ink">
          Isolated learning atmosphere · v{{ version }}
        </p>
      </div>

      <NuxtLink
        to="/blog"
        class="text-[12px] text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back to writing
      </NuxtLink>
    </div>
  </header>
</template>
