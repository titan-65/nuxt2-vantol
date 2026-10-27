import { defineHandler, type InferProps } from "void";
import { CURRENT_STAGE } from "../src/stages";
import { getActiveMenu } from "../src/server/menu";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async () => {
  const menu = await getActiveMenu();
  return {
    stage: CURRENT_STAGE,
    embed: false,
    ...menu,
  };
});
