<script setup lang="ts">
import { ref, computed } from "vue";
import {
  ArrowLeft,
  Bot,
  FolderTree,
  FileText,
  Code2,
  Wrench,
  BookOpen,
  Layers,
  Terminal,
  Sparkles,
} from "lucide-vue-next";

const route = useRoute();
const agentId = computed(() => (route.params.agent as string) || "assistant");

const { data: agentData } = await useFetch("/api/eve/agent");

const activeTab = ref<"instructions" | "config" | "tools" | "skills">("instructions");
const selectedItemIndex = ref(0);

const runtimeConfig = useRuntimeConfig();
const canonicalUrl = computed(() => `${runtimeConfig.public.siteUrl || ""}/eve/${agentId.value}`);

useSeoMeta({
  title: () => `Eve Agent Canvas: ${agentId.value} | Vantol Bennett`,
  description: () =>
    `Dedicated Canvas Dashboard for Eve AI Agent [${agentId.value}] with real-time chat, DAG trajectory visualizer, and memory inspection.`,
  ogTitle: () => `Eve Agent Canvas: ${agentId.value} | Vantol Bennett`,
  ogDescription: () =>
    `Dedicated Canvas Dashboard for Eve AI Agent [${agentId.value}] with real-time chat, DAG trajectory visualizer, and memory inspection.`,
  ogUrl: () => canonicalUrl.value,
});
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden">
    <div class="max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 overflow-hidden">
      <!-- Breadcrumb & Agent Header Bar -->
      <div
        class="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5"
      >
        <div class="flex items-center space-x-4">
          <NuxtLink
            to="/eve"
            class="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-colors flex items-center space-x-1.5"
          >
            <ArrowLeft class="w-3.5 h-3.5" />
            <span>All Agents</span>
          </NuxtLink>

          <div class="h-4 w-px bg-white/20"></div>

          <div>
            <div class="flex items-center space-x-2">
              <span
                class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-[10px] font-bold uppercase"
              >
                CANVAS WORKSPACE
              </span>
              <span class="text-xs text-zinc-500 font-mono">/eve/{{ agentId }}</span>
            </div>
            <h1 class="text-2xl font-bold text-white capitalize mt-0.5 flex items-center space-x-2">
              <span>Agent Canvas: {{ agentId }}</span>
            </h1>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <span
            class="flex items-center space-x-1.5 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Agent Online</span>
          </span>
        </div>
      </div>

      <!-- MAIN CANVAS DASHBOARD SETTING (2 Columns) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[750px]">
        <!-- LEFT COLUMN: Agent Studio Chat (6 cols) -->
        <div class="lg:col-span-6 h-full flex flex-col">
          <EveChatWindow :agent-id="agentId" title="Eve Agent Studio Chat" />
        </div>

        <!-- RIGHT COLUMN: Visualizer + Filesystem Inspector (6 cols) -->
        <div class="lg:col-span-6 h-full flex flex-col space-y-6">
          <!-- Top Right: Interactive Learning Plot DAG Visualizer -->
          <EveLearningPlot :agent-id="agentId" :interactive-mode="true" />

          <!-- Bottom Right: Filesystem Inspector Card -->
          <div
            class="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex-1 flex flex-col min-h-[300px]"
          >
            <div
              class="px-5 py-3.5 bg-black/60 border-b border-white/10 flex items-center justify-between"
            >
              <div class="flex items-center space-x-2 text-xs font-semibold text-white">
                <FolderTree class="w-4 h-4 text-[#f5c542]" />
                <span>Agent Memory & Filesystem Inspector</span>
              </div>
              <span class="text-[10px] font-mono text-zinc-500">server/agents/{{ agentId }}/</span>
            </div>

            <!-- Tabs -->
            <div
              class="flex items-center gap-1 p-2 bg-zinc-950 border-b border-white/10 overflow-x-auto text-xs font-mono"
            >
              <button
                @click="
                  activeTab = 'instructions';
                  selectedItemIndex = 0;
                "
                class="px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                :class="
                  activeTab === 'instructions'
                    ? 'bg-[#f5c542] text-black font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                "
              >
                <FileText class="w-3.5 h-3.5" />
                <span>instructions.md</span>
              </button>

              <button
                @click="
                  activeTab = 'config';
                  selectedItemIndex = 0;
                "
                class="px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                :class="
                  activeTab === 'config'
                    ? 'bg-[#f5c542] text-black font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                "
              >
                <Code2 class="w-3.5 h-3.5" />
                <span>agent.config.ts</span>
              </button>

              <button
                @click="
                  activeTab = 'tools';
                  selectedItemIndex = 0;
                "
                class="px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                :class="
                  activeTab === 'tools'
                    ? 'bg-[#f5c542] text-black font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                "
              >
                <Wrench class="w-3.5 h-3.5" />
                <span>tools ({{ agentData?.filesystem?.tools?.length || 0 }})</span>
              </button>
            </div>

            <!-- Content Area -->
            <div
              class="flex-1 p-4 bg-zinc-950 font-mono text-xs text-zinc-300 overflow-y-auto leading-relaxed"
            >
              <div v-if="activeTab === 'instructions'" class="space-y-1">
                <div class="text-[10px] text-zinc-500 mb-2 border-b border-white/10 pb-1">
                  System Instructions (server/agents/{{ agentId }}/instructions.md)
                </div>
                <pre class="text-zinc-200 whitespace-pre-wrap font-sans leading-relaxed">{{
                  agentData?.filesystem?.instructions
                }}</pre>
              </div>

              <div v-else-if="activeTab === 'config'" class="space-y-1">
                <div class="text-[10px] text-zinc-500 mb-2 border-b border-white/10 pb-1">
                  Agent Config (server/agents/{{ agentId }}/agent.config.ts)
                </div>
                <pre class="text-amber-300 whitespace-pre-wrap leading-relaxed">{{
                  agentData?.filesystem?.config
                }}</pre>
              </div>

              <div v-else-if="activeTab === 'tools'" class="space-y-2">
                <div class="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
                  <button
                    v-for="(tool, idx) in agentData?.filesystem?.tools"
                    :key="tool.name"
                    @click="selectedItemIndex = idx"
                    class="px-2.5 py-1 rounded text-[11px] transition-colors"
                    :class="
                      selectedItemIndex === idx
                        ? 'bg-white/20 text-white font-bold'
                        : 'text-zinc-500 hover:text-zinc-300'
                    "
                  >
                    {{ tool.name }}.ts
                  </button>
                </div>
                <div v-if="agentData?.filesystem?.tools?.[selectedItemIndex]">
                  <pre class="text-emerald-400 whitespace-pre-wrap leading-relaxed">{{
                    agentData.filesystem.tools[selectedItemIndex].code
                  }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
