import { defineHandler } from "void";
import { z } from "zod";
import { BOX_SIZES } from "../../src/boxes";
import {
  buildCartView,
  CART_HEADER,
  CART_MAX_ITEMS,
  CART_MAX_QUANTITY,
  emptyCartView,
  isCartToken,
  type CartRecord,
} from "../../src/cart";
import { readCart, writeCart } from "../../src/server/cart";
import { getActiveMenu, type ActiveMenu } from "../../src/server/menu";

const addSchema = z.object({
  slug: z.string().min(1).max(120),
  size: z.number().int().positive(),
  quantity: z.number().int().min(1).max(CART_MAX_QUANTITY).default(1),
});

const updateSchema = z.object({
  slug: z.string().min(1).max(120),
  size: z.number().int().positive(),
  quantity: z.number().int().min(1).max(CART_MAX_QUANTITY),
});

const removeSchema = z.object({
  slug: z.string().min(1).max(120),
  size: z.number().int().positive(),
});

type HandlerContext = {
  req: {
    header: (name: string) => string | undefined;
    json: () => Promise<unknown>;
  };
};

function cartToken(c: HandlerContext): string | null {
  const token = c.req.header(CART_HEADER);
  return isCartToken(token) ? token : null;
}

async function readBody<T>(
  read: () => Promise<unknown>,
  schema: z.ZodType<T>,
): Promise<T | null> {
  try {
    const parsed = schema.safeParse(await read());
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

async function present(token: string, record: CartRecord, menu: ActiveMenu) {
  const { view, pruned } = buildCartView(record, menu.flavors, BOX_SIZES);

  if (pruned.lines.length !== record.lines.length) {
    await writeCart(token, pruned);
  }

  return view;
}

export const GET = defineHandler(async (c) => {
  const token = cartToken(c);
  if (!token) return emptyCartView();

  const menu = await getActiveMenu();
  return present(token, await readCart(token), menu);
});

export const POST = defineHandler(async (c) => {
  const token = cartToken(c);
  if (!token) return c.json({ error: "Start a cart session first." }, 400);

  const body = await readBody(() => c.req.json(), addSchema);
  if (!body) return c.json({ error: "Invalid cart item." }, 400);

  const menu = await getActiveMenu();
  const flavor = menu.flavors.find((item) => item.slug === body.slug);
  const box = BOX_SIZES.find((item) => item.size === body.size);

  if (!flavor || !box) {
    return c.json({ error: "That cookie or box is not on this week's menu." }, 409);
  }

  const record = await readCart(token);
  const line = record.lines.find(
    (item) => item.slug === flavor.slug && item.size === box.size,
  );

  if (line) {
    line.quantity = Math.min(line.quantity + body.quantity, CART_MAX_QUANTITY);
  } else {
    if (record.lines.length >= CART_MAX_ITEMS) {
      return c.json({ error: "Your box is full. Remove a line to add another." }, 409);
    }
    record.lines.push({ slug: flavor.slug, size: box.size, quantity: body.quantity });
  }

  await writeCart(token, record);
  return present(token, record, menu);
});

export const PATCH = defineHandler(async (c) => {
  const token = cartToken(c);
  if (!token) return c.json({ error: "Start a cart session first." }, 400);

  const body = await readBody(() => c.req.json(), updateSchema);
  if (!body) return c.json({ error: "Invalid cart item." }, 400);

  const record = await readCart(token);
  const line = record.lines.find(
    (item) => item.slug === body.slug && item.size === body.size,
  );

  if (!line) return c.json({ error: "That box is not in your cart." }, 404);

  line.quantity = body.quantity;
  await writeCart(token, record);

  const menu = await getActiveMenu();
  return present(token, record, menu);
});

export const DELETE = defineHandler(async (c) => {
  const token = cartToken(c);
  if (!token) return c.json({ error: "Start a cart session first." }, 400);

  const body = await readBody(() => c.req.json(), removeSchema);
  if (!body) return c.json({ error: "Invalid cart item." }, 400);

  const record = await readCart(token);
  record.lines = record.lines.filter(
    (item) => item.slug !== body.slug || item.size !== body.size,
  );

  await writeCart(token, record);

  const menu = await getActiveMenu();
  return present(token, record, menu);
});
