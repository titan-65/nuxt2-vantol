import type { BoxSize } from "./boxes";

export const CART_HEADER = "x-jumble-cart";
export const CART_STORAGE_KEY = "jumble.cart.session";
export const CART_TTL_SECONDS = 60 * 60 * 24 * 30;
export const CART_MAX_QUANTITY = 12;
export const CART_MAX_ITEMS = 24;

export const CART_TOKEN_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type CartLine = {
  slug: string;
  size: number;
  quantity: number;
};

export type CartRecord = {
  lines: CartLine[];
};

export type CartViewLine = {
  key: string;
  slug: string;
  name: string;
  size: number;
  boxLabel: string;
  quantity: number;
  priceCents: number;
  lineTotalCents: number;
  color: string;
  accent: string;
};

export type CartView = {
  lines: CartViewLine[];
  subtotalCents: number;
  boxCount: number;
  cookieCount: number;
};

export type CartFlavor = {
  slug: string;
  name: string;
  priceCents: number;
  color: string;
  accent: string;
};

export function isCartToken(value: unknown): value is string {
  return typeof value === "string" && CART_TOKEN_PATTERN.test(value);
}

export function createCartToken(): string {
  const cryptoApi = globalThis.crypto;

  if (typeof cryptoApi?.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }

  const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function emptyCartRecord(): CartRecord {
  return { lines: [] };
}

export function emptyCartView(): CartView {
  return { lines: [], subtotalCents: 0, boxCount: 0, cookieCount: 0 };
}

export function cartLineKey(slug: string, size: number): string {
  return `${slug}:${size}`;
}

export function buildCartView(
  record: CartRecord,
  flavors: CartFlavor[],
  boxes: BoxSize[],
): { view: CartView; pruned: CartRecord } {
  const flavorsBySlug = new Map(flavors.map((flavor) => [flavor.slug, flavor]));
  const boxesBySize = new Map(boxes.map((box) => [box.size, box]));
  const lines: CartViewLine[] = [];
  const prunedLines: CartLine[] = [];

  for (const line of record.lines) {
    const flavor = flavorsBySlug.get(line.slug);
    const box = boxesBySize.get(line.size);

    if (!flavor || !box) {
      continue;
    }

    prunedLines.push(line);
    lines.push({
      key: cartLineKey(line.slug, line.size),
      slug: flavor.slug,
      name: flavor.name,
      size: box.size,
      boxLabel: box.label,
      quantity: line.quantity,
      priceCents: box.priceCents,
      lineTotalCents: box.priceCents * line.quantity,
      color: flavor.color,
      accent: flavor.accent,
    });
  }

  const subtotalCents = lines.reduce((total, line) => total + line.lineTotalCents, 0);
  const boxCount = lines.reduce((total, line) => total + line.quantity, 0);
  const cookieCount = lines.reduce((total, line) => total + line.size * line.quantity, 0);

  return {
    view: { lines, subtotalCents, boxCount, cookieCount },
    pruned: { lines: prunedLines },
  };
}
