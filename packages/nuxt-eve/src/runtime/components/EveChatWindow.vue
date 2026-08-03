<script setup lang="ts">
import { useEveChat } from "../composables/useEveChat";

const props = withDefaults(
  defineProps<{
    agentId: string;
    title?: string;
    placeholder?: string;
  }>(),
  {
    title: "Eve AI Agent",
    placeholder: "Ask your Eve agent...",
  },
);

const { messages, input, isStreaming, activeSteps, sendMessage } = useEveChat(props.agentId);
</script>

<template>
  <div
    class="eve-chat-card bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[520px] max-w-2xl mx-auto text-slate-100 font-sans"
  >
    <!-- Header -->
    <div
      class="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between backdrop-blur-sm"
    >
      <div class="flex items-center space-x-3">
        <div
          class="relative flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20"
        >
          <span>⚡</span>
          <span
            v-if="isStreaming"
            class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"
          ></span>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-white tracking-wide">{{ title }}</h3>
          <p class="text-xs text-slate-400 font-mono">Agent ID: {{ agentId }}</p>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <span
          class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        >
          Filesystem-First Agent
        </span>
      </div>
    </div>

    <!-- Messages Container -->
    <div class="flex-1 p-5 overflow-y-auto space-y-4">
      <div
        v-if="messages.length === 0"
        class="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-2"
      >
        <div
          class="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-2xl border border-slate-700"
        >
          🤖
        </div>
        <p class="text-sm font-medium text-slate-400">No messages yet</p>
        <p class="text-xs max-w-xs">
          Type a message below to trigger execution steps, tool lookup, and real-time streaming.
        </p>
      </div>

      <div
        v-for="msg in messages"
        :key="msg.id"
        class="flex flex-col"
        :class="msg.role === 'user' ? 'items-end' : 'items-start'"
      >
        <div
          class="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
          :class="
            msg.role === 'user'
              ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
              : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-bl-none shadow-sm'
          "
        >
          <div class="text-[10px] uppercase font-mono font-bold tracking-wider opacity-60 mb-1">
            {{ msg.role }}
          </div>
          <div class="whitespace-pre-wrap">{{ msg.content }}</div>
        </div>
      </div>

      <!-- Active Steps Trace -->
      <div
        v-if="activeSteps.length > 0 && isStreaming"
        class="p-3 bg-slate-950/60 border border-emerald-500/30 rounded-lg text-xs space-y-2"
      >
        <div class="text-emerald-400 font-mono font-semibold flex items-center space-x-2">
          <span class="animate-spin">⚙️</span>
          <span>Execution Trajectory Steps</span>
        </div>
        <div
          v-for="step in activeSteps"
          :key="step.index"
          class="text-slate-300 font-mono pl-3 border-l border-emerald-500/40"
        >
          <span class="text-slate-500">#{{ step.index }}</span> {{ step.action }}
          <span
            v-if="step.toolName"
            class="ml-2 inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-900/50 text-emerald-300 text-[10px]"
          >
            🔧 {{ step.toolName }}
          </span>
        </div>
      </div>
    </div>

    <!-- Input Footer -->
    <div class="p-4 bg-slate-950 border-t border-slate-800">
      <form @submit.prevent="sendMessage()" class="flex space-x-2">
        <input
          v-model="input"
          type="text"
          :placeholder="placeholder"
          :disabled="isStreaming"
          class="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 disabled:opacity-50"
        />
        <button
          type="submit"
          :disabled="isStreaming || !input.trim()"
          class="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors duration-150 flex items-center justify-center space-x-1"
        >
          <span>Send</span>
        </button>
      </form>
    </div>
  </div>
</template>
