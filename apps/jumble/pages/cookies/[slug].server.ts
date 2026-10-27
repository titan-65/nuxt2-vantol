import { defineHandler, type InferProps } from "void";
import { BOX_SIZES } from "../../src/boxes";
import { CURRENT_STAGE } from "../../src/stages";
import { getActiveMenu } from "../../src/server/menu";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async (c) => {
  const slug = c.req.param("slug");
  const embed = c.req.query("embed") === "1";
  const menu = await getActiveMenu();
  const flavor = menu.flavors.find((item) => item.slug === slug) ?? null;

  return {
    stage: CURRENT_STAGE,
    embed,
    week: menu.week,
    flavor,
    boxes: BOX_SIZES,
    backHref: embed ? "/menu?embed=1" : "/menu",
  };
});
