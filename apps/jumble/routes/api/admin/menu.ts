import { defineHandler } from "void";
import { z } from "zod";
import { isAdmin } from "../../../src/server/admin";
import { setFlavorActive } from "../../../src/server/menu";

const menuSchema = z.object({
  flavorId: z.number().int().positive(),
  active: z.boolean(),
});

export const POST = defineHandler(async (c) => {
  if (!(await isAdmin(c))) {
    return c.json({ error: "Admin session required." }, 401);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid menu payload." }, 400);
  }

  const parsed = menuSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid menu payload." }, 400);
  }

  const updated = await setFlavorActive(parsed.data.flavorId, parsed.data.active);
  if (!updated) {
    return c.json({ error: "There is no active menu week." }, 409);
  }

  return { ok: true };
});
