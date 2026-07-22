/**
 * POST /api/_presence/wall/report — T10 (Report endpoint shape).
 *
 * Body: `{ id: string, reason: "spam"|"abuse"|"harassment"|"other", pageKey?: string }`.
 * Reporter key: signed-in identity.id, else `HMAC-SHA256(secret, ip)` (T3 §10).
 * Already-reported pairs are deduped at the storage layer; `reportCount` increments
 * only on a fresh report.
 */

import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { usePresenceStorage } from "../storage";
import { resolveScope } from "../scope";
import { resolveIdentity, reporterKey } from "../identity";

const REASONS = ["spam", "abuse", "harassment", "other"] as const;
const REPORT_SECRET = process.env.NUXT_PRESENCE_REPORT_SECRET ?? "presence-dev-report-secret";

export default defineEventHandler(async (event) => {
  const storage = usePresenceStorage();
  const body = await readBody<{
    id?: unknown;
    reason?: unknown;
    pageKey?: unknown;
  }>(event);

  if (typeof body?.id !== "string") {
    setResponseStatus(event, 400);
    return { error: "invalid_id" };
  }
  const reason = REASONS.find((r) => r === body.reason);
  if (!reason) {
    setResponseStatus(event, 400);
    return { error: "invalid_reason" };
  }

  let scope;
  try {
    scope = resolveScope(event, body.pageKey);
  } catch {
    setResponseStatus(event, 400);
    return { error: "invalid_page_key" };
  }

  const existing = await storage.getById(scope, body.id);
  if (!existing) {
    setResponseStatus(event, 404);
    return { error: "not_found" };
  }

  const identity = await resolveIdentity(event);
  let rk = identity?.id ?? reporterKey(event, REPORT_SECRET);
  if (!rk) {
    setResponseStatus(event, 400);
    return { error: "cannot_report_anonymously" };
  }

  if (await storage.hasReported(body.id, rk)) {
    return { ok: true, dedup: true };
  }

  await storage.reportAppend({
    signatureId: body.id,
    reporterKey: rk,
    reason,
    createdAt: Date.now(),
  });
  await storage.incrementReportCount(scope, body.id);
  return { ok: true };
});
