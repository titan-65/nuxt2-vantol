import { describe, it, expect } from "vite-plus/test";
import { setup, $fetch } from "@nuxt/test-utils/e2e";
import { fileURLToPath } from "node:url";

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
});
