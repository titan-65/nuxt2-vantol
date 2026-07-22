/**
 * Connections cache + lookup helpers (T2 §Social-pull endpoints).
 *
 * Cache TTL = 5 min. Sliding refresh on each wall pull. Returns the visitor's
 * follower + following login sets; the wall uses these to render connection
 * badges against signers.
 */

import {
  fetchFollowers,
  fetchFollowing,
} from "./github-client";
import type { GitHubSession } from "./session";

const FIVE_MIN_MS = 5 * 60_000;

export async function withConnections(
  session: GitHubSession,
): Promise<GitHubSession> {
  if (
    session.connectionsFetchedAt &&
    Date.now() - session.connectionsFetchedAt < FIVE_MIN_MS
  ) {
    return session;
  }

  try {
    const [followers, following] = await Promise.all([
      fetchFollowers(session.accessToken),
      fetchFollowing(session.accessToken),
    ]);
    return {
      ...session,
      followerLogins: followers.map((u) => u.login),
      followingLogins: following.map((u) => u.login),
      connectionsFetchedAt: Date.now(),
    };
  } catch {
    // Rate-limit / network — keep serving what we have, just no refresh.
    return session;
  }
}

const EMPTY: Pick<
  GitHubSession,
  "followerLogins" | "followingLogins"
> = { followerLogins: [], followingLogins: [] };

export function relationToSigner(
  session: GitHubSession | null,
  signerHandle: string,
): "mutual" | "follows-you" | "you-follow" | null {
  if (!session) return null;
  const lower = signerHandle.toLowerCase();
  const followerLogins = session.followerLogins ?? EMPTY.followerLogins ?? [];
  const followingLogins = session.followingLogins ?? EMPTY.followingLogins ?? [];
  const followsYou = followerLogins.includes(lower);
  const youFollow = followingLogins.includes(lower);
  if (followsYou && youFollow) return "mutual";
  if (followsYou) return "follows-you";
  if (youFollow) return "you-follow";
  return null;
}
