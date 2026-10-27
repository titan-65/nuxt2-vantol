import { defineHandler } from "void";
import { z } from "zod";
import { isAdmin } from "../../../../src/server/admin";
import { updateOrderStatus } from "../../../../src/server/orders";
import { isOrderStatus } from "../../../../src/orders";

const statusSchema = z.object({
  status: z.string().refine(isOrderStatus),
});

export const PATCH = defineHandler(async (c) => {
  if (!(await isAdmin(c))) {
    return c.json({ error: "Admin session required." }, 401);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid status." }, 400);
  }

  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid status." }, 400);
  }

  const order = await updateOrderStatus(c.req.param("publicId"), parsed.data.status);
  if (!order) {
    return c.json({ error: "Order not found." }, 404);
  }

  c.header("Cache-Control", "no-store");
  return order;
});
