import { defineHandler, type InferProps } from "void";
import { BOX_SIZES, type BoxSize } from "../../src/boxes";
import type { OrderView } from "../../src/orders";
import type { PickupLocationView } from "../../src/pickup";
import { CURRENT_STAGE, LIVE_STAGE, STAGE_COUNT } from "../../src/stages";
import { seedDemoCart } from "../../src/server/cart";
import { getActiveMenu, type MenuFlavor, type MenuWeek } from "../../src/server/menu";
import { ensureDemoOrder } from "../../src/server/orders";
import { getPickupLocations } from "../../src/server/pickup";

type PreviewProps = {
  stage: number;
  embed: boolean;
  week: MenuWeek | null;
  flavors: MenuFlavor[];
  flavor: MenuFlavor | null;
  boxes: BoxSize[];
  backHref: string;
  locations: PickupLocationView[];
  cartToken: string | null;
  order: OrderView | null;
};

const DEMO_CART_TOKEN = "00000000-0000-4000-8000-000000000005";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async (c): Promise<PreviewProps> => {
  const raw = Number(c.req.param("stage"));
  const stage = Number.isFinite(raw)
    ? Math.min(Math.max(Math.trunc(raw), 1), STAGE_COUNT)
    : CURRENT_STAGE;

  if (stage === LIVE_STAGE) {
    return {
      stage,
      embed: true,
      week: null,
      flavors: [],
      flavor: null,
      boxes: BOX_SIZES,
      backHref: "/preview/1",
      locations: [],
      cartToken: null,
      order: null,
    };
  }

  const menu = await getActiveMenu();

  if (stage === 2) {
    return {
      stage,
      embed: true,
      ...menu,
      flavor: null,
      boxes: BOX_SIZES,
      backHref: "/preview/1",
      locations: [],
      cartToken: null,
      order: null,
    };
  }

  if (stage === 3 || stage === 4) {
    return {
      stage,
      embed: true,
      ...menu,
      flavor: menu.flavors[0] ?? null,
      boxes: BOX_SIZES,
      backHref: "/preview/2",
      locations: [],
      cartToken: null,
      order: null,
    };
  }

  if (stage === 5) {
    const locations = await getPickupLocations();
    await seedDemoCart(DEMO_CART_TOKEN);

    return {
      stage,
      embed: true,
      ...menu,
      flavor: menu.flavors[0] ?? null,
      boxes: BOX_SIZES,
      backHref: "/preview/4",
      locations,
      cartToken: DEMO_CART_TOKEN,
      order: null,
    };
  }

  if (stage === 6) {
    const order = await ensureDemoOrder();

    return {
      stage,
      embed: true,
      ...menu,
      flavor: menu.flavors[0] ?? null,
      boxes: BOX_SIZES,
      backHref: "/preview/5",
      locations: [],
      cartToken: null,
      order,
    };
  }

  if (stage === 8) {
    return {
      stage,
      embed: true,
      ...menu,
      flavor: menu.flavors[0] ?? null,
      boxes: BOX_SIZES,
      backHref: "/preview/7",
      locations: [],
      cartToken: null,
      order: null,
    };
  }

  return {
    stage,
    embed: true,
    ...menu,
    flavor: menu.flavors[0] ?? null,
    boxes: BOX_SIZES,
    backHref: "/preview/2",
    locations: [],
    cartToken: null,
    order: null,
  };
});
