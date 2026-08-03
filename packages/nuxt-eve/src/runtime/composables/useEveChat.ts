import { ref } from "vue";
import type { EveMessage, EveStep } from "../server/engine";

export function useEveChat(agentId: string) {
  const messages = ref<EveMessage[]>([]);
  const input = ref("");
  const isStreaming = ref(false);
  const activeSteps = ref<EveStep[]>([]);
  const conversationId = ref(`conv-${Date.now()}`);

  const sendMessage = async (customPrompt?: string) => {
    const promptText = customPrompt || input.value;
    if (!promptText.trim() || isStreaming.value) return;

    input.value = "";
    isStreaming.value = true;
    activeSteps.value = [];

    const userMessage: EveMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: promptText,
      timestamp: Date.now(),
    };
    messages.value.push(userMessage);

    const assistantMsgId = `msg-${Date.now()}-assistant`;
    const assistantMessage: EveMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };
    messages.value.push(assistantMessage);

    try {
      const url = `/api/_eve/${agentId}/stream?prompt=${encodeURIComponent(promptText)}&conversationId=${encodeURIComponent(conversationId.value)}`;
      const eventSource = new EventSource(url);

      eventSource.addEventListener("step", (e: MessageEvent) => {
        const step: EveStep = JSON.parse(e.data);
        activeSteps.value.push(step);
      });

      eventSource.addEventListener("token", (e: MessageEvent) => {
        const payload = JSON.parse(e.data);
        const targetMsg = messages.value.find((m) => m.id === assistantMsgId);
        if (targetMsg) {
          targetMsg.content += payload.token;
        }
      });

      eventSource.addEventListener("done", () => {
        eventSource.close();
        isStreaming.value = false;
      });

      eventSource.onerror = () => {
        eventSource.close();
        isStreaming.value = false;
      };
    } catch {
      isStreaming.value = false;
    }
  };

  return {
    agentId,
    conversationId,
    messages,
    input,
    isStreaming,
    activeSteps,
    sendMessage,
  };
}
