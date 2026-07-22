/**
 * Nitro plugin — registers an identity resolver backed by the GitHub OAuth
 * session cookie. The resolver returns a `PresenceIdentity` for the visitor
 * (or `null` when no session cookie is present).
 *
 * Per **Host-identity adapter contract** (nuxt-presence T1): server-only,
 * called on every wall POST and GET. Browser never asserts identity.
 *
 * Imports `defineNitroPlugin` from `nitropack/runtime` (the runtime export)
 * rather than `#imports` (a Nitro-server virtual) because the module setup
 * path loads this file under Vite in dev, where `#imports` doesn't resolve.
 * `nitropack/runtime` works in both contexts.
 */

import { defineNitroPlugin } from "nitropack/runtime";
import { getCookie } from "h3";
import {
  setPresenceIdentityResolver,
} from "nuxt-presence/runtime/server";
import {
  GITHUB_SESSION_COOKIE,
  parseGitHubSession,
  userToIdentity,
} from "../session";

export default defineNitroPlugin(() => {
  setPresenceIdentityResolver(async (event) => {
    const cookie = getCookie(event, GITHUB_SESSION_COOKIE);
    const session = parseGitHubSession(cookie);
    if (!session) return null;
    return userToIdentity({
      id: Number(session.identity.id),
      login: session.identity.handle,
      name: session.identity.displayName ?? null,
      avatar_url: session.identity.avatarUrl,
      html_url: session.identity.url,
    });
  });
});
