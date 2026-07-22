/**
 * Per **Wall data model + scope key** (T5) and **Page-key scoping rules** (T14).
 *
 * Pure helpers (validatePageKey, adminTokenId) live in `./scope-key.ts` so unit
 * tests don't drag the Nitro runtime virtual modules in.
 */

import type { H3Event } from "h3";
import type { PresenceScope } from "./storage";
import { validatePageKey } from "./scope-key";

export { validatePageKey, PageKeyError, adminTokenId } from "./scope-key";

interface RuntimeConfigSnapshot {
  presence?: { wall?: { siteKey?: string; siteKeyFallback?: string } };
  public?: { siteUrl?: string; siteURL?: string };
}

/**
 * Derives the host's `siteKey`. Override beats URL host beats dev fallback.
 * Throws in production when none can be resolved (T5 §2 — never silently
 * collapse every visitor into one global bucket).
 */
export function resolveSiteKey(event: H3Event): string {
  const cfg = resolveRuntimeConfig(event);
  const wall = cfg.presence?.wall ?? {};

  if (typeof wall.siteKey === "string" && wall.siteKey.length > 0) {
    return `host:${sanitize(wall.siteKey)}`;
  }

  const siteUrl = cfg.public?.siteUrl ?? cfg.public?.siteURL;
  const host = siteUrl ? parseHost(siteUrl) : null;
  if (host) return `host:${host}`;

  if (typeof wall.siteKeyFallback === "string" && wall.siteKeyFallback.length > 0) {
    return `host:${wall.siteKeyFallback}`;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "presence: siteKey could not be derived — set presence.wall.siteKey or runtimeConfig.public.siteUrl",
    );
  }
  return "host:dev";
}

function parseHost(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

function sanitize(value: string): string {
  return value.replaceAll("/", "_").replaceAll(":", "_");
}

export function resolveScope(event: H3Event, pageKey?: unknown): PresenceScope {
  return {
    siteKey: resolveSiteKey(event),
    pageKey: pageKey ? validatePageKey(pageKey) : undefined,
  };
}

/**
 * ponytail: read `useRuntimeConfig` from globalThis rather than
 * `import { useRuntimeConfig } from "nitropack/runtime"`. The latter pulls a
 * virtual module (`#nitro-internal-virtual/storage`) that crashes test boot.
 */
function resolveRuntimeConfig(event: H3Event): RuntimeConfigSnapshot {
  const fn = (globalThis as { useRuntimeConfig?: (event: H3Event) => unknown }).useRuntimeConfig;
  if (fn) return fn(event) as RuntimeConfigSnapshot;
  return {};
}
