/**
 * Session helpers for the `/presence-demo` page.
 *
 * - `identity` is the resolved `PresenceIdentity` (from Better Auth's
 *   GitHub session via nuxt-presence) or null.
 * - `signInWithGitHub` redirects to GitHub through Better Auth.
 * - `signOut` clears the Better Auth session.
 */

import type { PresenceIdentity } from "nuxt-presence/runtime/server/storage";
import { authClient } from "../../utils/auth-client";

export const usePresenceDemoIdentity = () => {
  const identity = useState<PresenceIdentity | null>(
    "presence-demo-identity",
    () => null,
  );

  async function refresh() {
    try {
      const res = await $fetch<{
        identity: PresenceIdentity | null;
      }>("/api/presence-demo/identity", { method: "GET" });
      identity.value = res.identity ?? null;
    } catch {
      identity.value = null;
    }
  }

  function signInWithGitHub(returnTo: string) {
    authClient.signIn.social({ provider: "github", callbackURL: returnTo });
  }

  async function signOut() {
    await authClient.signOut().catch(() => {});
    identity.value = null;
  }

  return { identity, refresh, signInWithGitHub, signOut };
};
