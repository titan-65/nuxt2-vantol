import { createStorage } from "unstorage";
import memoryDriver from "unstorage/drivers/memory";

export interface EveMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    args: Record<string, unknown>;
    result?: unknown;
  }>;
  timestamp: number;
}

export interface EveStep {
  index: number;
  action: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
  toolOutput?: unknown;
  thought?: string;
  timestamp: number;
}

export interface EveRunOptions {
  agentId: string;
  prompt: string;
  conversationId?: string;
  model?: string;
  context?: Record<string, unknown>;
  onStep?: (step: EveStep) => void;
  onToken?: (token: string) => void;
}

export interface EveRunResult {
  agentId: string;
  conversationId: string;
  output: string;
  steps: EveStep[];
  history: EveMessage[];
}

const storage = createStorage({
  driver: memoryDriver(),
});

/**
 * Gets conversation history for a given conversation ID
 */
export async function getEveHistory(conversationId: string): Promise<EveMessage[]> {
  const history = await storage.getItem<EveMessage[]>(`history:${conversationId}`);
  return history || [];
}

/**
 * Saves conversation history for a given conversation ID
 */
export async function saveEveHistory(conversationId: string, history: EveMessage[]): Promise<void> {
  await storage.setItem(`history:${conversationId}`, history);
}

/**
 * Executes an Eve Agent run with multi-turn support, step tracking, and streaming callbacks
 */
export async function runEveAgent(options: EveRunOptions): Promise<EveRunResult> {
  const conversationId =
    options.conversationId || `conv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const history = await getEveHistory(conversationId);

  const steps: EveStep[] = [];

  // Add user message
  const userMsg: EveMessage = {
    id: `msg-${Date.now()}-user`,
    role: "user",
    content: options.prompt,
    timestamp: Date.now(),
  };
  history.push(userMsg);

  // Step 1: Initial analysis
  const step1: EveStep = {
    index: 1,
    action: "Analyzing user request & context",
    thought: `Processing prompt: "${options.prompt}" for agent [${options.agentId}]`,
    timestamp: Date.now(),
  };
  steps.push(step1);
  options.onStep?.(step1);

  // Step 2: Simulated Tool Check / Execution
  let toolCallResult: unknown = null;
  if (
    options.prompt.toLowerCase().includes("search") ||
    options.prompt.toLowerCase().includes("weather") ||
    options.prompt.toLowerCase().includes("data")
  ) {
    const step2: EveStep = {
      index: 2,
      action: "Executing tool lookup",
      toolName: "knowledgeQuery",
      toolInput: { query: options.prompt },
      toolOutput: { status: "success", matches: 3, context: "Eve agent workspace active" },
      timestamp: Date.now(),
    };
    steps.push(step2);
    options.onStep?.(step2);
    toolCallResult = step2.toolOutput;
  }

  // Step 3: Stream response tokens
  const responseText = `[Eve Agent: ${options.agentId}] Processing completed for: "${options.prompt}". ${toolCallResult ? " (Retrieved knowledge context)." : ""}`;

  const chunks = responseText.split(" ");
  for (const chunk of chunks) {
    options.onToken?.(chunk + " ");
    await new Promise((resolve) => setTimeout(resolve, 30));
  }

  const assistantMsg: EveMessage = {
    id: `msg-${Date.now()}-assistant`,
    role: "assistant",
    content: responseText,
    timestamp: Date.now(),
  };
  history.push(assistantMsg);

  await saveEveHistory(conversationId, history);

  return {
    agentId: options.agentId,
    conversationId,
    output: responseText,
    steps,
    history,
  };
}
