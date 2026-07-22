/**
 * Filter logic smoke test (T6 graded behaviour).
 */

import { describe, it, expect } from "vite-plus/test";
import { evaluateFilter } from "../src/runtime/server/filter";
import type { PresencePolicy } from "../src/runtime/server/storage";

const basePolicy: PresencePolicy = {
  rateLimit: { perIpHour: 5, perUserTenMin: 1 },
  filter: {
    strict: true,
    extraHardBlocklist: [],
    extraSoftBlocklist: [],
    extraDenyRegex: [],
  },
};

describe("evaluateFilter", () => {
  it("accepts clean bodies to visible", () => {
    const verdict = evaluateFilter("just a regular note", basePolicy);
    expect(verdict).toEqual({ ok: true, state: "visible" });
  });

  it("hard-rejects items in extraHardBlocklist", () => {
    const policy: PresencePolicy = {
      ...basePolicy,
      filter: { ...basePolicy.filter, extraHardBlocklist: ["forbidden"] },
    };
    const verdict = evaluateFilter("this contains forbidden word", policy);
    expect(verdict).toEqual({ ok: false, reason: "hard" });
  });

  it("sends items in extraSoftBlocklist to pending", () => {
    const policy: PresencePolicy = {
      ...basePolicy,
      filter: { ...basePolicy.filter, extraSoftBlocklist: ["bleep"] },
    };
    const verdict = evaluateFilter("well bleep me", policy);
    expect(verdict).toEqual({ ok: true, state: "pending" });
  });

  it("built-in URL regex sends bare URLs to pending", () => {
    const verdict = evaluateFilter("check out https://spam.example.com", basePolicy);
    expect(verdict).toEqual({ ok: true, state: "pending" });
  });

  it("built-in long-digits regex sends digit runs to pending", () => {
    const verdict = evaluateFilter("call 18005551234567 today", basePolicy);
    expect(verdict).toEqual({ ok: true, state: "pending" });
  });
});
