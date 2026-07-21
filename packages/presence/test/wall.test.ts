import { describe, it, expect, afterEach, beforeEach } from "vite-plus/test";
import {
  createWall,
  resetPresenceWall,
  usePresenceWall,
} from "../src/runtime/composables/usePresenceWall";

describe("usePresenceWall", () => {
  afterEach(() => {
    resetPresenceWall();
  });

  it("hands every caller the same wall", () => {
    // The plugin owns the combo and $presence.sign(); the component owns the
    // rendering. Separate instances mean the combo opens a wall nobody draws.
    expect(usePresenceWall()).toBe(usePresenceWall());
  });

  it("shows one caller's signature to another", () => {
    usePresenceWall().add({ text: "hello", x: 50, y: 50 });

    expect(usePresenceWall().signatures.value.map((s) => s.text)).toEqual(["hello"]);
  });
});

describe("createWall", () => {
  let wall: ReturnType<typeof createWall>;

  beforeEach(() => {
    wall = createWall();
  });

  it("starts empty and closed", () => {
    expect(wall.signatures.value).toEqual([]);
    expect(wall.isOpen.value).toBe(false);
  });

  it("opens and closes", () => {
    wall.open();
    expect(wall.isOpen.value).toBe(true);
    wall.close();
    expect(wall.isOpen.value).toBe(false);
  });

  it("adds a signature", () => {
    wall.add({ text: "hello", x: 50, y: 50 });
    expect(wall.signatures.value).toHaveLength(1);
    expect(wall.signatures.value[0]!.text).toBe("hello");
  });

  it("clears signatures", () => {
    wall.add({ text: "a", x: 0, y: 0 });
    wall.add({ text: "b", x: 0, y: 0 });
    wall.clear();
    expect(wall.signatures.value).toEqual([]);
  });

  it("generates unique ids", () => {
    wall.add({ text: "a", x: 0, y: 0 });
    wall.add({ text: "b", x: 0, y: 0 });
    const ids = wall.signatures.value.map((s) => s.id);
    expect(new Set(ids).size).toBe(2);
  });
});
