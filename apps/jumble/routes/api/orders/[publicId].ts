import { defineHandler } from "void";
import { getOrder } from "../../../src/server/orders";

export const GET = defineHandler(async (c) => {
  const order = await getOrder(c.req.param("publicId"));

  if (!order) {
    return c.json({ error: "Order not found." }, 404);
  }

  c.header("Cache-Control", "no-store");
  return order;
});
