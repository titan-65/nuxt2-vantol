/**
 * GET /api/presence-demo/identity — return the current resolved identity
 * (from the GitHub session cookie) or null.
 */

import { defineEventHandler } from "h3";
import { resolveIdentity } from "nuxt-presence/runtime/server";

export default defineEventHandler(async (event) => {
  const identity = await resolveIdentity(event);
  return { identity };
});
