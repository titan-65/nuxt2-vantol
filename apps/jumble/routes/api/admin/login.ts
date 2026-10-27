import { defineHandler } from "void";
import { env } from "void/env";
import { z } from "zod";
import { ADMIN_COOKIE, ADMIN_SESSION_TTL_SECONDS, createAdminSession } from "../../../src/server/admin";

const loginSchema = z.object({
  password: z.string().min(1).max(200),
});

export const POST = defineHandler(async (c) => {
  let body: unknown;

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Enter the admin password." }, 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success || parsed.data.password !== env.ADMIN_PASSWORD) {
    return c.json({ error: "That password is not right." }, 401);
  }

  const token = await createAdminSession();
  const secure = import.meta.env.PROD ? "; Secure" : "";
  const cookie = `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ADMIN_SESSION_TTL_SECONDS}${secure}`;

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "content-type": "application/json",
      "set-cookie": cookie,
    },
  });
});
