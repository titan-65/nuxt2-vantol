import { describe, expect, it } from "vitest";
import { useNuxtAssistant } from "../src/runtime/composables/useNuxtAssistant";

describe("useNuxtAssistant composable", () => {
  it("manages open and closed assistant state", () => {
    const assistant = useNuxtAssistant();
    expect(assistant.isOpen.value).toBe(false);

    assistant.openAssistant();
    expect(assistant.isOpen.value).toBe(true);

    assistant.closeAssistant();
    expect(assistant.isOpen.value).toBe(false);

    assistant.toggleAssistant();
    expect(assistant.isOpen.value).toBe(true);
    assistant.toggleAssistant();
    expect(assistant.isOpen.value).toBe(false);
  });

  it("sends user message and appends assistant response", async () => {
    const assistant = useNuxtAssistant();
    const initialLength = assistant.messages.value.length;

    const res = await assistant.sendMessage("Tell me about Vantol");
    expect(res.answer).toContain("Vantol Bennett");

    expect(assistant.messages.value.length).toBe(initialLength + 2);
    const lastUserMsg = assistant.messages.value[assistant.messages.value.length - 2];
    const lastAssistantMsg = assistant.messages.value[assistant.messages.value.length - 1];

    expect(lastUserMsg?.sender).toBe("user");
    expect(lastUserMsg?.text).toBe("Tell me about Vantol");
    expect(lastAssistantMsg?.sender).toBe("assistant");
  });

  it("clears message history", () => {
    const assistant = useNuxtAssistant();
    assistant.clearHistory();
    expect(assistant.messages.value.length).toBe(1);
    expect(assistant.messages.value[0]?.text).toContain("History cleared");
  });
});
