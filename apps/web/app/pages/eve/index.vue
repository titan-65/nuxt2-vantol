<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Bot,
  Sparkles,
  Brain,
  Search,
  SlidersHorizontal,
  ArrowRight,
  BookOpen,
  Layers,
  Terminal,
  ShieldCheck,
  Code2,
} from "lucide-vue-next";

const iconMap: Record<string, any> = {
  Bot,
  Sparkles,
  Brain,
  Search,
  Code2,
};

const { data: response } = await useFetch("/api/eve/agents");
const agents = computed(() => response.value?.agents || []);

const searchQuery = ref("");
const selectedCategory = ref<string>("All");

const categories = ["All", "Assistant", "Research", "Coding", "Social"];

const filteredAgents = computed(() => {
  return agents.value.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesCategory =
      selectedCategory.value === "All" || agent.category === selectedCategory.value;

    return matchesSearch && matchesCategory;
  });
});

const runtimeConfig = useRuntimeConfig();
const canonicalUrl = computed(() => `${runtimeConfig.public.siteUrl || ""}/eve`);

useSeoMeta({
  title: "Eve Agent Canvas Dashboard & Registry | Vantol Bennett",
  description:
    "Canvas dashboard of all autonomous Eve AI agents registered in Vantol Bennett's site platform.",
  ogTitle: "Eve Agent Canvas Dashboard & Registry | Vantol Bennett",
  ogDescription:
    "Canvas dashboard of all autonomous Eve AI agents registered in Vantol Bennett's site platform.",
  ogUrl: canonicalUrl.value,
});
</script>

<template>
  <div class="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
    <div class="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <!-- Header Banner -->
      <header
        class="mb-10 border-b border-border pb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
      >
        <div>
          <div class="flex items-center gap-3 mb-3">
            <span
              class="px-3 py-1 bg-brand text-brand-foreground text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-md"
            >
              EVE AGENT CANVAS DASHBOARD
            </span>
            <span class="text-xs text-muted-foreground font-mono">v1.0.0</span>
            <span class="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              4 Agents Operational
            </span>
          </div>

          <h1
            class="text-3xl md:text-5xl font-bold tracking-tight text-foreground flex items-center gap-3"
          >
            Eve AI Agent Registry
          </h1>
          <p class="text-muted-foreground text-sm md:text-base mt-2 max-w-2xl font-light leading-relaxed">
            Select an agent below to enter its dedicated **Canvas Dashboard Workspace** — featuring
            interactive chat, live step trajectory DAG visualizer, and filesystem memory inspection.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <NuxtLink
            to="/learn/building-eve-modules"
            class="inline-flex items-center gap-2 px-5 py-3 bg-brand hover:bg-brand-hover text-brand-foreground text-xs font-bold rounded-xl transition-all shadow-lg shadow-[#f5c542]/20"
          >
            <BookOpen class="w-4 h-4" />
            <span>Interactive Masterclass ➔</span>
          </NuxtLink>
        </div>
      </header>

      <!-- Filter Controls Bar -->
      <div
        class="mb-8 p-4 bg-card border border-border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl"
      >
        <!-- Category Buttons -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 font-mono text-xs">
          <button
            v-for="cat in categories"
            :key="cat"
            @click="selectedCategory = cat"
            class="px-4 py-2 rounded-xl transition-all font-semibold"
            :class="
              selectedCategory === cat
                ? 'bg-background/15 text-foreground border border-border-strong shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            "
          >
            {{ cat }}
          </button>
        </div>

        <!-- Search Bar -->
        <div class="relative min-w-[280px]">
          <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search agents by name, role, or skill..."
            class="w-full bg-muted border border-border focus:border-blue rounded-xl pl-10 pr-4 py-2 text-xs text-foreground placeholder-zinc-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <!-- Agent Canvas Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <div
          v-for="agent in filteredAgents"
          :key="agent.id"
          class="group relative bg-card border border-border hover:border-blue/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#f5c542]/10 flex flex-col justify-between"
        >
          <div>
            <!-- Header: Avatar & Status -->
            <div class="flex items-center justify-between mb-4">
              <div
                class="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform text-blue"
              >
                <component :is="iconMap[agent.icon] || Bot" class="w-6 h-6" />
              </div>
              <span
                class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border"
                :class="
                  agent.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                "
              >
                {{ agent.status }}
              </span>
            </div>

            <!-- Agent Identity -->
            <h3
              class="text-lg font-bold text-foreground group-hover:text-blue transition-colors flex items-center gap-2"
            >
              <span>{{ agent.name }}</span>
            </h3>
            <p class="text-xs text-amber-400/90 font-mono mt-0.5">{{ agent.role }}</p>
            <p class="text-xs text-muted-foreground font-light mt-3 leading-relaxed">
              {{ agent.description }}
            </p>
          </div>

          <div class="mt-6 pt-4 border-t border-border space-y-4">
            <!-- Metadata Metrics -->
            <div class="grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
              <div class="p-2 bg-background rounded-xl border border-border">
                <span class="text-muted-foreground block text-[9px] uppercase">Model</span>
                <span class="text-foreground font-bold truncate block">{{
                  agent.model.split("/")[1]
                }}</span>
              </div>
              <div class="p-2 bg-background rounded-xl border border-border">
                <span class="text-muted-foreground block text-[9px] uppercase">Tools</span>
                <span class="text-amber-400 font-bold block">{{ agent.toolsCount }}</span>
              </div>
              <div class="p-2 bg-background rounded-xl border border-border">
                <span class="text-muted-foreground block text-[9px] uppercase">Skills</span>
                <span class="text-emerald-400 font-bold block">{{ agent.skillsCount }}</span>
              </div>
            </div>

            <!-- Enter Canvas Workspace Button -->
            <NuxtLink
              :to="`/eve/${agent.id}`"
              class="w-full py-2.5 px-4 bg-accent group-hover:bg-brand text-brand-foreground group-hover:text-brand-foreground font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <span>Open Agent Canvas</span>
              <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
