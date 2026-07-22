/**
 * HMAC-signed session cookie for GitHub OAuth. Same shape as the demo identity
 * cookie but holds the GitHub access token plus the resolved identity + the
 * followers/following snapshots (cached).
 *
 * `presence-session` cookie body = base64url(JSON) + "." + sha256-hmac.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import type { GitHubUser } from "./github-client";

export interface GitHubSession {
  identity: {
    id: string;
    handle: string;
    displayName?: string;
    avatarUrl: string;
    url: string;
    provider: "github";
  };
  /** Stored alongside the identity for social-pull (when enabled). */
  accessToken: string;
  /** ISO-8601 ms when the social-pull cache was last refreshed. */
  connectionsFetchedAt?: number;
  /** Cached follower/following IDs (login names). Cached for 5 min. */
  followerLogins?: string[];
  followingLogins?: string[];
}

export const GITHUB_SESSION_COOKIE = "presence-session";
const SECRET = () =>
  process.env.NUXT_PRESENCE_SESSION_SECRET ?? "presence-dev-session-secret";

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function signGitHubSession(session: GitHubSession): string {
  const secret = SECRET();
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString(
    "base64url",
  );
  return `${payload}.${sign(payload, secret)}`;
}

export function parseGitHubSession(
  cookie: string | undefined,
): GitHubSession | null {
  if (!cookie) return null;
  const dot = cookie.lastIndexOf(".");
  if (dot <= 0 || dot >= cookie.length - 1) return null;

  const secret = SECRET();
  const payload = cookie.slice(0, dot);
  const sigHex = cookie.slice(dot + 1);
  const expectedHex = sign(payload, secret);

  const a = Buffer.from(sigHex, "hex");
  const b = Buffer.from(expectedHex, "hex");
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Partial<GitHubSession>;
    if (
      !parsed.identity ||
      typeof parsed.identity.id !== "string" ||
      typeof parsed.identity.handle !== "string"
    ) {
      return null;
    }
    if (typeof parsed.accessToken !== "string") return null;
    return parsed as GitHubSession;
  } catch {
    return null;
  }
}

export function userToIdentity(user: GitHubUser) {
  return {
    id: String(user.id),
    handle: user.login,
    displayName: user.name ?? undefined,
    avatarUrl: user.avatar_url,
    url: user.html_url,
    provider: "github" as const,
  };
}
