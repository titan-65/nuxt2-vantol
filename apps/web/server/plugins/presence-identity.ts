/**
 * Presence identity resolver (T1 host-adapter contract).
 *
 * Bridges Better Auth (GitHub) into nuxt-presence: the wall calls
 * `resolveIdentity(event)` and trusts whatever this returns. The GitHub
 * session from Better Auth becomes a `PresenceIdentity` (avatar + handle).
 */

import { defineNitroPlugin } from "nitropack/runtime";
import { auth } from "../utils/auth";
import { setPresenceIdentityResolver } from "nuxt-presence/runtime/server";

export default defineNitroPlugin(() => {
  setPresenceIdentityResolver(async (event) => {
    const session = await auth.api.getSession({ headers: event.headers });
    if (!session?.user) return null;
    const u = session.user as typeof session.user & {
      login?: string;
      image?: string;
    };
    return {
      id: u.id,
      handle: u.login ?? u.email ?? u.name ?? u.id,
      displayName: u.name ?? undefined,
      avatarUrl: u.image,
      url: undefined,
      provider: "github",
    };
  });
});
