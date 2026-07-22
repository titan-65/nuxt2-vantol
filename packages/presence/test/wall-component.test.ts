/**
 * V1 `<PresenceWall>` smoke tests — the rendered wall shows cards (avatar + handle
 * + body) and signs via the composable when a transport is configured.
 */

// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vite-plus/test";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import PresenceWall from "../src/runtime/components/PresenceWall.vue";
import {
  configureWallTransport,
  resetPresenceWall,
  usePresenceWall,
  type WallTransport,
} from "../src/runtime/composables/usePresenceWall";
import type { PresenceSignature } from "../src/runtime/server/storage";

function fakeTransport(): WallTransport {
  const stored: PresenceSignature[] = [];
  return {
    async push(input) {
      const sig: PresenceSignature = {
        id: `sig-${stored.length + 1}`,
        author: { id: "u1", handle: input.body.slice(0, 16) || "anon" },
        siteKey: "host:test",
        body: input.body,
        createdAt: new Date().toISOString(),
        state: "visible",
        reportCount: 0,
      };
      stored.push(sig);
      return sig;
    },
    async pull() {
      return { signatures: [...stored] };
    },
    async admin() {
      return { ok: true };
    },
  };
}

describe("<PresenceWall> (V1)", () => {
  beforeEach(() => {
    resetPresenceWall();
  });

  it("renders the form and an empty list before any signatures", async () => {
    configureWallTransport(fakeTransport());
    const wrapper = mount(PresenceWall, { props: { open: true } });
    await nextTick();

    expect(wrapper.find("[data-presence-form]").exists()).toBe(true);
    expect(wrapper.findAll(".presence-card").length).toBe(0);
  });

  it("renders cards once a signature is pushed through the transport", async () => {
    configureWallTransport(fakeTransport());
    const wrapper = mount(PresenceWall, { props: { open: true } });
    await nextTick();

    const wall = usePresenceWall();
    await wall.add({ body: "hello world" });
    await nextTick();

    expect(wrapper.findAll(".presence-card").length).toBe(1);
    expect(wrapper.find(".presence-card__text").text()).toContain("hello world");
  });
});
