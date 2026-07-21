import { describe, it, expect } from "vite-plus/test";
import { resolveOptions } from "../src/options";

describe("resolveOptions", () => {
  it("returns defaults when given empty input", () => {
    const opts = resolveOptions({});
    expect(opts.enabled).toBe(true);
    expect(opts.wall.enabled).toBe(true);
    expect(opts.wall.server).toBe(false);
    expect(opts.wall.ttlSeconds).toBe(3600);
    expect(opts.wall.maxSignatures).toBe(50);
    expect(opts.wall.combo).toEqual(["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown"]);
    expect(opts.wall.mobilePath).toBe("/presence");
    expect(opts.wall.renderStyle).toBe("cursive");
    expect(opts.mark.enabled).toBe(true);
    expect(opts.mark.handle).toBe("");
    expect(opts.mark.keyDir).toBe(".presence/");
  });

  it("respects user overrides", () => {
    const opts = resolveOptions({
      enabled: false,
      wall: { server: true, ttlSeconds: 60 },
    });
    expect(opts.enabled).toBe(false);
    expect(opts.wall.server).toBe(true);
    expect(opts.wall.ttlSeconds).toBe(60);
    expect(opts.wall.maxSignatures).toBe(50);
  });
});
