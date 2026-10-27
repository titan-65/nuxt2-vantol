import { defineHandler, type InferProps } from "void";
import { CURRENT_STAGE } from "../src/stages";
import { getPickupLocations } from "../src/server/pickup";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async () => {
  const locations = await getPickupLocations();

  return {
    stage: CURRENT_STAGE,
    embed: false,
    locations,
    cartToken: null,
    backHref: "/menu",
  };
});
