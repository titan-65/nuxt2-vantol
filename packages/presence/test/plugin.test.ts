// @vitest-environment happy-dom
import { afterEach, describe, it, expect, vi } from "vite-plus/test";
import { createPresencePlugin, verifyMarkInPage } from "../src/runtime/plugins/presence.client";

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
    expect(window.$presence?.verify).toBeInstanceOf(Function);

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

describe("verifyMarkInPage", () => {
  afterEach(() => {
    document.head.innerHTML = "";
    vi.unstubAllGlobals();
  });

  function stampMark(token: string) {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "presence-mark");
    meta.setAttribute("content", token);
    document.head.appendChild(meta);
  }

  it("reports no_mark when the page carries none", async () => {
    expect(await verifyMarkInPage()).toEqual({ valid: false, reason: "no_mark" });
  });

  it("sends the page's mark to the verify endpoint", async () => {
    stampMark("payload.signature");
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ valid: true })));
    vi.stubGlobal("fetch", fetchMock);

    expect(await verifyMarkInPage()).toEqual({ valid: true });

    const [url, init] = fetchMock.mock.calls[0]! as unknown as [string, RequestInit];
    expect(url).toBe("/api/_presence/verify");
    expect(JSON.parse(String(init.body))).toEqual({ token: "payload.signature" });
  });

  it("reports a reason instead of throwing when the request fails", async () => {
    stampMark("payload.signature");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      }),
    );

    expect(await verifyMarkInPage()).toEqual({ valid: false, reason: "offline" });
  });
});
