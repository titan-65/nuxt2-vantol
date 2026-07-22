/**
 * Pure page-key validation (T5 + T14). Split from `scope.ts` so unit tests
 * can import this without dragging Nitro's runtime virtual modules.
 */

import { createHash } from "node:crypto";

const PAGE_KEY_RE = /^[a-zA-Z0-9/_:.-]{1,128}$/;

export class PageKeyError extends Error {
  constructor(public readonly input: unknown) {
    super(`Invalid page-key: must match ${PAGE_KEY_RE.source}; got ${describe(input)}`);
    this.name = "PageKeyError";
  }
}

function describe(input: unknown): string {
  return typeof input === "string" ? JSON.stringify(input) : typeof input;
}

/** 1–128 chars, `[a-zA-Z0-9/_:.-]`, no leading `/`. Empty string rejected. */
export function validatePageKey(value: unknown): string {
  if (typeof value !== "string" || !PAGE_KEY_RE.test(value)) {
    throw new PageKeyError(value);
  }
  if (value.startsWith("/")) throw new PageKeyError(value);
  return value;
}

/**
 * Audit-stamped admin ID: first 8 hex chars of `sha256(token)`. Never the token.
 */
export function adminTokenId(token: string): string {
  return createHash("sha256").update(token).digest("hex").slice(0, 8);
}
