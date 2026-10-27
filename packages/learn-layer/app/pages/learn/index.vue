<script setup lang="ts">
const { data: series } = await useAsyncData("learn-series", async () => {
  const items = (await queryCollection("tutorials").all()) as any[];
  return items
    .filter((doc: any) => !doc.order && doc.path?.split("/").filter(Boolean).length === 2)
    .map((doc: any) => ({ ...doc, seriesSlug: doc.series || doc.path?.split("/").pop() }))
    .sort((a: any, b: any) => {
      const dateA = new Date(a.releaseDate || 0).getTime();
      const dateB = new Date(b.releaseDate || 0).getTime();
      return dateB - dateA;
    });
});

useSeoMeta({
  title: "Learn | VantolBennett",
  description:
    "Hands-on tutorials where we learn new framework features together, one release at a time.",
  ogTitle: "Learn — one release at a time",
  ogDescription:
    "Hands-on tutorials where we learn new framework features together, one release at a time.",
});

function formatDate(date: string | undefined) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en", { year: "numeric", month: "long" });
}
</script>

<template>
  <div class="reading-page min-h-screen bg-background text-foreground">
    <LearnHeaderNav />

    <div class="container-page py-12 md:py-20">
      <header class="border-b border-border pb-10 md:pb-12">
        <h1 class="display max-w-[18ch] text-[clamp(2.8rem,5vw,4rem)]">
          Learning, one release at a time
        </h1>
        <p class="mt-5 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
          I build with these tools every day — hands-on tutorials where we learn new framework
          features step by step, straight from the source.
        </p>

        <div class="card mt-8 flex flex-col justify-between gap-6 p-6 md:flex-row md:items-center md:p-8">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="rounded border border-blue/30 bg-blue/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-blue"
              >
                Live agent
              </span>
              <span class="font-mono text-[11px] text-muted-foreground">
                Vercel Eve framework
              </span>
            </div>
            <h2 class="mt-3 text-[22px] font-medium tracking-[-0.03em]">Eve AI Agent Studio</h2>
            <p class="mt-2 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
              Interact with the live EVE Agent built for this site. Chat with the agent or inspect
              its underlying instructions, tools, skills, subagents, and schedules.
            </p>
          </div>

          <NuxtLink to="/eve" class="btn btn-primary shrink-0">
            Launch Eve Agent Studio
            <span aria-hidden="true">→</span>
          </NuxtLink>
        </div>
      </header>

      <div v-if="!series?.length" class="border-b border-border py-16 text-center">
        <p class="text-[15px] text-muted-foreground">No tutorials yet — check back soon.</p>
      </div>

      <div v-else class="mt-10 grid gap-5 md:grid-cols-2">
        <NuxtLink
          v-for="s in series"
          :key="s.seriesSlug"
          :to="s.path"
          class="card group flex flex-col"
        >
          <div v-if="s.img" class="aspect-[16/9] overflow-hidden border-b border-border bg-surface-2">
            <NuxtImg
              :src="s.img"
              :alt="s.title"
              width="600"
              height="338"
              class="h-full w-full object-cover opacity-90 transition-all duration-500 group-hover:scale-[1.02] group-hover:opacity-100"
            />
          </div>

          <div class="flex flex-1 flex-col p-6">
            <div class="flex flex-wrap items-center gap-3">
              <span
                v-if="s.nuxtVersion"
                class="rounded border border-blue/30 bg-blue/10 px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.08em] text-blue"
              >
                v{{ s.nuxtVersion }}
              </span>
              <span
                v-if="s.difficulty"
                class="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground"
              >
                {{ s.difficulty }}
              </span>
              <span v-if="s.releaseDate" class="font-mono text-[10px] text-faint-ink">
                {{ formatDate(s.releaseDate) }}
              </span>
            </div>

            <h2
              class="mt-3 text-[18px] font-medium leading-snug tracking-[-0.02em] transition-colors group-hover:text-blue"
            >
              {{ s.title }}
            </h2>
            <p class="mt-2 text-[14px] leading-relaxed text-muted-foreground line-clamp-2">
              {{ s.description }}
            </p>

            <span class="mt-5 inline-flex items-center gap-1.5 text-[13px] text-blue">
              Start learning
              <span
                aria-hidden="true"
                class="transition-transform duration-200 group-hover:translate-x-0.5"
                >→</span
              >
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
