import { defineHandler, type InferProps } from "void";
import type { AdminFlavor } from "../src/admin";
import type { OrderSummary } from "../src/orders";
import { CURRENT_STAGE } from "../src/stages";
import { isAdmin } from "../src/server/admin";
import { getAdminMenu } from "../src/server/menu";
import { listOrders } from "../src/server/orders";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async (c) => {
  const authorized = await isAdmin(c);

  if (!authorized) {
    return {
      stage: CURRENT_STAGE,
      embed: false,
      authorized: false,
      orders: [] as OrderSummary[],
      flavors: [] as AdminFlavor[],
      weekLabel: null as string | null,
    };
  }

  const [orders, menu] = await Promise.all([listOrders(), getAdminMenu()]);

  return {
    stage: CURRENT_STAGE,
    embed: false,
    authorized: true,
    orders,
    flavors: menu.flavors,
    weekLabel: menu.week?.label ?? null,
  };
});
