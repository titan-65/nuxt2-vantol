<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Send, Bot, User, Sparkles, Terminal, Code2, Cpu, FileText, CheckCircle2, ChevronDown, ChevronRight, Loader2 } from 'lucide-vue-next'

interface ToolCall {
  tool: string
  args: any
  result: any
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  metadata?: {
    framework?: string
    model?: string
    activeSkill?: string | null
    toolCalls?: ToolCall[]
    subagentLogs?: string[]
    timestamp?: string
  }
}

const props = defineProps<{
  initialPrompt?: string
}>()

const messages = ref<Message[]>([
  {
    id: '1',
    role: 'assistant',
    content: `Hello! I am the **Eve AI Agent** powering [vantolbennett.com](/learn). 

I run on Vercel's **Eve Framework** — a filesystem-first architecture for durable AI agents.

How can I help you today? Ask me about Eve architecture, tutorial series, or search the site!`,
    metadata: {
      framework: 'Vercel Eve',
      model: 'openai/gpt-5.4-mini',
      timestamp: new Date().toISOString()
    }
  }
])

const input = ref('')
const isLoading = ref(false)
const chatContainer = ref<HTMLElement | null>(null)
const expandedTools = ref<Record<string, boolean>>({})

const quickPrompts = [
  'What is the Eve framework?',
  'Show me step 1 of the Eve Core tutorial',
  'Search for Null Agent blog posts',
  'Run agent.ts code in the Sandbox'
]

