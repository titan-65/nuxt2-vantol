import { describe, it, expect } from "vite-plus/test";
import { setup, $fetch } from "@nuxt/test-utils/e2e";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { verifyMark } from "../src/runtime/utils/crypto";

await setup({
  rootDir: fileURLToPath(new URL("../playground", import.meta.url)),
  server: true,
  // server: true is required so $fetch('/') has a base URL. With server: false, $fetch throws "Failed to parse URL from /".
});

describe("@vantol/presence", () => {
  it("installs without errors", async () => {
    const html = await $fetch("/");
    expect(html).toBeDefined();
  });

  it("stamps a mark into the page head that verifies against the public key", async () => {
    const html = await $fetch<string>("/");
    const token = /<meta name="presence-mark" content="([^"]+)"/.exec(html)?.[1];
    expect(token).toBeTruthy();

    const publicKey = readFileSync(
      fileURLToPath(new URL("../playground/.presence/public.pem", import.meta.url)),
      "utf8",
    );
    expect(verifyMark(token!, publicKey).valid).toBe(true);
  });
});
