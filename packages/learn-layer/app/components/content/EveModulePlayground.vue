<script setup lang="ts">
import { ref } from "vue";

const activeTab = ref<"code" | "runner" | "plot">("code");
const activeFile = ref<"module" | "instructions" | "tool" | "config">("module");
const userPrompt = ref("Summarize the top Nuxt 4 & Eve features");
const isExecuting = ref(false);
const executionOutput = ref("");
const currentStepIndex = ref(0);

const codeSnippets = {
  module: `// packages/nuxt-eve/src/module.ts
import { defineNuxtModule, createResolver, addImports, addServerHandler } from '@nuxt/kit'

export default defineNuxtModule({
  meta: { name: '@vvantol2000/nuxt-eve', configKey: 'eve' },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // 1. Auto-import Vue composables
    addImports([{ name: 'useEveChat', from: resolver.resolve('./runtime/composables/useEveChat') }])

    // 2. Register Nitro SSE stream route
    addServerHandler({
      route: '/api/_eve/:agent/stream',
      handler: resolver.resolve('./runtime/server/api/stream.get')
    })
  }
})`,
  instructions: `---
name: Nuxt Eve Assistant
role: Technical Documentation Assistant
model: mock
---

You are an Eve AI Agent embedded inside a Nuxt 4 module.
Your job is to assist developers with module architecture, server tools, and reactive Vue composables.`,
  tool: `// server/agents/assistant/tools/searchDocs.ts
import { defineEveTool } from '@vvantol2000/nuxt-eve/server'
import { z } from 'zod'

export default defineEveTool({
  name: 'searchDocs',
  description: 'Searches official Nuxt 4 and Eve framework docs',
  parameters: z.object({ query: z.string() }),
  async execute({ query }, { event }) {
    return { status: 'success', matches: ['Nuxt 4 Module Guide', 'Eve Filesystem Architecture'] }
  }
})`,
  config: `// server/agents/assistant/agent.config.ts
export default {
  id: 'assistant',
  model: 'mock',
  temperature: 0.7,
  maxSteps: 4
}`,
};

const stepsTrajectory = ref([
  {
    index: 1,
    name: "Parse Module Config",
    status: "pending",
    detail: "Read server/agents/assistant/instructions.md",
  },
  {
    index: 2,
    name: "Tool Execution",
    status: "pending",
    detail: "Execute searchDocs tool with user query",
  },
  {
    index: 3,
    name: "Skill Playbook",
    status: "pending",
    detail: "Apply procedural knowledge playbook",
  },
  {
    index: 4,
    name: "SSE Token Stream",
    status: "pending",
    detail: "Emit real-time tokens to Vue composable",
  },
]);

const runInteractiveDemo = async () => {
  if (isExecuting.value) return;
  isExecuting.value = true;
  executionOutput.value = "";
  currentStepIndex.value = 0;

  // Reset steps
  stepsTrajectory.value.forEach((s) => (s.status = "pending"));

  // Step 1
  currentStepIndex.value = 1;
  stepsTrajectory.value[0].status = "active";
  await new Promise((r) => setTimeout(r, 600));
  stepsTrajectory.value[0].status = "complete";

  // Step 2
  currentStepIndex.value = 2;
  stepsTrajectory.value[1].status = "active";
  await new Promise((r) => setTimeout(r, 700));
  stepsTrajectory.value[1].status = "complete";

  // Step 3
  currentStepIndex.value = 3;
  stepsTrajectory.value[2].status = "active";
  await new Promise((r) => setTimeout(r, 600));
  stepsTrajectory.value[2].status = "complete";

  // Step 4
  currentStepIndex.value = 4;
  stepsTrajectory.value[3].status = "active";

  const message = `[Eve Nuxt Module Output] Results for "${userPrompt.value}": Built with @vvantol2000/nuxt-eve module engine, integrating filesystem instructions with Nitro server handlers!`;
  const words = message.split(" ");

  for (const word of words) {
    executionOutput.value += word + " ";
    await new Promise((r) => setTimeout(r, 80));
  }

  stepsTrajectory.value[3].status = "complete";
  isExecuting.value = false;
};
</script>