function toggleTool(id: string) {
  expandedTools.value[id] = !expandedTools.value[id]
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

async function sendMessage(textToSend?: string) {
  const text = textToSend || input.value.trim()
  if (!text || isLoading.value) return

  const userMsg: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: text
  }

  messages.value.push(userMsg)
  if (!textToSend) input.value = ''
  isLoading.value = true
  scrollToBottom()

  try {
    const res = await $fetch<{
      role: 'assistant'
      content: string
      metadata: any
    }>('/api/eve/chat', {
      method: 'POST',
      body: {
        messages: messages.value.map(m => ({ role: m.role, content: m.content }))
      }
    })

    messages.value.push({
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: res.content,
      metadata: res.metadata
    })
  } catch (err: any) {
    messages.value.push({
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'Sorry, an error occurred while communicating with the Eve Agent. Please try again.'
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

onMounted(() => {
  if (props.initialPrompt) {
    sendMessage(props.initialPrompt)
  }
})
</script>

<template>
  <div class="flex flex-col h-full bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
    <!-- Chat Header -->
    <div class="px-5 py-4 bg-[#111] border-b border-white/10 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-[#f5c542]/10 border border-[#f5c542]/30 flex items-center justify-center text-[#f5c542]">
          <Bot class="w-4 h-4" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-semibold text-white">Eve AI Agent</h3>
            <span class="px-2 py-0.5 text-[10px] font-mono bg-[#f5c542]/10 text-[#f5c542] border border-[#f5c542]/30 rounded-full font-semibold">
              FILESYSTEM FIRST
            </span>
          </div>
          <p class="text-[11px] text-zinc-400">Powered by Vercel Eve Framework & GPT-5.4-mini</p>
        </div>
      </div>

      <div class="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>AGENT ACTIVE</span>
      </div>
    </div>

    <!-- Messages Container -->
    <div ref="chatContainer" class="flex-1 overflow-y-auto p-5 space-y-6">
      <div v-for="msg in messages" :key="msg.id" class="flex flex-col gap-2">
        <!-- User Message -->
        <div v-if="msg.role === 'user'" class="flex justify-end">
          <div class="max-w-[85%] bg-white/10 text-white rounded-2xl px-4 py-3 text-sm leading-relaxed border border-white/10">
            {{ msg.content }}
          </div>
        </div>

        <!-- Assistant Message -->
        <div v-else class="flex gap-3 max-w-[92%]">
          <div class="w-7 h-7 rounded-lg bg-[#f5c542] text-black font-bold flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-[#f5c542]/20">
            <Sparkles class="w-3.5 h-3.5" />
          </div>

          <div class="flex-1 space-y-3">
            <!-- Active Skill Badge -->
            <div v-if="msg.metadata?.activeSkill" class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-md text-xs font-mono">
              <FileText class="w-3.5 h-3.5" />
              <span>Skill Loaded: <strong>{{ msg.metadata.activeSkill }}</strong></span>
            </div>

            <!-- Subagent Execution Logs -->
            <div v-if="msg.metadata?.subagentLogs?.length" class="bg-purple-950/20 border border-purple-500/30 rounded-lg p-3 font-mono text-xs text-purple-300 space-y-1">
              <div class="flex items-center gap-1.5 text-purple-400 font-bold mb-1">
                <Cpu class="w-3.5 h-3.5" />
                <span>Subagent Delegation ('researcher')</span>
              </div>
              <p v-for="(log, idx) in msg.metadata.subagentLogs" :key="idx" class="text-[11px] opacity-85">
                {{ log }}
              </p>
            </div>

            <!-- Tool Calls Accordion -->
            <div v-if="msg.metadata?.toolCalls?.length" class="space-y-2">
              <div
                v-for="(tc, idx) in msg.metadata.toolCalls"
                :key="idx"
                class="bg-zinc-900/90 border border-white/10 rounded-lg overflow-hidden text-xs"
              >
                <button
                  type="button"
                  @click="toggleTool(msg.id + '-' + idx)"
                  class="w-full px-3 py-2 flex items-center justify-between hover:bg-white/5 transition-colors font-mono text-zinc-300"
                >
                  <div class="flex items-center gap-2">
                    <Terminal class="w-3.5 h-3.5 text-[#f5c542]" />
                    <span>Tool Called: <strong class="text-white">{{ tc.tool }}</strong></span>
                  </div>
                  <component :is="expandedTools[msg.id + '-' + idx] ? ChevronDown : ChevronRight" class="w-3.5 h-3.5 text-zinc-500" />
                </button>

                <div v-if="expandedTools[msg.id + '-' + idx]" class="p-3 bg-black/60 border-t border-white/10 font-mono space-y-2 text-[11px]">
                  <div>
                    <span class="text-zinc-500">Inputs:</span>
                    <pre class="text-amber-300 overflow-x-auto p-1.5 bg-zinc-950 rounded mt-0.5">{{ JSON.stringify(tc.args, null, 2) }}</pre>
                  </div>
                  <div>
                    <span class="text-zinc-500">Output:</span>
                    <pre class="text-emerald-400 overflow-x-auto p-1.5 bg-zinc-950 rounded mt-0.5">{{ JSON.stringify(tc.result, null, 2) }}</pre>
                  </div>
                </div>
              </div>
            </div>

            <!-- Content text -->
            <div class="bg-[#111] border border-white/10 rounded-2xl p-4 text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans prose prose-invert max-w-none prose-a:text-[#f5c542]">
              {{ msg.content }}
            </div>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="flex gap-3 max-w-[80%] items-center text-xs text-zinc-400 font-mono">
        <div class="w-7 h-7 rounded-lg bg-[#f5c542]/20 border border-[#f5c542]/30 flex items-center justify-center text-[#f5c542]">
          <Loader2 class="w-4 h-4 animate-spin" />
        </div>
        <span>Eve Agent is executing filesystem tools & synthesizing answer...</span>
      </div>
    </div>

    <!-- Quick Prompts Bar -->
    <div class="px-4 py-2 border-t border-white/5 bg-black/40 flex flex-wrap gap-2">
      <button
        v-for="prompt in quickPrompts"
        :key="prompt"
        type="button"
        @click="sendMessage(prompt)"
        class="text-xs px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#f5c542]/40 rounded-full text-zinc-300 hover:text-white transition-all text-left"
      >
        {{ prompt }}
      </button>
    </div>

    <!-- Input Form -->
    <form @submit.prevent="sendMessage()" class="p-4 bg-[#111] border-t border-white/10 flex items-center gap-3">
      <input
        v-model="input"
        type="text"
        placeholder="Ask the Eve Agent about framework docs, tools, skills, or tutorials..."
        class="flex-1 bg-zinc-900 border border-white/10 focus:border-[#f5c542] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
        :disabled="isLoading"
      />
      <button
        type="submit"
        :disabled="!input.trim() || isLoading"
        class="w-10 h-10 rounded-xl bg-[#f5c542] hover:bg-[#e0b13a] disabled:opacity-50 text-black flex items-center justify-center font-bold transition-all shrink-0 shadow-lg shadow-[#f5c542]/20"
      >
        <Send class="w-4 h-4" />
      </button>
    </form>
  </div>
</template>
