/**
 * GET /api/_presence/wall — T9 (Wall GET handler shape).
 *
 * Query: `pageKey?, cursor?, limit?, includePending?`.
 * `includePending=true` is honored only when the request authenticates as admin;
 * non-admin GET responses strip pending entries.
 */

import { defineEventHandler, getQuery, setResponseStatus } from "h3";
import { usePresenceStorage } from "../storage";
import { resolveScope } from "../scope";
import { requireAdmin, AdminRequiredError } from "../admin";

export default defineEventHandler(async (event) => {
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

  let includePending = false;
  if (q.includePending === "true" || q.includePending === "1") {
    try {
      requireAdmin(event);
      includePending = true;
    } catch (err) {
      // ponytail: a non-admin asking for pending strips the flag silently. Telling
      // the caller they lack access leaks signal about whether pending entries exist.
      if (!(err instanceof AdminRequiredError)) throw err;
      includePending = false;
    }
  }

  const cursor = typeof q.cursor === "string" ? q.cursor : undefined;
  const limit = typeof q.limit === "string" ? Number.parseInt(q.limit, 10) : undefined;

  const page = await storage.list({ ...scope, includePending, cursor, limit });
  return { signatures: page.items, nextCursor: page.nextCursor };
});
