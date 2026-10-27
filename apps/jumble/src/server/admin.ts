import { getCookie } from "hono/cookie";
import type { Context } from "hono";
import { kv } from "void/kv";
import { isCartToken } from "../cart";

export const ADMIN_COOKIE = "jumble_admin";
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12;

const sessions = kv.map<{ createdAt: string }>("admin-sessions");

export async function createAdminSession(): Promise<string> {
  const token = crypto.randomUUID();
  await sessions.put(
    token,
    { createdAt: new Date().toISOString() },
    { ttl: ADMIN_SESSION_TTL_SECONDS },
  );
  return token;
}

export async function adminToken(c: Context): Promise<string | null> {
  const token = getCookie(c, ADMIN_COOKIE);
  if (!isCartToken(token)) return null;

  const session = await sessions.get(token);
  return session ? token : null;
}

export async function isAdmin(c: Context): Promise<boolean> {
  return Boolean(await adminToken(c));
}

export async function destroyAdminSession(token: string): Promise<void> {
  await sessions.delete(token);
}
