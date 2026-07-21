import { $fetch, setup } from "@nuxt/test-utils/e2e";
import { describe, expect, it } from "vite-plus/test";
import { fileURLToPath } from "node:url";
import type { StoredSignature } from "../src/server/utils/wallStore";

const MAX = 3;

await setup({
  rootDir: fileURLToPath(new URL("../playground", import.meta.url)),
  server: true,
  nuxtConfig: {
    presence: {
      wall: { server: true, maxSignatures: MAX, ttlSeconds: 60 },
    },
  },
});

type PostResult = { ok: true; signature: StoredSignature } | { error: string };

function post(body: Record<string, unknown>): Promise<PostResult> {
  return $fetch<PostResult>("/api/_presence/wall", {
    method: "POST",
    body,
    ignoreResponseError: true,
  });
}

const sig = (text: string) => ({ text, x: 50, y: 50, rotation: 0, color: "#fff" });

describe("wall API", () => {
  it("rejects malformed signatures", async () => {
    expect(await post({ text: "", x: 50, y: 50 })).toMatchObject({ error: "invalid_signature" });
    expect(await post({ text: "hi", x: "no", y: 50 })).toMatchObject({
      error: "invalid_signature",
    });
    expect(await post({ text: "x".repeat(201), x: 50, y: 50 })).toMatchObject({
      error: "invalid_signature",
    });
  });

  it("stores a signature and returns it from GET", async () => {
    const res = await post(sig("hello"));
    expect(res).toMatchObject({ ok: true });

    const { signatures } = await $fetch<{ signatures: StoredSignature[] }>("/api/_presence/wall");
    expect(signatures.map((s) => s.text)).toContain("hello");
  });

  it("rejects once the wall is full", async () => {
    // one signature already stored by the previous test
    for (let i = 0; i < MAX - 1; i++) {
      expect(await post(sig(`fill-${i}`))).toMatchObject({ ok: true });
    }
    expect(await post(sig("overflow"))).toMatchObject({ error: "wall_full" });
  });
});
