import { defineHandler, type InferProps } from "void";
import { CURRENT_STAGE } from "../../src/stages";
import { getOrder } from "../../src/server/orders";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async (c) => {
  const order = await getOrder(c.req.param("publicId"));

  return {
    stage: CURRENT_STAGE,
    embed: false,
    order,
    backHref: "/menu",
  };
});
