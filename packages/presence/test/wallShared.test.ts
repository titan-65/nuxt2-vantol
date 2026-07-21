import { $fetch, setup, url } from "@nuxt/test-utils/e2e";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { fileURLToPath } from "node:url";
import {
  configureWallTransport,
  resetPresenceWall,
  usePresenceWall,
} from "../src/runtime/composables/usePresenceWall";
import { createHttpTransport, startPolling } from "../src/runtime/utils/wallSync";

await setup({
  rootDir: fileURLToPath(new URL("../playground", import.meta.url)),
  server: true,
  nuxtConfig: {
    presence: { wall: { server: true, ttlSeconds: 60, maxSignatures: 10 } },
  },
});

/** Points the browser-side transport at the test server, which relative URLs cannot reach. */
function transportToTestServer() {
  return createHttpTransport(url("/api/_presence/wall"));
}

afterEach(() => {
  resetPresenceWall();
});

describe("shared wall", () => {
  it("sends a locally signed mark to the server", async () => {
    configureWallTransport(transportToTestServer());
    usePresenceWall().add({ text: "visitor-one", x: 25, y: 40 });

    // The POST is fire-and-forget, so let it land.
    await new Promise((resolve) => setTimeout(resolve, 100));

    const { signatures } = await $fetch<{ signatures: { text: string }[] }>("/api/_presence/wall");
    expect(signatures.map((s) => s.text)).toContain("visitor-one");
  });

  it("shows another visitor's signature after a poll", async () => {
    // Someone else signs — a different browser entirely.
    await $fetch("/api/_presence/wall", {
      method: "POST",
      body: { text: "visitor-two", x: 60, y: 60 },
    });

    const wall = usePresenceWall();
    expect(wall.signatures.value).toEqual([]);

    const stop = startPolling(transportToTestServer(), {
      intervalMs: 50,
      onSignatures: wall.replace,
    });
    await new Promise((resolve) => setTimeout(resolve, 200));
    stop();

    expect(wall.signatures.value.map((s) => s.text)).toContain("visitor-two");
  });
});
