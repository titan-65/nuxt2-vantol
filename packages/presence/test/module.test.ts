import { describe, it, expect } from "vite-plus/test";
import { setup, $fetch } from "@nuxt/test-utils/e2e";
import { fileURLToPath } from "node:url";

await setup({
  rootDir: fileURLToPath(new URL("../playground", import.meta.url)),
  server: true,
});

describe("@vantol/presence", () => {
  it("installs without errors", async () => {
    const html = await $fetch("/");
    expect(html).toBeDefined();
  });
});
