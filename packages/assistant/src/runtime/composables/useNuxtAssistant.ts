import { ref, computed } from "vue";
import type { AssistantAction, AssistantResponse } from "../utils/engine";
import { processQuery } from "../utils/engine";

export interface AssistantChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  action?: AssistantAction;
  suggestions?: string[];
}

const isOpen = ref(false);
const isThinking = ref(false);
const messages = ref<AssistantChatMessage[]>([
  {
    id: "welcome-1",
    sender: "assistant",
    text: "Hi! I'm Nox, your personal portfolio & developer assistant. Ask me anything about Vantol's projects, articles, or site navigation!",
    timestamp: new Date().toISOString(),
    suggestions: [
      "Who is Vantol Bennett?",
      "Show me Nuxt tutorials",
      "What projects are featured?",
      "Sign the guestbook",
    ],
  },
]);

export function useNuxtAssistant() {
  function openAssistant() {
    isOpen.value = true;
  }

  function closeAssistant() {
    isOpen.value = false;
  }

  function toggleAssistant() {
    isOpen.value = !isOpen.value;
  }

  function clearHistory() {
    messages.value = [
      {
        id: `welcome-${Date.now()}`,
        sender: "assistant",
        text: "History cleared! Ask me anything about projects, articles, or tutorials.",
        timestamp: new Date().toISOString(),
        suggestions: [
          "Who is Vantol Bennett?",
          "Show me Nuxt tutorials",
          "What projects are featured?",
        ],
      },
    ];
  }

  async function sendMessage(queryText: string): Promise<AssistantResponse> {
    const text = queryText.trim();
    if (!text) {
      return processQuery("");
    }

    // Add user message
    const userMsgId = `user-${Date.now()}`;
    messages.value.push({
      id: userMsgId,
      sender: "user",
      text,
      timestamp: new Date().toISOString(),
    });

    isThinking.value = true;

    try {
      let responseData: AssistantResponse;

      // Check if browser environment has $fetch (Nitro API endpoint)
      if (typeof window !== "undefined" && typeof (window as any).$fetch === "function") {
        try {
          const res = await (window as any).$fetch("/api/_assistant/chat", {
            method: "POST",
            body: { query: text },
          });
          responseData = {
            answer: res.answer,
            action: res.action,
            suggestions: res.suggestions || [],
            matchedPages: res.matchedPages || [],
          };
        } catch {
          responseData = processQuery(text);
        }
      } else {
        responseData = processQuery(text);
      }

      messages.value.push({
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: responseData.answer,
        timestamp: new Date().toISOString(),
        action: responseData.action,
        suggestions: responseData.suggestions,
      });

      return responseData;
    } finally {
      isThinking.value = false;
    }
  }

  return {
    isOpen,
    isThinking,
    messages: computed(() => messages.value),
    openAssistant,
    closeAssistant,
    toggleAssistant,
    sendMessage,
    clearHistory,
  };
}
