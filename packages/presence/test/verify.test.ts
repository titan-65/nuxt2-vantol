import { $fetch, setup } from "@nuxt/test-utils/e2e";
import { describe, expect, it } from "vite-plus/test";
import { fileURLToPath } from "node:url";
import { generateKeypair, signMark, type VerifyResult } from "../src/runtime/utils/crypto";

await setup({
  rootDir: fileURLToPath(new URL("../playground", import.meta.url)),
  server: true,
  nuxtConfig: {
    presence: { mark: { enabled: true, handle: "vantol" } },
  },
});

function verify(body?: Record<string, unknown>): Promise<VerifyResult> {
  return $fetch<VerifyResult>("/api/_presence/verify", {
    method: "POST",
    body: body ?? {},
    ignoreResponseError: true,
  });
}

describe("verify endpoint", () => {
  it("verifies the build's own mark when given no token", async () => {
    const result = await verify();

    expect(result.valid).toBe(true);
    expect(result).toMatchObject({ payload: { handle: "vantol" } });
  });

  it("verifies a token that was served in the page head", async () => {
    const html = await $fetch<string>("/");
    const token = /<meta name="presence-mark" content="([^"]+)"/.exec(html)?.[1];

    expect(await verify({ token })).toMatchObject({ valid: true });
  });

  it("rejects a token signed by someone else's key", async () => {
    const attacker = generateKeypair();
    const token = signMark(
      { handle: "attacker", siteUrl: "https://evil.test", buildSha: "abc", timestamp: 1 },
      attacker.privateKey,
    );

    expect(await verify({ token })).toMatchObject({ valid: false });
  });

  it("rejects a malformed token", async () => {
    expect(await verify({ token: "garbage" })).toMatchObject({
      valid: false,
      reason: "malformed_token",
    });
  });
});
