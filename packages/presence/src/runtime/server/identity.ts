/**
 * Per **Host-identity adapter contract** (T1): host app provides an identity
 * resolver via `setPresenceIdentityResolver()`. Wall routes call
 * `resolveIdentity(event)` and trust the result.
 *
 * The companion `@nuxt-presence/github` package installs a Nitro plugin that
 * sets the resolver; with no resolver registered, `resolveIdentity` returns
 * `null` (anonymous) — the wall stays open but signatures have no avatar/handle.
 */

import type { H3Event } from "h3";
import type { PresenceIdentity } from "./storage";

export type IdentityResolver = (
  event: H3Event,
) => Promise<PresenceIdentity | null> | PresenceIdentity | null;

let resolver: IdentityResolver | undefined;

export function setPresenceIdentityResolver(next: IdentityResolver): void {
  resolver = next;
}

export function getPresenceIdentityResolver(): IdentityResolver | undefined {
  return resolver;
}

export async function resolveIdentity(event: H3Event): Promise<PresenceIdentity | null> {
  if (!resolver) return null;
  try {
    return await resolver(event);
  } catch {
    // ponytail: a broken resolver must not take down signing — falls through to anonymous.
    return null;
  }
}

/**
 * Salted IP hash for anon reporters. Per T3 §10 Q4 — never stores the raw IP,
 * admins only see the hash, dedup is by hash, per-IP rate-limit caps spam.
 */
export function reporterKey(event: H3Event, secret: string): string | null {
  const ip = clientIp(event);
  if (!ip) return null;
  return createHmac("sha256", secret).update(ip).digest("hex").slice(0, 16);
}

function clientIp(event: H3Event): string | null {
  const xff = event.node.req.headers["x-forwarded-for"];
  if (typeof xff === "string") return xff.split(",")[0]!.trim();
  const alt = event.node.req.headers["x-real-ip"];
  if (typeof alt === "string") return alt.trim();
  return event.node.req.socket?.remoteAddress ?? null;
}

import { createHmac } from "node:crypto";
