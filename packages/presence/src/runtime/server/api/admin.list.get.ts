/**
 * GET /api/_presence/admin/list — admin-only listing that includes pending entries
 * and recent audit entries. Used by the admin tab.
 */

import { defineEventHandler, getQuery, setResponseStatus } from "h3";
import { usePresenceStorage } from "../storage";
import { resolveScope } from "../scope";
import { requireAdmin, AdminRequiredError } from "../admin";

export default defineEventHandler(async (event) => {
  try {
    const storage = usePresenceStorage();
    const q = getQuery(event);
    const pageKey = typeof q.pageKey === "string" ? q.pageKey : undefined;

    let scope;
    try {
      scope = resolveScope(event, pageKey);
    } catch {
      setResponseStatus(event, 400);
      return { error: "invalid_page_key" };
    }

    requireAdmin(event);

    const [sigs, audit] = await Promise.all([
      storage.list({ ...scope, includePending: true, limit: 100 }),
      storage.auditList({ ...scope, limit: 50 }),
    ]);

    return { signatures: sigs.items, audit: audit.items };
  } catch (err) {
    if (err instanceof AdminRequiredError) {
      setResponseStatus(event, 403);
      return { error: "admin_required" };
    }
    throw err;
  }
});
