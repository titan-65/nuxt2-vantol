<template>
  <div class="nuxt-assistant-wrapper">
    <!-- Floating Launcher Trigger Button -->
    <button
      v-if="!isOpen"
      type="button"
      class="nuxt-assistant-launcher"
      :class="positionClass"
      @click="openAssistant"
      aria-label="Open Nox Assistant"
    >
      <span class="launcher-avatar-wrap">
        <img
          :src="avatarUrl"
          alt="Nox"
          class="launcher-avatar"
          @error="handleAvatarError"
        />
        <span class="online-dot"></span>
      </span>
      <span class="launcher-label font-medium text-sm text-zinc-100 hidden sm:inline">Nox AI</span>
      <span class="shortcut-pill text-xs font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">⌘K</span>
    </button>

    <!-- Modal Drawer Overlay -->
    <div
      v-if="isOpen"
      class="nuxt-assistant-overlay"
      @click.self="closeAssistant"
    >
      <div class="nuxt-assistant-modal" :class="positionClass">
        <!-- Header -->
        <div class="assistant-header border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between bg-zinc-950/80">
          <div class="flex items-center space-x-3">
            <div class="relative">
              <img
                :src="avatarUrl"
                alt="Nox"
                class="w-8 h-8 rounded-full border border-emerald-500/50 object-cover"
                @error="handleAvatarError"
              />
              <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-zinc-950"></span>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h3 class="text-sm font-semibold text-zinc-100 tracking-wide">Nox Assistant</h3>
                <span class="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Nuxt 4</span>
              </div>
              <p class="text-xs text-zinc-400">Portfolio & Technical Guide</p>
            </div>
          </div>

          <div class="flex items-center space-x-1.5">
            <button
              type="button"
              class="icon-btn text-zinc-400 hover:text-zinc-200"
              title="Clear History"
              @click="clearHistory"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
            <button
              type="button"
              class="icon-btn text-zinc-400 hover:text-zinc-200"
              title="Close Assistant (Esc)"
              @click="closeAssistant"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <!-- Chat Scroll Area -->
        <div ref="chatContainer" class="assistant-body flex-1 overflow-y-auto p-4 space-y-4">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="message-row flex space-x-2.5"
            :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'"
          >
            <!-- Assistant Avatar -->
            <img
              v-if="msg.sender === 'assistant'"
              :src="avatarUrl"
              alt="Nox"
              class="w-6 h-6 rounded-full border border-emerald-500/30 object-cover mt-1 flex-shrink-0"
              @error="handleAvatarError"
            />

            <div class="message-content max-w-[85%]">
              <div
                class="message-bubble text-sm px-3.5 py-2.5 rounded-2xl leading-relaxed"
                :class="
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-xs shadow-md font-normal'
                    : 'bg-zinc-800/90 text-zinc-200 border border-zinc-700/60 rounded-bl-xs shadow-sm'
                "
              >
                <div class="whitespace-pre-line" v-html="formatMessage(msg.text)"></div>
              </div>

              <!-- Action Card (if present) -->
              <div v-if="msg.action" class="mt-2">
                <button
                  type="button"
                  class="action-card-btn inline-flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors"
                  @click="handleAction(msg.action)"
                >
                  <span>{{ msg.action.label }}</span>
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>

              <!-- Suggestion Chips -->
              <div v-if="msg.suggestions && msg.suggestions.length > 0" class="mt-2.5 flex flex-wrap gap-1.5">
                <button
                  v-for="(sug, sIdx) in msg.suggestions"
                  :key="sIdx"
                  type="button"
                  class="suggestion-chip text-[11px] px-2.5 py-1 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border border-zinc-700/50 transition-all hover:border-emerald-500/40"
                  @click="submitQuery(sug)"
                >
                  {{ sug }}
                </button>
              </div>
            </div>
          </div>

          <!-- Thinking Indicator -->
          <div v-if="isThinking" class="flex items-center space-x-2 text-zinc-400 text-xs pl-8">
            <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Nox is thinking...</span>
          </div>
        </div>

        <!-- Input Footer -->
        <div class="assistant-footer p-3 border-t border-zinc-800/80 bg-zinc-950/90">
          <form @submit.prevent="handleSend" class="flex items-center space-x-2">
            <input
              ref="inputRef"
              v-model="inputQuery"
              type="text"
              placeholder="Ask Nox about projects, bio, or tutorials..."
              class="flex-1 bg-zinc-900 text-zinc-100 text-sm px-3.5 py-2 rounded-xl border border-zinc-700/60 focus:outline-none focus:border-emerald-500/60 placeholder-zinc-500"
              :disabled="isThinking"
            />
            <button
              type="submit"
              class="send-btn bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl disabled:opacity-50 transition-colors"
              :disabled="!inputQuery.trim() || isThinking"
              aria-label="Send query"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </form>
          <div class="mt-2 flex items-center justify-between text-[10px] text-zinc-500 font-mono px-1">
            <span>Press Enter to send</span>
            <span>⌘K to toggle | Esc to close</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from "vue";
