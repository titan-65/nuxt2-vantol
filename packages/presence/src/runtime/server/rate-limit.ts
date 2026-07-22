/**
 * Per **Rate-limit policy** (T7): defaults 5/IP/hour, 1/user/10min.
 *
 * Counters live in the same `PresenceStorage` driver under the dedicated
 * `counters:` prefix — survives restarts, so a hammering attacker can't reset
 * their counter by waiting for a deploy.
 */

import type { H3Event } from "h3";
import { usePresenceStorage } from "./storage";
import { resolveSiteKey } from "./scope";
import { resolveIdentity } from "./identity";

const ONE_HOUR_MS = 3_600_000;
const TEN_MIN_MS = 600_000;

export interface RateLimitResult {
  ok: boolean;
  /** When the bucket will empty. */
  retryAfterMs?: number;
  reason?: "ip" | "user";
}

export async function checkRateLimit(event: H3Event): Promise<RateLimitResult> {
  const storage = usePresenceStorage();
  const siteKey = resolveSiteKey(event);
  const policy = await storage.getPolicy({ siteKey });

  const ip = clientIp(event);
  if (ip) {
    const count = await storage.rateLimitIncr("ip", ip, ONE_HOUR_MS);
    if (count > policy.rateLimit.perIpHour) {
      return { ok: false, reason: "ip", retryAfterMs: ONE_HOUR_MS };
    }
  }

  const ident = await resolveIdentity(event);
  if (ident?.id) {
    const count = await storage.rateLimitIncr("user", ident.id, TEN_MIN_MS);
    if (count > policy.rateLimit.perUserTenMin) {
      return { ok: false, reason: "user", retryAfterMs: TEN_MIN_MS };
    }
  }

  return { ok: true };
}

function clientIp(event: H3Event): string | null {
  const xff = event.node.req.headers["x-forwarded-for"];
  if (typeof xff === "string") return xff.split(",")[0]!.trim();
  const alt = event.node.req.headers["x-real-ip"];
  if (typeof alt === "string") return alt.trim();
  return event.node.req.socket?.remoteAddress ?? null;
}
