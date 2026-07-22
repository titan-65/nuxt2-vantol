/**
 * POST /api/_presence/admin/delete — T12.
 *
 * Body: `{ id: string, pageKey?: string }`. Removes a signature entirely.
 */

import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { usePresenceStorage } from "../storage";
import { resolveScope } from "../scope";
import { requireAdmin, AdminRequiredError } from "../admin";

export default defineEventHandler(async (event) => {
  try {
    const storage = usePresenceStorage();
    const body = await readBody<{ id?: unknown; pageKey?: unknown }>(event);
    if (typeof body?.id !== "string") {
      setResponseStatus(event, 400);
      return { error: "invalid_id" };
    }
    let scope;
    try {
      scope = resolveScope(event, body.pageKey);
    } catch {
      setResponseStatus(event, 400);
      return { error: "invalid_page_key" };
    }
    const tokenId = requireAdmin(event);
    await storage.delete(scope, body.id);
    await storage.auditAppend({
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      scope,
      action: "delete",
      targetId: body.id,
      adminTokenId: tokenId,
      createdAt: Date.now(),
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof AdminRequiredError) {
      setResponseStatus(event, 403);
      return { error: "admin_required" };
    }
    throw err;
  }
});
