<script setup lang="ts">
useHead({
  title: "Developer Exploration | Vantol Bennett",
});

type ExploreCard = {
  title: string;
  label: string;
  description: string;
  to?: string;
  status: "Active" | "Draft" | "Planned";
};

const { data: exploreData } = await useAsyncData("explore-data", () => {
  return queryCollection("explore").first();
});

const cards = computed<ExploreCard[]>(() => (exploreData.value?.cards as ExploreCard[]) || []);

const quickLinks = [
  { name: "Blog", to: "/blog" },
  { name: "Projects", to: "/projects" },
  { name: "Gallery", to: "/gallery" },
];
</script>

<template>
  <main class="min-h-screen bg-background text-foreground font-sans">
    <div class="max-w-[1088px] mx-auto px-6 py-10">
      <section class="border border-border bg-card rounded-xl p-6 md:p-10">
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Developer Exploration
            </p>
            <h1 class="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
              Labs, Notes, and Patterns
            </h1>
            <p class="mt-3 text-sm text-muted-foreground max-w-2xl">
              This page is a hub for the stuff I'm testing and learning in public—without the
              pressure of a polished post.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <NuxtLink
              v-for="link in quickLinks"
              :key="link.to"
              :to="link.to"
              class="border border-border bg-background px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors rounded-lg text-foreground"
            >
              {{ link.name }}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="inline ml-1"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </div>

        <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <component
            :is="card.to ? 'NuxtLink' : 'article'"
            v-for="card in cards"
            :key="card.title"
            :to="card.to"
            :target="card.to?.startsWith('http') ? '_blank' : undefined"
            class="block border border-border bg-background rounded-xl p-5 hover:border-border-strong hover:bg-background/[0.02] transition-all"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {{ card.label }}
                </p>
                <h2 class="mt-2 font-semibold tracking-tight">{{ card.title }}</h2>
              </div>
              <span
                class="text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-md"
                :class="{
                  'bg-success/10 text-success': card.status === 'Active',
                  'bg-zinc-500/10 text-muted-foreground': card.status === 'Draft',
                  'bg-blue-500/10 text-blue-400': card.status === 'Planned',
                }"
              >
                {{ card.status }}
              </span>
            </div>

            <p class="mt-4 text-xs text-muted-foreground">
              {{ card.description }}
            </p>

            <div class="mt-5 border-t border-border pt-4">
              <p
                v-if="card.to"
                class="text-[11px] font-medium text-blue flex items-center gap-1"
              >
                Explore
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </p>
              <p v-else class="text-[11px] text-muted-foreground">Coming soon...</p>
            </div>
          </component>
        </div>
      </section>
    </div>
  </main>
</template>
