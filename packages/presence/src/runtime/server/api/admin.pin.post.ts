/**
 * POST /api/_presence/admin/pin — T12.
 *
 * Body: `{ id: string, pinRank: number, pageKey?: string }`.
 * `pinRank` must be `< pinCap` (T5 — default 5).
 */

import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { useRuntimeConfig } from "nitropack/runtime";
import { usePresenceStorage } from "../storage";
import { resolveScope } from "../scope";
import { requireAdmin, AdminRequiredError } from "../admin";

const DEFAULT_PIN_CAP = 5;

export default defineEventHandler(async (event) => {
  try {
    const storage = usePresenceStorage();
    const body = await readBody<{
      id?: unknown;
      pinRank?: unknown;
      pageKey?: unknown;
    }>(event);

    if (typeof body?.id !== "string") {
      setResponseStatus(event, 400);
      return { error: "invalid_id" };
    }
    if (typeof body.pinRank !== "number" || body.pinRank < 0) {
      setResponseStatus(event, 400);
      return { error: "invalid_pinRank" };
    }

    const presence = useRuntimeConfig(event).presence as {
      wall?: { pinCap?: number };
    };
    const pinCap = presence.wall?.pinCap ?? DEFAULT_PIN_CAP;
    if (body.pinRank >= pinCap) {
      setResponseStatus(event, 422);
      return { error: "pin_cap_exceeded", pinCap };
    }

    let scope;
    try {
      scope = resolveScope(event, body.pageKey);
    } catch {
      setResponseStatus(event, 400);
      return { error: "invalid_page_key" };
    }

    const tokenId = requireAdmin(event);
    const sig = await storage.pin(scope, body.id, body.pinRank);
    await storage.auditAppend({
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      scope,
      action: "pin",
      targetId: body.id,
      adminTokenId: tokenId,
      createdAt: Date.now(),
    });
    return { signature: sig };
  } catch (err) {
    if (err instanceof AdminRequiredError) {
      setResponseStatus(event, 403);
      return { error: "admin_required" };
    }
    throw err;
  }
});
