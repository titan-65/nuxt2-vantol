<script setup lang="ts">
import { ref } from "vue";

const activeViewMode = ref<"blog" | "learn">("learn");
const activeFileTab = ref<"parentConfig" | "layerConfig" | "layerTree" | "contentConfig">(
  "parentConfig",
);

// Every snippet below is the real file it names — this page is served by the layer it describes.
const snippets = {
  parentConfig: `// apps/web/nuxt.config.ts — the whole /learn platform, in one line
export default defineNuxtConfig({
  extends: ['@vvantol2000/learn-layer'],
  modules: ['@nuxt/content', '@nuxtjs/tailwindcss', 'nuxt-presence', 'nuxt-assistant']
})`,
  layerConfig: `// packages/learn-layer/nuxt.config.ts — a layer is just a nuxt.config
export default defineNuxtConfig({
  $meta: { name: 'learn-layer' }
})

// No components[] override needed: Nuxt already scans every layer's
// app/components, and @nuxt/content scans every layer's app/components/content.`,
  layerTree: `packages/learn-layer/
├─ nuxt.config.ts            # the layer entry (package.json "main")
├─ content.config.ts         # owns the \`tutorials\` collection
├─ content/learn/**/*.md     # every lesson on this site
├─ app/
│  ├─ pages/learn/           # /learn, /learn/:series, /learn/:series/:step
│  ├─ components/LearnHeaderNav.vue
│  ├─ components/content/    # MDC components (this playground)
│  └─ composables/useTutorialProgress.ts
└─ server/routes/learn/rss.xml.ts`,
  contentConfig: `// packages/learn-layer/content.config.ts
// Nuxt Content loads content.config.ts from EVERY layer and merges by
// collection name. source is resolved against the layer's own content/ dir.
export default defineContentConfig({
  collections: {
    tutorials: defineCollection({
      type: 'page',
      source: 'learn/**/*.md',
      schema: z.object({ title: z.string(), series: z.string(), order: z.number().optional() })
    })
  }
})`,
};
</script>

<template>
  <div
    class="my-8 rounded-2xl bg-zinc-950 border border-amber-500/30 overflow-hidden shadow-2xl font-sans text-white"
  >
    <!-- Header Controls -->
    <div
      class="px-6 py-4 bg-zinc-900/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-4"
    >
      <div class="flex items-center space-x-3">
        <div
          class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center border border-amber-500/30 text-sm"
        >
          🥞
        </div>
        <div>
          <h3 class="text-sm font-bold text-white tracking-wide">
            Interactive Nuxt Layer Architecture Sandbox
          </h3>
          <p class="text-xs text-zinc-400 font-light">
            Test how Nuxt extends inheritance separates Blog site & Learn platform
          </p>
        </div>
      </div>

      <!-- Mode Switcher -->
      <div
        class="flex items-center space-x-2 bg-black/60 p-1 rounded-xl border border-white/10 text-xs font-mono"
      >
        <button
          @click="activeViewMode = 'learn'"
          class="px-3.5 py-1.5 rounded-lg font-bold transition-all"
          :class="
            activeViewMode === 'learn'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          "
        >
          🎓 Learn Platform Mode
        </button>
        <button
          @click="activeViewMode = 'blog'"
          class="px-3.5 py-1.5 rounded-lg font-bold transition-all"
          :class="
            activeViewMode === 'blog'
              ? 'bg-white/20 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          "
        >
          📰 Editorial Blog Mode
        </button>
      </div>
    </div>

    <!-- Live Preview Canvas -->
    <div class="p-6 space-y-5">
      <!-- Simulated Site Header Render -->
      <div
        class="p-4 rounded-xl border transition-all duration-300 flex items-center justify-between"
        :class="
          activeViewMode === 'learn'
            ? 'bg-[#0d0d0d] border-amber-500/40 shadow-lg shadow-amber-500/10'
            : 'bg-[#18181b] border-white/15'
        "
      >
        <div class="flex items-center space-x-3">
          <span class="text-xl">{{ activeViewMode === "learn" ? "🎓" : "📰" }}</span>
          <div>
            <div class="flex items-center space-x-2">
              <h4 class="text-xs font-bold text-white">
                {{
                  activeViewMode === "learn"
                    ? "Interactive Learning Platform Layer"
                    : "Vantol Bennett — Personal Publication Blog"
                }}
              </h4>
              <span
                class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                :class="
                  activeViewMode === 'learn'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-white/10 text-zinc-300 border border-white/20'
                "
              >
                {{ activeViewMode === "learn" ? "Layer Extended" : "Root App" }}
              </span>
            </div>
            <p class="text-[11px] text-zinc-400 font-light mt-0.5">
              {{
                activeViewMode === "learn"
                  ? "Isolated learning atmosphere with step sidebars & progress tracking."
                  : "Clean editorial blog focused on shipped code & articles."
              }}
            </p>
          </div>
        </div>
        <span class="text-xs text-zinc-400 font-mono">
          Mode: <strong class="text-white">{{ activeViewMode }}</strong>
        </span>
      </div>

      <!-- Code Inspector -->
      <div class="space-y-3">
        <div
          class="flex items-center space-x-2 border-b border-white/10 pb-2 text-xs font-mono overflow-x-auto"
        >
          <button
            @click="activeFileTab = 'parentConfig'"
            class="px-3 py-1.5 rounded-lg border transition-colors"
            :class="
              activeFileTab === 'parentConfig'
                ? 'bg-white/15 text-amber-400 border-amber-500/50 font-bold'
                : 'border-transparent text-zinc-400 hover:text-white'
            "
          >
            apps/web/nuxt.config.ts
          </button>
          <button
            @click="activeFileTab = 'layerConfig'"
            class="px-3 py-1.5 rounded-lg border transition-colors"
            :class="
              activeFileTab === 'layerConfig'
                ? 'bg-white/15 text-amber-400 border-amber-500/50 font-bold'
                : 'border-transparent text-zinc-400 hover:text-white'
            "
          >
            packages/learn-layer/nuxt.config.ts
          </button>
          <button
            @click="activeFileTab = 'layerTree'"
            class="px-3 py-1.5 rounded-lg border transition-colors"
            :class="
              activeFileTab === 'layerTree'
                ? 'bg-white/15 text-amber-400 border-amber-500/50 font-bold'
                : 'border-transparent text-zinc-400 hover:text-white'
            "
          >
            layer file tree
          </button>
          <button
            @click="activeFileTab = 'contentConfig'"
            class="px-3 py-1.5 rounded-lg border transition-colors"
            :class="
              activeFileTab === 'contentConfig'
                ? 'bg-white/15 text-amber-400 border-amber-500/50 font-bold'
                : 'border-transparent text-zinc-400 hover:text-white'
            "
          >
            content.config.ts
          </button>
        </div>

        <pre
          class="p-4 bg-black rounded-xl border border-white/10 font-mono text-xs text-amber-200 overflow-x-auto leading-relaxed"
          >{{ snippets[activeFileTab] }}</pre
        >
      </div>
    </div>
  </div>
</template>
