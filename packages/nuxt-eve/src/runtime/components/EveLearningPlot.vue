<script setup lang="ts">
import { ref, computed } from "vue";
import type { EveStep } from "../server/engine";

const props = withDefaults(
  defineProps<{
    agentId?: string;
    steps?: EveStep[];
    interactiveMode?: boolean;
  }>(),
  {
    agentId: "researcher",
    interactiveMode: true,
    steps: () => [
      {
        index: 1,
        action: "Load instructions.md & Agent Config",
        thought:
          "Parsing agent system prompt instructions and temperature parameters from server/agents/",
        timestamp: Date.now() - 3000,
      },
      {
        index: 2,
        action: "Tool Invocation: knowledgeQuery",
        toolName: "knowledgeQuery",
        toolInput: { query: "Nuxt 4 Eve agent module architecture" },
        toolOutput: { status: "success", matches: ["Eve Core Tutorial", "Nuxt Module Boundary"] },
        timestamp: Date.now() - 2000,
      },
      {
        index: 3,
        action: "Skill Trigger: deepResearchPlaybook",
        thought: "Applying skill procedural instructions from skills/deepResearch.md",
        timestamp: Date.now() - 1000,
      },
      {
        index: 4,
        action: "SSE Server-Sent Event Token Stream",
        thought: "Streaming real-time tokens to client composables useEveChat & useEveAgent",
        timestamp: Date.now(),
      },
    ],
  },
);

const activeStepIndex = ref<number>(1);
const isPlaying = ref(false);

const currentStep = computed(() => {
  return props.steps.find((s) => s.index === activeStepIndex.value) || props.steps[0];
});

function playTrajectoryAnimation() {
  if (isPlaying.value) return;
  isPlaying.value = true;
  activeStepIndex.value = 1;

  const interval = setInterval(() => {
    if (activeStepIndex.value < props.steps.length) {
      activeStepIndex.value++;
    } else {
      clearInterval(interval);
      isPlaying.value = false;
    }
  }, 1000);
}
</script>

<template>
  <div
    class="eve-learning-plot border border-amber-500/30 rounded-2xl bg-zinc-950 p-5 font-sans text-white shadow-2xl w-full max-w-full overflow-hidden"
  >
    <!-- Visualizer Header -->
    <div class="flex flex-wrap items-center justify-between pb-4 border-b border-white/10 gap-3">
      <div>
        <div class="flex items-center space-x-2.5">
          <div
            class="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center border border-amber-500/30 text-xs shrink-0"
          >
            ⚡
          </div>
          <div>
            <h2
              class="text-sm font-bold text-white tracking-wide flex flex-wrap items-center gap-1.5"
            >
              <span>Eve Learning Plot & Step Execution DAG</span>
              <span
                class="text-[9px] font-mono font-normal px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              >
                INTERACTIVE
              </span>
            </h2>
            <p class="text-[11px] text-zinc-400 font-light">
              Click any node below to inspect live execution payload data.
            </p>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex items-center space-x-2">
        <button
          @click="playTrajectoryAnimation"
          :disabled="isPlaying"
          class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors flex items-center space-x-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50 shrink-0"
        >
          <span v-if="isPlaying" class="animate-spin text-xs">⚙️</span>
          <span>{{ isPlaying ? "Playing..." : "▶ Play Trajectory" }}</span>
        </button>
      </div>
    </div>

    <!-- Node DAG Workflow Diagram -->
    <div class="py-4 overflow-x-auto max-w-full scrollbar-thin">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
        <div
          v-for="step in steps"
          :key="step.index"
          @click="activeStepIndex = step.index"
          class="cursor-pointer group relative p-3 rounded-xl border transition-all duration-300 w-full overflow-hidden"
          :class="
            activeStepIndex === step.index
              ? 'bg-zinc-900 border-amber-500 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10'
              : 'bg-zinc-900/60 border-white/10 hover:border-white/30 hover:bg-zinc-900/90'
          "
        >
          <!-- Step badge -->
          <div class="flex items-center justify-between mb-2">
            <span
              class="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
              :class="
                activeStepIndex === step.index
                  ? 'bg-amber-500 text-black'
                  : 'bg-zinc-800 text-amber-400'
              "
            >
              STEP 0{{ step.index }}
            </span>
            <span
              v-if="step.toolName"
              class="text-[10px] font-mono text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30"
            >
              🔧 Tool Call
            </span>
          </div>

          <h4 class="text-xs font-bold text-white truncate mb-1">{{ step.action }}</h4>
          <p class="text-[11px] text-zinc-400 line-clamp-2 leading-snug">
            {{ step.thought || "Execution trajectory step" }}
          </p>

          <!-- Connector Arrow -->
          <div
            v-if="idx < steps.length - 1"
            class="absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-zinc-600 text-sm font-bold"
          >
            ➔
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Step Inspector Card -->
    <div
      v-if="currentStep"
      class="p-5 bg-zinc-900/90 rounded-xl border border-white/10 shadow-inner space-y-3"
    >
      <div class="flex items-center justify-between border-b border-white/10 pb-3">
        <div class="flex items-center space-x-2">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
          <h3 class="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            Step Inspector #0{{ currentStep.index }} — {{ currentStep.action }}
          </h3>
        </div>
        <span class="text-[10px] font-mono text-zinc-400">
          Timestamp: {{ new Date(currentStep.timestamp).toLocaleTimeString() }}
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
        <div class="space-y-1">
          <span class="text-zinc-400 font-mono text-[11px] uppercase tracking-wider block"
            >Agent Thought & Rationale:</span
          >
          <div
            class="p-3 bg-black rounded-lg border border-white/10 font-mono text-zinc-200 leading-relaxed min-h-[80px]"
          >
            {{ currentStep.thought || "Standard execution turn processing" }}
          </div>
        </div>

        <div class="space-y-1">
          <span class="text-zinc-400 font-mono text-[11px] uppercase tracking-wider block"
            >Tool & Payload Context:</span
          >
          <pre
            class="p-3 bg-black rounded-lg border border-white/10 font-mono text-emerald-400 text-[11px] overflow-x-auto min-h-[80px] leading-relaxed"
            >{{
              JSON.stringify(
                currentStep.toolOutput || { status: "step_completed", agentId },
                null,
                2,
              )
            }}</pre
          >
        </div>
      </div>
    </div>
  </div>
</template>
