import { kv } from "void/kv";
import { z } from "zod";
import { BOX_SIZES } from "../boxes";
import {
  CART_MAX_ITEMS,
  CART_MAX_QUANTITY,
  CART_TTL_SECONDS,
  cartLineKey,
  emptyCartRecord,
  type CartLine,
  type CartRecord,
} from "../cart";
import { getActiveMenu } from "./menu";

const carts = kv.map<unknown>("carts");

const cartRecordSchema = z.object({
  lines: z
    .array(
      z.object({
        slug: z.string().min(1).max(120),
        size: z.number().int().positive(),
        quantity: z.number().int().min(1).max(CART_MAX_QUANTITY),
      }),
    )
    .max(CART_MAX_ITEMS),
});

function normalizeLines(lines: CartLine[]): CartRecord {
  const byKey = new Map<string, CartLine>();

  for (const line of lines) {
    const key = cartLineKey(line.slug, line.size);
    const existing = byKey.get(key);

    if (existing) {
      existing.quantity = Math.min(
        existing.quantity + line.quantity,
        CART_MAX_QUANTITY,
      );
    } else {
      byKey.set(key, { ...line });
    }
  }

  return { lines: [...byKey.values()] };
}

export async function readCart(token: string): Promise<CartRecord> {
  const parsed = cartRecordSchema.safeParse(await carts.get(token));
  return parsed.success ? normalizeLines(parsed.data.lines) : emptyCartRecord();
}

export async function writeCart(token: string, record: CartRecord): Promise<void> {
  await carts.put(token, record, { ttl: CART_TTL_SECONDS });
}

export async function deleteCart(token: string): Promise<void> {
  await carts.delete(token);
}

export async function seedDemoCart(token: string): Promise<void> {
  const menu = await getActiveMenu();
  const flavor = menu.flavors[0];
  if (!flavor) return;

  const box = BOX_SIZES[1] ?? BOX_SIZES[0];
  await writeCart(token, {
    lines: [{ slug: flavor.slug, size: box.size, quantity: 1 }],
  });
}
