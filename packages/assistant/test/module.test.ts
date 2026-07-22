import { describe, expect, it } from "vitest";
import module from "../src/module";
import { defaults } from "../src/options";

describe("nuxt-assistant module definition", () => {
  it("exports a valid Nuxt module function", () => {
    expect(typeof module).toBe("function");
  });

  it("has default options configured in src/options.ts", () => {
    expect(defaults).toBeDefined();
    expect(defaults.enabled).toBe(true);
    expect(defaults.autoMount).toBe(true);
    expect(defaults.persona.name).toBe("Nox");
    expect(defaults.server.enabled).toBe(true);
  });
});
