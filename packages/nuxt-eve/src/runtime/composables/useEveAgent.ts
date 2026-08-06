import { ref } from "vue";
import type { EveStep, EveRunResult } from "../server/engine";

export interface UseEveAgentOptions {
  conversationId?: string;
  context?: Record<string, unknown>;
}

export function useEveAgent(agentId: string, defaultOptions?: UseEveAgentOptions) {
  const isThinking = ref(false);
  const currentStep = ref<EveStep | null>(null);
  const steps = ref<EveStep[]>([]);
  const error = ref<string | null>(null);
  const lastResult = ref<EveRunResult | null>(null);

  const run = async (prompt: string, overrideOptions?: UseEveAgentOptions) => {
    isThinking.value = true;
    error.value = null;
    currentStep.value = null;
    steps.value = [];

    const convId = overrideOptions?.conversationId || defaultOptions?.conversationId;

    try {
      const response = await fetch(`/api/_eve/${agentId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          conversationId: convId,
          context: overrideOptions?.context || defaultOptions?.context,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.message || "Eve Agent execution failed");
      }

      lastResult.value = data.data;
      steps.value = data.data.steps || [];
      if (steps.value.length > 0) {
        currentStep.value = steps.value[steps.value.length - 1];
      }

      return data.data;
    } catch (e: any) {
      error.value = e.message || "Unknown error occurred";
      throw e;
    } finally {
      isThinking.value = false;
    }
  };

  return {
    agentId,
    isThinking,
    currentStep,
    steps,
    error,
    lastResult,
    run,
  };
}
