/**
 * Per **Strict filter module** (T6): graded filter.
 *
 *   - Hard blocklist → 422, never stored.
 *   - Soft blocklist  → stored with `state: "pending"`, surfaced via admin only.
 *   - Built-in regex  → soft pending (spam shapes); hosts can override with
 *                        `extraDenyRegex` (still soft by default).
 *
 * The package ships with empty built-in blocklists — concrete terms are a
 * policy decision the host owns. Hosts populate via `presence.wall.policy.filter.*`.
 */

import type { PresencePolicy } from "./storage";

export type FilterVerdict =
  | { ok: true; state: "visible" }
  | { ok: true; state: "pending" }
  | { ok: false; reason: "hard" };

// ponytail: regex over shapes, not literal slurs — covers unambiguous spam.
const BUILTIN_REGEX: readonly RegExp[] = [
  /\b\d{10,}\b/, // long digit runs (phone numbers, repeated digits)
  /https?:\/\/\S+/i, // bare URLs anywhere in the body
];

export function evaluateFilter(body: string, policy: PresencePolicy): FilterVerdict {
  const lower = body.toLowerCase();

  // Hard — blocklist (built-in or extended).
  for (const term of policy.filter.extraHardBlocklist) {
    if (term && lower.includes(term.toLowerCase())) {
      return { ok: false, reason: "hard" };
    }
  }

  // Soft — blocklist (built-in or extended).
  for (const term of policy.filter.extraSoftBlocklist) {
    if (term && lower.includes(term.toLowerCase())) {
      return { ok: true, state: "pending" };
    }
  }

  // Regex — soft pending (built-in shapes always land in pending).
  for (const pattern of policy.filter.extraDenyRegex) {
    if (pattern.test(body)) return { ok: true, state: "pending" };
  }
  for (const pattern of BUILTIN_REGEX) {
    if (pattern.test(body)) return { ok: true, state: "pending" };
  }

  return { ok: true, state: "visible" };
}