import { useNuxtAssistant } from "../composables/useNuxtAssistant";
import type { AssistantAction } from "../utils/engine";

const { isOpen, isThinking, messages, openAssistant, closeAssistant, sendMessage, clearHistory } = useNuxtAssistant();

const inputQuery = ref("");
const inputRef = ref<HTMLInputElement | null>(null);
const chatContainer = ref<HTMLElement | null>(null);
const avatarUrl = ref("/eve.png");
const runtimeConfig = useRuntimeConfig();
const positionClass = ref(
  (runtimeConfig.public.assistant?.position as string) || "bottom-right",
);

function handleAvatarError() {
  avatarUrl.value = "https://ui-avatars.com/api/?name=Nox+AI&background=059669&color=fff";
}

function formatMessage(text: string): string {
  // Safe simple markdown link & bold converter
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="underline text-emerald-400 hover:text-emerald-300" target="_self">$1</a>');
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
}

watch(messages, () => {
  scrollToBottom();
}, { deep: true });

watch(isOpen, (val) => {
  if (val) {
    scrollToBottom();
    nextTick(() => {
      inputRef.value?.focus();
    });
  }
});

async function handleSend() {
  const query = inputQuery.value;
  if (!query.trim()) return;
  inputQuery.value = "";
  await sendMessage(query);
  scrollToBottom();
}

async function submitQuery(query: string) {
  await sendMessage(query);
  scrollToBottom();
}

function handleAction(action: AssistantAction) {
  if (action.type === "navigate" && action.target) {
    if (typeof window !== "undefined") {
      window.location.href = action.target;
    }
  }
}

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.nuxt-assistant-wrapper {
  font-family: inherit;
}

.nuxt-assistant-launcher {
  position: fixed;
  z-index: 9990;
  bottom: 1.25rem;
  right: 1.25rem;
  display: flex;
  items-center: center;
  gap: 0.5rem;
  padding: 0.5rem 0.85rem;
  background-color: rgba(24, 24, 27, 0.9);
  border: 1px solid rgba(63, 63, 70, 0.7);
  backdrop-filter: blur(12px);
  border-radius: 9999px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(16, 185, 129, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.nuxt-assistant-launcher:hover {
  transform: translateY(-2px);
  border-color: rgba(16, 185, 129, 0.5);
  box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.6), 0 0 20px rgba(16, 185, 129, 0.35);
}

.launcher-avatar-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.launcher-avatar {
  width: 1.65rem;
  height: 1.65rem;
  border-radius: 9999px;
  object-fit: cover;
  border: 1px solid rgba(16, 185, 129, 0.4);
}

.online-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0.45rem;
  height: 0.45rem;
  background-color: #10b981;
  border-radius: 9999px;
  border: 1.5px solid #09090b;
}

.nuxt-assistant-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 1.25rem;
}

.nuxt-assistant-modal {
  width: 100%;
  max-width: 26rem;
  height: 34rem;
  max-height: calc(100vh - 2.5rem);
  background-color: rgba(18, 18, 20, 0.95);
  border: 1px solid rgba(63, 63, 70, 0.8);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modal-slide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modal-slide {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.icon-btn {
  padding: 0.35rem;
  border-radius: 0.375rem;
  transition: background-color 0.15s ease;
}

.icon-btn:hover {
  background-color: rgba(255, 255, 255, 0.08);
}
</style>
