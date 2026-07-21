// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vite-plus/test";
import { createPresencePlugin } from "../src/runtime/plugins/presence.client";

describe("presence plugin", () => {
  it("listens for the combo and toggles open", () => {
    const wall = { open: vi.fn(), close: vi.fn(), add: vi.fn() };
    const teardown = createPresencePlugin({
      combo: ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown"],
      mobilePath: "/presence",
      wall,
    });

    // Simulate the combo
    const events = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown"];
    for (const key of events) {
      window.dispatchEvent(new KeyboardEvent("keydown", { key }));
    }
    expect(wall.open).toHaveBeenCalled();

    teardown();
  });

  it("exposes window.$presence", () => {
    const wall = { open: vi.fn(), close: vi.fn(), add: vi.fn() };
    const teardown = createPresencePlugin({
      combo: ["ArrowUp"],
      mobilePath: "/presence",
      wall,
    });

    expect(window.$presence).toBeDefined();
    expect(window.$presence?.open).toBeInstanceOf(Function);
    expect(window.$presence?.close).toBeInstanceOf(Function);
    expect(window.$presence?.sign).toBeInstanceOf(Function);

    window.$presence?.open();
    expect(wall.open).toHaveBeenCalled();

    window.$presence?.close();
    expect(wall.close).toHaveBeenCalled();

    teardown();
  });

  it("respects custom combo", () => {
    const wall = { open: vi.fn(), close: vi.fn(), add: vi.fn() };
    const teardown = createPresencePlugin({
      combo: ["KeyK", "KeyK"],
      mobilePath: "/presence",
      wall,
    });

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", code: "KeyK" }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", code: "KeyK" }));
    expect(wall.open).toHaveBeenCalled();

    teardown();
  });
});
