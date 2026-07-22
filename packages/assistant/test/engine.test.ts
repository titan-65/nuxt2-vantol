import { describe, expect, it } from "vitest";
import { processQuery } from "../src/runtime/utils/engine";

describe("query processing engine", () => {
  it("returns default prompt for empty queries", () => {
    const res = processQuery("");
    expect(res.answer).toContain("How can I help you today?");
    expect(res.suggestions.length).toBeGreaterThan(0);
  });

  it("handles bio and experience queries", () => {
    const res = processQuery("Who is Vantol Bennett?");
    expect(res.answer).toContain("Vantol Bennett");
    expect(res.action?.target).toBe("/about");
    expect(res.matchedPages[0]?.path).toBe("/about");
  });

  it("handles tech stack queries", () => {
    const res = processQuery("What skills and tech stack does Vantol use?");
    expect(res.answer).toContain("Vue 3");
    expect(res.answer).toContain("Nuxt 4");
    expect(res.action?.target).toBe("/about");
  });

  it("handles project queries", () => {
    const res = processQuery("Show me open source projects");
    expect(res.answer).toContain("null-agent");
    expect(res.action?.target).toBe("/projects");
  });

  it("handles tutorial queries", () => {
    const res = processQuery("Are there Nuxt module tutorials?");
    expect(res.answer).toContain("Nuxt Modules Tutorial Series");
    expect(res.action?.target).toBe("/learn");
  });

  it("handles guestbook queries", () => {
    const res = processQuery("How do I sign the guestbook?");
    expect(res.answer).toContain("Guestbook");
    expect(res.action?.target).toBe("/guestbook");
  });

  it("provides fallback response for unmatched queries", () => {
    const res = processQuery("xyz123randomnonexistentquery");
    expect(res.answer).toContain("couldn't find an exact match");
    expect(res.suggestions.length).toBeGreaterThan(0);
  });
});
