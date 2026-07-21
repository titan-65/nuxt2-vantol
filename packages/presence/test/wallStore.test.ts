import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createWallStore, type StoredSignature } from "../src/server/utils/wallStore";

type SignatureInput = Omit<StoredSignature, "id" | "createdAt" | "expiresAt">;

const input = (text: string): SignatureInput => ({
  text,
  x: 50,
  y: 50,
  rotation: 0,
  color: "#fff",
});

describe("createWallStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("adds and retrieves signatures", () => {
    const store = createWallStore({ ttlSeconds: 60, maxSignatures: 10 });
    store.add(input("hello"));

    expect(store.list()).toHaveLength(1);
    expect(store.list()[0]!.text).toBe("hello");
  });

  it("stamps id, createdAt and expiresAt", () => {
    const store = createWallStore({ ttlSeconds: 60, maxSignatures: 10 });
    const sig = store.add(input("hello"));

    expect(sig.id).toBeTruthy();
    expect(sig.expiresAt - sig.createdAt).toBe(60_000);
  });

  it("evicts expired signatures on list", () => {
    const store = createWallStore({ ttlSeconds: 60, maxSignatures: 10 });
    store.add(input("old"));
    vi.advanceTimersByTime(61_000);

    expect(store.list()).toEqual([]);
  });

  it("keeps unexpired signatures when older ones age out", () => {
    const store = createWallStore({ ttlSeconds: 60, maxSignatures: 10 });
    store.add(input("old"));
    vi.advanceTimersByTime(40_000);
    store.add(input("new"));
    vi.advanceTimersByTime(30_000);

    expect(store.list().map((s) => s.text)).toEqual(["new"]);
  });

  it("caps at maxSignatures and evicts oldest", () => {
    const store = createWallStore({ ttlSeconds: 3600, maxSignatures: 2 });
    store.add(input("a"));
    store.add(input("b"));
    store.add(input("c"));

    expect(store.list().map((s) => s.text)).toEqual(["b", "c"]);
  });

  it("clears everything", () => {
    const store = createWallStore({ ttlSeconds: 3600, maxSignatures: 10 });
    store.add(input("a"));
    store.clear();

    expect(store.list()).toEqual([]);
  });
});
