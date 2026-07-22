/**
 * POST /api/_presence/wall — T8 (Wall POST handler shape).
 *
 * Body: `{ body: string, pageKey?: string, renderHint?: "default"|"compact"|"signature" }`
 *   - `body` is the signed message (trimmed of leading/trailing whitespace).
 *   - `pageKey` is host-supplied via `<PresenceWall page-key>`; absent = global wall.
 *   - `renderHint` is a layout directive per T5.
 *
 * Identity is taken from the registered resolver (T1) — never from the body.
 * Hard-trips return `422 filtered`; soft-trips append with `state: "pending"`.
 * Rate-limit hits return `429` with `Retry-After`.
 */

import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { useRuntimeConfig } from "nitropack/runtime";
import { usePresenceStorage } from "../storage";
import { resolveScope } from "../scope";
import { resolveIdentity } from "../identity";
import { evaluateFilter } from "../filter";
import { checkRateLimit } from "../rate-limit";

const DEFAULT_BODY_LIMIT = 240;

type RenderHint = "default" | "compact" | "signature";
const RENDER_HINTS: readonly RenderHint[] = ["default", "compact", "signature"];

export default defineEventHandler(async (event) => {
  const storage = usePresenceStorage();
  const body = await readBody<{
    body?: unknown;
    pageKey?: unknown;
    renderHint?: unknown;
  }>(event);

  if (typeof body?.body !== "string" || body.body.trim().length === 0) {
    setResponseStatus(event, 400);
    return { error: "invalid_body" };
  }

  const presence = useRuntimeConfig(event).presence as {
    wall?: { bodyLimit?: number };
  };
  const maxLen = presence.wall?.bodyLimit ?? DEFAULT_BODY_LIMIT;
  if (body.body.length > maxLen) {
    setResponseStatus(event, 422);
    return { error: "body_too_long", maxLength: maxLen };
  }

  let scope;
  try {
    scope = resolveScope(event, body.pageKey);
  } catch {
    setResponseStatus(event, 400);
    return { error: "invalid_page_key" };
  }

  const rate = await checkRateLimit(event);
  if (!rate.ok) {
    setResponseStatus(event, 429);
    event.node.res.setHeader(
      "Retry-After",
      String(Math.ceil((rate.retryAfterMs ?? 3_600_000) / 1000)),
    );
    return { error: "rate_limited", reason: rate.reason };
  }

  const author = await resolveIdentity(event);
  const policy = await storage.getPolicy(scope);
  const verdict = evaluateFilter(body.body, policy);

  if (!verdict.ok) {
    setResponseStatus(event, 422);
    return { error: "filtered", reason: verdict.reason };
  }

  const renderHint = RENDER_HINTS.find((h) => h === body.renderHint);

  const sig = await storage.append({
    author: author ?? { id: "anon", handle: "anonymous" },
    siteKey: scope.siteKey,
    pageKey: scope.pageKey,
    body: body.body,
    ...(renderHint ? { renderHint } : {}),
    state: verdict.state,
  });

  return { signature: sig };
});
