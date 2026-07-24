<script setup lang="ts">
import { ref } from 'vue'
import { FolderTree, FileText, Code2, Wrench, BookOpen, Share2, Cpu, Clock, Terminal, CheckCircle } from 'lucide-vue-next'

const { data: agentData } = await useFetch('/api/eve/agent')

const activeTab = ref<'instructions' | 'config' | 'tools' | 'skills' | 'connections' | 'subagents' | 'schedules'>('instructions')
const selectedItemIndex = ref(0)

const runtimeConfig = useRuntimeConfig()
const canonicalUrl = computed(() => `${runtimeConfig.public.siteUrl || ''}/eve`)

useSeoMeta({
  title: 'Eve AI Agent Studio | Vantol Bennett',
  description: 'Interactive AI Agent built with Vercel Eve framework. Explore instructions.md, agent.ts, tools, skills, subagents, and schedules live.',
  ogTitle: 'Eve AI Agent Studio | Vantol Bennett',
  ogDescription: 'Interactive AI Agent built with Vercel Eve framework. Explore instructions.md, agent.ts, tools, skills, subagents, and schedules live.',
  ogUrl: canonicalUrl.value
})
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a] text-white font-sans">
    <div class="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <!-- Header Banner -->
      <header class="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <span class="px-2.5 py-1 bg-[#f5c542] text-black text-[10px] font-bold uppercase tracking-widest rounded-md">
              VERCEL EVE FRAMEWORK
            </span>
            <span class="text-xs text-zinc-400 font-mono">v1.0.0</span>
            <span class="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Agent Operational
            </span>
          </div>
          <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            Eve AI Agent Studio
          </h1>
          <p class="text-zinc-400 text-sm mt-1 max-w-2xl font-light">
            An autonomous agent built strictly following Vercel's filesystem-first Eve architecture. Chat with the agent or inspect its underlying instructions, tools, skills, subagents, and schedules.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink
            to="/learn/eve-core"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-semibold text-white transition-colors"
          >
            <BookOpen class="w-4 h-4 text-[#f5c542]" />
            Eve Tutorial Series
          </NuxtLink>
        </div>
      </header>

      <!-- Main Studio Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-220px)] min-h-[700px]">
        <!-- Left: Interactive Chat Agent (7 cols) -->
        <div class="lg:col-span-7 lg:order-1 h-full">
          <EveAgentChat />
        </div>

        <!-- Right: Filesystem Inspector (5 cols) -->
        <div class="lg:col-span-5 lg:order-2 h-full flex flex-col bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <!-- Inspector Header -->
          <div class="px-5 py-4 bg-black/60 border-b border-white/10 flex items-center justify-between">
            <div class="flex items-center gap-2 text-sm font-semibold text-white">
              <FolderTree class="w-4 h-4 text-[#f5c542]" />
              <span>Agent Filesystem Inspector</span>
            </div>
            <span class="text-[11px] font-mono text-zinc-500">agent/</span>
          </div>

          <!-- Category Nav Tabs -->
          <div class="flex items-center gap-1 p-2 bg-zinc-950 border-b border-white/10 overflow-x-auto text-xs font-mono">
            <button
              @click="activeTab = 'instructions'; selectedItemIndex = 0"
              class="px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              :class="activeTab === 'instructions' ? 'bg-[#f5c542] text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-white/5'"
            >
              <FileText class="w-3.5 h-3.5" />
              <span>instructions</span>
            </button>

            <button
              @click="activeTab = 'config'; selectedItemIndex = 0"
              class="px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              :class="activeTab === 'config' ? 'bg-[#f5c542] text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-white/5'"
            >
              <Code2 class="w-3.5 h-3.5" />
              <span>agent.ts</span>
            </button>

            <button
              @click="activeTab = 'tools'; selectedItemIndex = 0"
              class="px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              :class="activeTab === 'tools' ? 'bg-[#f5c542] text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-white/5'"
            >
              <Wrench class="w-3.5 h-3.5" />
              <span>tools ({{ agentData?.filesystem?.tools?.length || 0 }})</span>
            </button>

            <button
              @click="activeTab = 'skills'; selectedItemIndex = 0"
              class="px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              :class="activeTab === 'skills' ? 'bg-[#f5c542] text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-white/5'"
            >
              <BookOpen class="w-3.5 h-3.5" />
              <span>skills</span>
            </button>

            <button
              @click="activeTab = 'subagents'; selectedItemIndex = 0"
              class="px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              :class="activeTab === 'subagents' ? 'bg-[#f5c542] text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-white/5'"
            >
              <Cpu class="w-3.5 h-3.5" />
              <span>subagents</span>
            </button>

            <button
              @click="activeTab = 'schedules'; selectedItemIndex = 0"
              class="px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              :class="activeTab === 'schedules' ? 'bg-[#f5c542] text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-white/5'"
            >
              <Clock class="w-3.5 h-3.5" />
              <span>schedules</span>
            </button>
          </div>

          <!-- Code Viewer -->
          <div class="flex-1 overflow-y-auto p-4 bg-zinc-950 font-mono text-xs text-zinc-300 leading-relaxed">
            <!-- Instructions tab -->
            <div v-if="activeTab === 'instructions'" class="space-y-2">
              <div class="text-[11px] text-zinc-500 pb-2 border-b border-white/10 flex justify-between">
                <span>File: agent/instructions.md</span>
                <span>System Prompt</span>
              </div>
              <pre class="text-zinc-200 whitespace-pre-wrap font-sans">{{ agentData?.filesystem?.instructions }}</pre>
            </div>

            <!-- Config tab -->
            <div v-else-if="activeTab === 'config'" class="space-y-2">
              <div class="text-[11px] text-zinc-500 pb-2 border-b border-white/10 flex justify-between">
                <span>File: agent/agent.ts</span>
                <span>defineAgent</span>
              </div>
              <pre class="text-amber-300 whitespace-pre-wrap">{{ agentData?.filesystem?.config }}</pre>
            </div>

            <!-- Tools tab -->
            <div v-else-if="activeTab === 'tools'" class="space-y-3">
              <div class="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
                <button
                  v-for="(tool, idx) in agentData?.filesystem?.tools"
                  :key="tool.name"
                  @click="selectedItemIndex = idx"
                  class="px-2.5 py-1 rounded text-[11px] transition-colors"
                  :class="selectedItemIndex === idx ? 'bg-white/20 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'"
                >
                  {{ tool.name }}.ts
                </button>
              </div>
              <div v-if="agentData?.filesystem?.tools?.[selectedItemIndex]">
                <div class="text-[11px] text-zinc-500 mb-2">
                  File: {{ agentData.filesystem.tools[selectedItemIndex].path }}
                </div>
                <pre class="text-emerald-400 whitespace-pre-wrap">{{ agentData.filesystem.tools[selectedItemIndex].code }}</pre>
              </div>
            </div>

            <!-- Skills tab -->
            <div v-else-if="activeTab === 'skills'" class="space-y-3">
              <div class="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
                <button
                  v-for="(skill, idx) in agentData?.filesystem?.skills"
                  :key="skill.name"
                  @click="selectedItemIndex = idx"
                  class="px-2.5 py-1 rounded text-[11px] transition-colors"
                  :class="selectedItemIndex === idx ? 'bg-white/20 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'"
                >
                  {{ skill.name }}.md
                </button>
              </div>
              <div v-if="agentData?.filesystem?.skills?.[selectedItemIndex]">
                <div class="text-[11px] text-zinc-500 mb-2">
                  File: {{ agentData.filesystem.skills[selectedItemIndex].path }}
                </div>
                <pre class="text-zinc-200 whitespace-pre-wrap font-sans">{{ agentData.filesystem.skills[selectedItemIndex].content }}</pre>
              </div>
            </div>

            <!-- Subagents tab -->
            <div v-else-if="activeTab === 'subagents'" class="space-y-3">
              <div v-if="agentData?.filesystem?.subagents?.[0]">
                <div class="text-[11px] text-zinc-500 mb-2">
                  Directory: agent/subagents/researcher/
                </div>
                <div class="space-y-3">
                  <div>
                    <span class="text-purple-400 font-bold">agent.ts</span>
                    <pre class="text-purple-300 whitespace-pre-wrap mt-1 p-2 bg-black/40 rounded border border-white/5">{{ agentData.filesystem.subagents[0].code }}</pre>
                  </div>
                  <div>
                    <span class="text-purple-400 font-bold">instructions.md</span>
                    <pre class="text-zinc-300 whitespace-pre-wrap mt-1 p-2 bg-black/40 rounded border border-white/5">{{ agentData.filesystem.subagents[0].instructions }}</pre>
                  </div>
                </div>
              </div>
            </div>

            <!-- Schedules tab -->
            <div v-else-if="activeTab === 'schedules'" class="space-y-3">
              <div v-if="agentData?.filesystem?.schedules?.[0]">
                <div class="text-[11px] text-zinc-500 mb-2">
                  File: agent/schedules/daily_digest.ts (Cron: "0 9 * * *")
                </div>
                <pre class="text-cyan-400 whitespace-pre-wrap">{{ agentData.filesystem.schedules[0].code }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
