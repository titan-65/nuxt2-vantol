// @vitest-environment happy-dom
import { afterEach, describe, it, expect } from "vite-plus/test";
import { mount } from "@vue/test-utils";
import PresenceWall from "../src/runtime/components/PresenceWall.vue";
import {
  resetPresenceWall,
  usePresenceWall,
  type WallHandle,
} from "../src/runtime/composables/usePresenceWall";

describe("<PresenceWall>", () => {
  afterEach(() => {
    resetPresenceWall();
  });

  it("renders nothing when closed", () => {
    const wrapper = mount(PresenceWall, {
      props: { open: false },
    });
    expect(wrapper.find("[data-presence-wall]").exists()).toBe(false);
  });

  it("renders the wall when open", () => {
    const wrapper = mount(PresenceWall, {
      props: { open: true },
    });
    expect(wrapper.find("[data-presence-wall]").exists()).toBe(true);
  });

  it("emits update:open when close is clicked", async () => {
    const wrapper = mount(PresenceWall, {
      props: { open: true },
    });
    await wrapper.find("[data-presence-close]").trigger("click");
    expect(wrapper.emitted("update:open")?.[0]).toEqual([false]);
  });

  it("exposes signatures via the wall composable", () => {
    const wrapper = mount(PresenceWall, {
      props: { open: true },
    });
    const exposed = wrapper.vm.$.exposed as WallHandle | null;
    expect(exposed).not.toBeNull();
    exposed!.add({ text: "hello", x: 50, y: 50 });
    expect(exposed!.signatures.value.length).toBeGreaterThan(0);
  });

  it("opens when the shared wall opens, as the key combo does", async () => {
    const wrapper = mount(PresenceWall, { props: { open: false } });
    expect(wrapper.find("[data-presence-wall]").exists()).toBe(false);

    // What the plugin's combo listener and $presence.open() actually call.
    usePresenceWall().open();
    await wrapper.vm.$nextTick();

    expect(wrapper.find("[data-presence-wall]").exists()).toBe(true);
  });

  it("renders a signature added through the shared wall", async () => {
    const wrapper = mount(PresenceWall, { props: { open: true } });
    usePresenceWall().add({ text: "hello", x: 50, y: 50 });
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".presence-wall__signature").exists()).toBe(true);
  });

  it("opens a caret where the canvas was clicked", async () => {
    const wrapper = mount(PresenceWall, { props: { open: true }, attachTo: document.body });
    expect(wrapper.find("[data-presence-input]").exists()).toBe(false);

    await wrapper.find("[data-presence-canvas]").trigger("click", { clientX: 40, clientY: 30 });

    expect(wrapper.find("[data-presence-input]").exists()).toBe(true);
  });

  it("signs the wall on enter and clears the caret", async () => {
    const wrapper = mount(PresenceWall, { props: { open: true }, attachTo: document.body });
    await wrapper.find("[data-presence-canvas]").trigger("click");

    const input = wrapper.find("[data-presence-input]");
    await input.setValue("vantol was here");
    await input.trigger("keydown.enter");

    expect(usePresenceWall().signatures.value.map((s) => s.text)).toEqual(["vantol was here"]);
    expect(wrapper.find("[data-presence-input]").exists()).toBe(false);
  });

  it("discards the draft on escape", async () => {
    const wrapper = mount(PresenceWall, { props: { open: true }, attachTo: document.body });
    await wrapper.find("[data-presence-canvas]").trigger("click");

    const input = wrapper.find("[data-presence-input]");
    await input.setValue("never mind");
    await input.trigger("keydown.esc");

    expect(usePresenceWall().signatures.value).toEqual([]);
    expect(wrapper.find("[data-presence-input]").exists()).toBe(false);
  });

  it("ignores an empty or whitespace-only signature", async () => {
    const wrapper = mount(PresenceWall, { props: { open: true }, attachTo: document.body });
    await wrapper.find("[data-presence-canvas]").trigger("click");

    const input = wrapper.find("[data-presence-input]");
    await input.setValue("   ");
    await input.trigger("keydown.enter");

    expect(usePresenceWall().signatures.value).toEqual([]);
  });

  it("tells the visitor what to do", async () => {
    const wrapper = mount(PresenceWall, { props: { open: true }, attachTo: document.body });
    expect(wrapper.text()).toContain("click anywhere");

    await wrapper.find("[data-presence-canvas]").trigger("click");
    expect(wrapper.text()).toContain("enter to sign");
  });

  it("renders signatures through the requested renderStyle", async () => {
    const wrapper = mount(PresenceWall, {
      props: { open: true, renderStyle: "monogram" as const },
    });
    (wrapper.vm.$.exposed as WallHandle).add({ text: "hello", x: 50, y: 50 });
    await wrapper.vm.$nextTick();

    const sig = wrapper.find(".presence-wall__signature");
    expect(sig.text()).toBe("H");
    expect(sig.attributes("style")).toContain("Georgia");
  });
});
