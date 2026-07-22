// @vitest-environment happy-dom
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { createAssistantPlugin } from "../src/runtime/plugins/assistant.client";
import { useNuxtAssistant } from "../src/runtime/composables/useNuxtAssistant";

describe("assistant client plugin & console API", () => {
  let cleanup: (() => void) | undefined;
  const assistant = useNuxtAssistant();

  beforeEach(() => {
    assistant.closeAssistant();
    cleanup = createAssistantPlugin({
      shortcut: ["Cmd+K", "Ctrl+K"],
      autoMount: false,
    });
  });

  afterEach(() => {
    cleanup?.();
  });

  it("attaches $assistant to window console API", () => {
    expect(window.$assistant).toBeDefined();
    expect(typeof window.$assistant?.open).toBe("function");
    expect(typeof window.$assistant?.close).toBe("function");
    expect(typeof window.$assistant?.ask).toBe("function");
  });

  it("opens and closes assistant via $assistant console API", () => {
    window.$assistant?.open();
    expect(assistant.isOpen.value).toBe(true);

    window.$assistant?.close();
    expect(assistant.isOpen.value).toBe(false);

    window.$assistant?.toggle();
    expect(assistant.isOpen.value).toBe(true);
  });

  it("toggles assistant on Cmd+K keydown event", () => {
    expect(assistant.isOpen.value).toBe(false);

    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    });
    window.dispatchEvent(event);

    expect(assistant.isOpen.value).toBe(true);
  });
});
