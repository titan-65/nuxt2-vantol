/**
 * GET /api/_presence/auth/github/callback
 *
 * Verifies the state nonce against the cookie, exchanges the code for an
 * access token, fetches `/user`, then signs the session cookie and redirects
 * home. On any error, falls back to redirecting to `/`.
 */

import {
  createError,
  defineEventHandler,
  deleteCookie,
  getCookie,
  getQuery,
  sendRedirect,
  setCookie,
} from "h3";
import {
  exchangeCodeForToken,
  fetchUser,
} from "../github-client";
import {
  GITHUB_SESSION_COOKIE,
  signGitHubSession,
  userToIdentity,
} from "../session";

const STATE_COOKIE = "presence-github-state";
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days

export default defineEventHandler(async (event) => {
  const q = getQuery(event);
  const code = typeof q.code === "string" ? q.code : undefined;
  const state = typeof q.state === "string" ? q.state : undefined;

  const cookieRaw = getCookie(event, STATE_COOKIE);
  if (!cookieRaw || !code || !state) {
    deleteCookie(event, STATE_COOKIE, { path: "/" });
    return sendRedirect(event, "/", 302);
  }

  let parsedCookie: { state: string; returnTo: string };
  try {
    parsedCookie = JSON.parse(cookieRaw) as { state: string; returnTo: string };
  } catch {
    deleteCookie(event, STATE_COOKIE, { path: "/" });
    return sendRedirect(event, "/", 302);
  }

  if (parsedCookie.state !== state) {
    deleteCookie(event, STATE_COOKIE, { path: "/" });
    return sendRedirect(event, "/", 302);
  }

  const clientId = process.env.NUXT_PRESENCE_GITHUB_CLIENT_ID;
  const clientSecret = process.env.NUXT_PRESENCE_GITHUB_CLIENT_SECRET;
  const callback =
    process.env.NUXT_PRESENCE_GITHUB_CALLBACK_URL ??
    `${getProtoHost(event)}/api/_presence/auth/github/callback`;
  if (!clientId || !clientSecret) {
    throw createError({
      statusCode: 503,
      statusMessage: "GitHub OAuth not configured",
    });
  }

  // Clear state cookie immediately — single use.
  deleteCookie(event, STATE_COOKIE, { path: "/" });

  try {
    const token = await exchangeCodeForToken({
      clientId,
      clientSecret,
      code,
      redirectUri: callback,
    });
    const user = await fetchUser(token.access_token);
    const identity = userToIdentity(user);

    const signed = signGitHubSession({
      identity,
      accessToken: token.access_token,
    });

    setCookie(event, GITHUB_SESSION_COOKIE, signed, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_TTL,
      path: "/",
    });

    return sendRedirect(
      event,
      parsedCookie.returnTo.startsWith("/") ? parsedCookie.returnTo : "/",
      302,
    );
  } catch (error) {
    // ponytail: surface nothing about *which* step failed — only that auth didn't land.
    console.error("[presence-github]", (error as Error).message);
    return sendRedirect(event, "/", 302);
  }
});

function getProtoHost(event: ReturnType<typeof defineEventHandler>): string {
  const proto =
    (event.node.req.headers["x-forwarded-proto"] as string | undefined) ?? "https";
  const host = event.node.req.headers["host"] as string | undefined;
  return `${proto}://${host ?? "localhost"}`;
}