<template>
  <div
    class="my-8 rounded-2xl bg-zinc-950 border border-amber-500/30 overflow-hidden shadow-2xl font-sans text-white"
  >
    <!-- Header -->
    <div
      class="px-6 py-4 bg-zinc-900/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-4"
    >
      <div class="flex items-center space-x-3">
        <div
          class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center border border-amber-500/30"
        >
          ⚡
        </div>
        <div>
          <h3 class="text-sm font-bold text-white tracking-wide">
            Interactive Eve + Nuxt Module Sandbox
          </h3>
          <p class="text-xs text-zinc-400 font-light">
            Build, test, and visualize an Eve-powered Nuxt module live in your browser
          </p>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center space-x-1 bg-black/60 p-1 rounded-xl border border-white/10">
        <button
          @click="activeTab = 'code'"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          :class="
            activeTab === 'code' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
          "
        >
          💻 Module Code
        </button>
        <button
          @click="activeTab = 'runner'"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          :class="
            activeTab === 'runner' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
          "
        >
          🤖 Live Runner
        </button>
        <button
          @click="activeTab = 'plot'"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          :class="
            activeTab === 'plot' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
          "
        >
          📍 Learning Plot DAG
        </button>
      </div>
    </div>

    <!-- Body Area -->
    <div class="p-6">
      <!-- TAB 1: Code Builder -->
      <div v-if="activeTab === 'code'" class="space-y-4">
        <div
          class="flex items-center space-x-2 border-b border-white/10 pb-3 overflow-x-auto text-xs font-mono"
        >
          <button
            @click="activeFile = 'module'"
            class="px-3 py-1.5 rounded-lg border transition-colors"
            :class="
              activeFile === 'module'
                ? 'bg-white/15 text-amber-400 border-amber-500/50 font-bold'
                : 'border-transparent text-zinc-400 hover:text-white'
            "
          >
            src/module.ts
          </button>
          <button
            @click="activeFile = 'instructions'"
            class="px-3 py-1.5 rounded-lg border transition-colors"
            :class="
              activeFile === 'instructions'
                ? 'bg-white/15 text-amber-400 border-amber-500/50 font-bold'
                : 'border-transparent text-zinc-400 hover:text-white'
            "
          >
            instructions.md
          </button>
          <button
            @click="activeFile = 'tool'"
            class="px-3 py-1.5 rounded-lg border transition-colors"
            :class="
              activeFile === 'tool'
                ? 'bg-white/15 text-amber-400 border-amber-500/50 font-bold'
                : 'border-transparent text-zinc-400 hover:text-white'
            "
          >
            tools/searchDocs.ts
          </button>
          <button
            @click="activeFile = 'config'"
            class="px-3 py-1.5 rounded-lg border transition-colors"
            :class="
              activeFile === 'config'
                ? 'bg-white/15 text-amber-400 border-amber-500/50 font-bold'
                : 'border-transparent text-zinc-400 hover:text-white'
            "
          >
            agent.config.ts
          </button>
        </div>

        <pre
          class="p-4 bg-black rounded-xl border border-white/10 font-mono text-xs text-amber-200 overflow-x-auto leading-relaxed"
          >{{ codeSnippets[activeFile] }}</pre
        >

        <div
          class="flex items-center justify-between text-xs text-zinc-400 bg-zinc-900/60 p-3 rounded-lg border border-white/5"
        >
          <span
            >💡 Notice how <code class="text-amber-400">defineNuxtModule</code> bridges Nitro server
            routes with Eve's filesystem agents!</span
          >
          <button @click="activeTab = 'runner'" class="text-amber-400 font-bold hover:underline">
            Test Agent Live ➔
          </button>
        </div>
      </div>

      <!-- TAB 2: Live Agent Runner -->
      <div v-else-if="activeTab === 'runner'" class="space-y-4">
        <div class="flex space-x-2">
          <input
            v-model="userPrompt"
            type="text"
            placeholder="Type a test prompt for the Eve module..."
            class="flex-1 bg-black border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <button
            @click="runInteractiveDemo"
            :disabled="isExecuting || !userPrompt.trim()"
            class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs transition-colors flex items-center space-x-1"
          >
            <span v-if="isExecuting" class="animate-spin">⚙️</span>
            <span>{{ isExecuting ? "Running Agent..." : "Run Agent" }}</span>
          </button>
        </div>

        <!-- Output Console -->
        <div class="p-4 bg-black rounded-xl border border-zinc-800 min-h-[120px] font-mono text-xs">
          <div
            class="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-2 border-b border-zinc-900 pb-1"
          >
            Console Stream Output
          </div>
          <div v-if="executionOutput" class="text-emerald-400 leading-relaxed">
            {{ executionOutput }}
          </div>
          <div v-else class="text-zinc-600 italic">
            Click "Run Agent" to execute the Eve module pipeline and stream tokens live.
          </div>
        </div>
      </div>

      <!-- TAB 3: Learning Plot DAG Visualizer -->
      <div v-else-if="activeTab === 'plot'" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div
            v-for="s in stepsTrajectory"
            :key="s.index"
            class="p-3 rounded-xl border transition-all duration-300"
            :class="
              s.status === 'complete'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : s.status === 'active'
                  ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20 text-amber-300 animate-pulse'
                  : 'bg-black/60 border-zinc-800 text-zinc-500'
            "
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-[10px] font-mono font-bold">STEP {{ s.index }}</span>
              <span class="text-xs">
                {{ s.status === "complete" ? "✅" : s.status === "active" ? "⚡" : "⏳" }}
              </span>
            </div>
            <h4 class="text-xs font-semibold">{{ s.name }}</h4>
            <p class="text-[10px] mt-1 opacity-80">{{ s.detail }}</p>
          </div>
        </div>

        <div
          class="p-3 bg-zinc-900/80 rounded-xl border border-white/10 text-xs text-zinc-300 font-light flex items-center justify-between"
        >
          <span
            >📍 The Learning Plot visualizer tracks agent thought loops & tool calls in real
            time.</span
          >
          <button @click="runInteractiveDemo" class="text-amber-400 font-bold hover:underline">
            Trigger Execution ➔
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
