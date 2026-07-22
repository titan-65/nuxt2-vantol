/**
 * POST /api/_presence/auth/github/signout — clear the GitHub session cookie.
 */

import { defineEventHandler, deleteCookie } from "h3";
import { GITHUB_SESSION_COOKIE } from "../session";

export default defineEventHandler((event) => {
  deleteCookie(event, GITHUB_SESSION_COOKIE, { path: "/" });
  return { ok: true };
});
