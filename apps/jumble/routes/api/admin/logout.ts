import { defineHandler } from "void";
import { ADMIN_COOKIE, adminToken, destroyAdminSession } from "../../../src/server/admin";

export const POST = defineHandler(async (c) => {
  const token = await adminToken(c);

  if (token) {
    await destroyAdminSession(token);
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "content-type": "application/json",
      "set-cookie": `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    },
  });
});
