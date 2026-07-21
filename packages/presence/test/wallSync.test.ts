import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { createHttpTransport, startPolling, WALL_ENDPOINT } from "../src/runtime/utils/wallSync";
import {
  configureWallTransport,
  resetPresenceWall,
  usePresenceWall,
  type Signature,
} from "../src/runtime/composables/usePresenceWall";

const signature: Signature = {
  id: "abc",
  text: "vantol",
  x: 10,
  y: 20,
  rotation: 5,
  color: "#fff",
  createdAt: 0,
  expiresAt: 0,
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  resetPresenceWall();
});

describe("createHttpTransport", () => {
  it("posts the signature fields the route validates", async () => {
    const fetchMock = vi.fn(async () => new Response("{}"));
    vi.stubGlobal("fetch", fetchMock);

    await createHttpTransport().push(signature);

    const [url, init] = fetchMock.mock.calls[0]! as unknown as [string, RequestInit];
    expect(url).toBe(WALL_ENDPOINT);
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({
      text: "vantol",
      x: 10,
      y: 20,
      rotation: 5,
      color: "#fff",
    });
  });

  it("reads the signature list back", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ signatures: [signature] }))),
    );

    expect(await createHttpTransport().pull()).toEqual([signature]);
  });

  it("returns nothing rather than throwing when the route errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 500 })),
    );

    expect(await createHttpTransport().pull()).toEqual([]);
  });
});

describe("startPolling", () => {
  it("pulls immediately and then on the interval, until stopped", async () => {
    vi.useFakeTimers();
    const pull = vi.fn(async () => [signature]);
    const onSignatures = vi.fn();

    const stop = startPolling({ push: async () => {}, pull }, { intervalMs: 5000, onSignatures });
    await vi.advanceTimersByTimeAsync(0);
    expect(pull).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(10_000);
    expect(pull).toHaveBeenCalledTimes(3);
    expect(onSignatures).toHaveBeenLastCalledWith([signature]);

    stop();
    await vi.advanceTimersByTimeAsync(10_000);
    expect(pull).toHaveBeenCalledTimes(3);
  });

  it("keeps polling after a failed pull", async () => {
    vi.useFakeTimers();
    const pull = vi.fn(async () => {
      throw new Error("offline");
    });

    const stop = startPolling(
      { push: async () => {}, pull },
      { intervalMs: 1000, onSignatures: vi.fn() },
    );
    await vi.advanceTimersByTimeAsync(2500);

    expect(pull.mock.calls.length).toBeGreaterThan(1);
    stop();
  });
});

describe("wall transport wiring", () => {
  it("pushes a locally added signature to the server", async () => {
    const push = vi.fn(async (_signature: Signature) => {});
    configureWallTransport({ push, pull: async () => [] });

    usePresenceWall().add({ text: "hello", x: 50, y: 50 });

    expect(push).toHaveBeenCalledOnce();
    expect(push).toHaveBeenCalledWith(expect.objectContaining({ text: "hello" }));
  });

  it("keeps the signature on screen when the push fails", async () => {
    configureWallTransport({
      push: async () => {
        throw new Error("offline");
      },
      pull: async () => [],
    });

    const wall = usePresenceWall();
    wall.add({ text: "hello", x: 50, y: 50 });

    expect(wall.signatures.value).toHaveLength(1);
  });

  it("lets the server's list replace the local one", () => {
    const wall = usePresenceWall();
    wall.add({ text: "mine", x: 0, y: 0 });

    wall.replace([signature]);

    expect(wall.signatures.value.map((s) => s.text)).toEqual(["vantol"]);
    // Replacing is not signing — the visitor keeps their one turn used.
    expect(wall.hasSigned.value).toBe(true);
  });
});
