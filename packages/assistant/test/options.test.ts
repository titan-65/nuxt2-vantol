import { describe, expect, it } from "vitest";
import { defaults, resolveOptions } from "../src/options";

describe("options resolution", () => {
  it("uses default options when no input is provided", () => {
    const resolved = resolveOptions();
    expect(resolved.enabled).toBe(true);
    expect(resolved.autoMount).toBe(true);
    expect(resolved.shortcut).toContain("Cmd+K");
    expect(resolved.persona.name).toBe("Nox");
    expect(resolved.server.enabled).toBe(true);
  });

  it("deeply merges user overrides into defaults", () => {
    const resolved = resolveOptions({
      position: "bottom-left",
      persona: {
        name: "CustomNox",
      },
      server: {
        apiKey: "sk-test-key",
      },
    });

    expect(resolved.position).toBe("bottom-left");
    expect(resolved.persona.name).toBe("CustomNox");
    expect(resolved.persona.title).toBe(defaults.persona.title); // preserved
    expect(resolved.server.apiKey).toBe("sk-test-key");
    expect(resolved.server.enabled).toBe(true);
  });
});
