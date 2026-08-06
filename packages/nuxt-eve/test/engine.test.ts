import { describe, it, expect } from "vite-plus/test";
import { runEveAgent, getEveHistory } from "../src/runtime/server/engine";

describe("Eve Runtime Engine", () => {
  it("runs an Eve agent and returns structured result with steps", async () => {
    const stepsReceived: any[] = [];
    const tokensReceived: string[] = [];

    const result = await runEveAgent({
      agentId: "researcher",
      prompt: "Search the database for latest updates",
      onStep: (step) => stepsReceived.push(step),
      onToken: (token) => tokensReceived.push(token),
    });

    expect(result.agentId).toBe("researcher");
    expect(result.conversationId).toBeDefined();
    expect(result.output).toContain("researcher");
    expect(result.steps.length).toBeGreaterThan(0);
    expect(stepsReceived.length).toBe(result.steps.length);
    expect(tokensReceived.length).toBeGreaterThan(0);
  });

  it("persists and retrieves conversation history correctly", async () => {
    const convId = `test-conv-${Date.now()}`;
    const initialHistory = await getEveHistory(convId);
    expect(initialHistory).toEqual([]);

    await runEveAgent({
      agentId: "concierge",
      prompt: "Hello concierge",
      conversationId: convId,
    });

    const updatedHistory = await getEveHistory(convId);
    expect(updatedHistory.length).toBe(2);
    expect(updatedHistory[0].role).toBe("user");
    expect(updatedHistory[1].role).toBe("assistant");
  });
});
