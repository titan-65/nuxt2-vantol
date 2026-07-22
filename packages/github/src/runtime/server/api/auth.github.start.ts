/**
 * GET /api/_presence/auth/github/start
 *
 * Stores a one-shot state nonce + the visitor's return URL in a short-lived
 * cookie, then redirects to GitHub's authorize endpoint with `read:user` scope.
 */

import { defineEventHandler, getRequestHeader, sendRedirect, setCookie } from "h3";
import { createHash, randomBytes } from "node:crypto";
import { getQuery } from "h3";

const STATE_COOKIE = "presence-github-state";
const STATE_TTL = 60 * 10; // 10 min — long enough for any reasonable auth round-trip

export default defineEventHandler((event) => {
  const clientId = process.env.NUXT_PRESENCE_GITHUB_CLIENT_ID;
  if (!clientId) {
    return new Response(
      "GitHub OAuth not configured — set NUXT_PRESENCE_GITHUB_CLIENT_ID",
      { status: 503 },
    );
  }

  const callback =
    process.env.NUXT_PRESENCE_GITHUB_CALLBACK_URL ??
    `${getRequestHeader(event, "x-forwarded-proto") ?? "https"}://${getRequestHeader(event, "host")}/api/_presence/auth/github/callback`;

  const nonce = randomBytes(16).toString("hex");
  const state = `${nonce}.${createHash("sha256").update(nonce).digest("hex").slice(0, 8)}`;

  const query = getQuery(event);
  const returnTo =
    typeof query.returnTo === "string" && query.returnTo.startsWith("/")
      ? query.returnTo
      : "/";

  setCookie(event, STATE_COOKIE, JSON.stringify({ state, returnTo }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: STATE_TTL,
    path: "/",
  });

  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", callback);
  authorize.searchParams.set("scope", "read:user");
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("allow_signup", "true");

  return sendRedirect(event, authorize.toString(), 302);
});
