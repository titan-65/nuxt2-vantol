/**
 * Per **Admin token resolution + client flag-passing** (T11):
 *
 *   - Server-side constant-time check via `crypto.timingSafeEqual`.
 *   - Client never sees the token; admin tab renders only when the SSR boolean
 *     `useRuntimeConfig().public.presence.isAdmin` is true.
 *   - Missing env var → admin endpoints fail closed (`403 admin_required`).
 */

import { timingSafeEqual } from "node:crypto";
import type { H3Event } from "h3";
import { adminTokenId } from "./scope";

export const ADMIN_TOKEN_HEADER = "x-presence-admin";

export class AdminRequiredError extends Error {
  statusCode = 403;
  constructor() {
    super("admin_required");
    this.name = "AdminRequiredError";
  }
}

export function adminTokenSupplied(event: H3Event): string | null {
  const raw = event.node.req.headers[ADMIN_TOKEN_HEADER];
  return typeof raw === "string" ? raw : null;
}

/** Throws `AdminRequiredError` (status 403) when the request is not authorized. */
export function requireAdmin(event: H3Event): string {
  const env = process.env.NUXT_PRESENCE_ADMIN_TOKEN;
  if (!env) throw new AdminRequiredError();

  const supplied = adminTokenSupplied(event);
  if (!supplied) throw new AdminRequiredError();

  // ponytail: timingSafeEqual requires equal-length buffers. Length-mismatch
  // would reveal nothing useful anyway, so we bail before the compare.
  const a = Buffer.from(supplied);
  const b = Buffer.from(env);
  if (a.length !== b.length) throw new AdminRequiredError();
  if (!timingSafeEqual(a, b)) throw new AdminRequiredError();

  return adminTokenId(supplied);
}

/** Server-side boolean rendered into `useRuntimeConfig().public.presence.isAdmin`. */
export function isAdminEnvSet(): boolean {
  return !!process.env.NUXT_PRESENCE_ADMIN_TOKEN;
}
