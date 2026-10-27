---
title: "Pickup + Checkout: Turn the Cart into a D1 Order"
description: "Take the KV cart through pickup slots, validation, and the first real order in D1."
series: "void"
order: 5
feature: "Pickup + D1 orders"
sourceUrl: "https://void.cloud/guide/database"
difficulty: "Advanced"
estMinutes: 30
img: "/jumble-stage-1.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1767533048/PXL_20251010_202726442_2_hhudfr.jpg"
  website: "https://vantolbennett.vercel.app"
---

The cart is a KV session. An order is a database record.

Stage 5 is where those two ideas meet. The customer picks a pickup window, the Worker validates the cart against the current menu, and Jumble writes an order plus line-item snapshots into D1. The KV cart is deleted only after the order exists.

::JumblePreview{stage="5" height="780"}
::

The preview above seeds one demo cart so the checkout form is visible. The full app uses the same flow with the cart you built in stage 4.

## What it is

Three tables and one route:

- `pickup_locations` — where the box can be collected.
- `orders` — the customer, pickup window, total, status, and public order code.
- `order_items` — a snapshot of each flavor, box size, quantity, and price at purchase.
- `POST /api/checkout` — validates the cart and form, creates the order, and clears the KV cart.

The checkout page is a normal Void page with a server loader for locations. The form and summary are Vue; the server remains the source of truth.

## The schema

```ts [db/schema.ts]
export const pickupLocations = sqliteTable("pickup_locations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  hours: text("hours").notNull(),
  isActive: integer("is_active").notNull().default(1),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  publicId: text("public_id").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  locationId: integer("location_id").notNull().references(() => pickupLocations.id),
  pickupDate: text("pickup_date").notNull(),
  pickupWindow: text("pickup_window").notNull(),
  notes: text("notes").notNull().default(""),
  subtotalCents: integer("subtotal_cents").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull(),
});
```

`order_items` copies the name, box label, and price. A menu edit next week must not rewrite an old receipt.

The migration also seeds the Kingston pickup location and next week's menu.

## Pickup slots

Pickup windows are product rules, not arbitrary strings. Keep the same list on the server and client:

```ts [src/pickup.ts]
export const PICKUP_WINDOWS = ["11:00–12:00", "12:00–13:00", "15:00–16:00"] as const;

export function pickupDateOptions(now = new Date(), days = 14) {
  // next 14 days, Tuesday through Saturday
}

export function isPickupDateAvailable(value: string, now = new Date()): boolean {
  // YYYY-MM-DD, 1–14 days out, Tuesday through Saturday
}

export function isPickupWindow(value: string): value is PickupWindow {
  return (PICKUP_WINDOWS as readonly string[]).includes(value);
}
```

The server re-runs the date and window checks. The browser controls are convenience; they are not validation.

## The checkout route

```ts [routes/api/checkout.ts]
export const POST = defineHandler(async (c) => {
  const token = c.req.header(CART_HEADER);
  if (!isCartToken(token)) return c.json({ error: "Start a cart session first." }, 400);

  const body = await readBody(c, checkoutSchema);
  if (!body) return c.json({ error: "Check the pickup details and try again." }, 400);

  if (!isPickupDateAvailable(body.pickupDate) || !isPickupWindow(body.pickupWindow)) {
    return c.json({ error: "Choose an available pickup date and window." }, 400);
  }

  const [menu, location, record] = await Promise.all([
    getActiveMenu(),
    getPickupLocationBySlug(body.locationSlug),
    readCart(token),
  ]);

  if (!location) return c.json({ error: "That pickup location is not available." }, 400);

  const { view, pruned } = buildCartView(record, menu.flavors, BOX_SIZES);
  if (pruned.lines.length !== record.lines.length) await writeCart(token, pruned);
  if (view.lines.length === 0) return c.json({ error: "Your box is empty." }, 409);

  const order = await createOrder({
    publicId: makePublicId(),
    customerName: body.customerName,
    customerEmail: body.customerEmail,
    customerPhone: body.customerPhone,
    locationId: location.id,
    pickupDate: body.pickupDate,
    pickupWindow: body.pickupWindow,
    notes: body.notes,
    subtotalCents: view.subtotalCents,
    items: view.lines.map((line) => ({
      flavorSlug: line.slug,
      flavorName: line.name,
      boxSize: line.size,
      boxLabel: line.boxLabel,
      quantity: line.quantity,
      priceCents: line.priceCents,
      lineTotalCents: line.lineTotalCents,
    })),
  });

  await deleteCart(token);
  return { order: { publicId: order.publicId, status: order.status } };
});
```

`buildCartView` is the same function that prices the cart. The client can choose a box size, but it cannot choose the price.

`createOrder` inserts the order, its line items, and the first timeline event. If line-item insertion fails, it deletes the order so a half-written receipt is not left behind.

## The checkout page

The form is a normal Vue form. The only special part is that it sends the cart token in the same header as the cart API:

```ts [src/JumbleCheckout.vue]
const response = await fetch("/api/checkout", {
  method: "POST",
  credentials: "same-origin",
  headers: {
    "content-type": "application/json",
    [CART_HEADER]: sessionToken.value,
  },
  body: JSON.stringify(form),
});
```

On success the server returns `publicId`; the browser goes to `/orders/:publicId`. That page is the receipt and the beginning of the status flow.

## Do it yourself

Generate and apply the migration, then run the app:

```bash
void db generate
void db migrate
pnpm dev
```

Open `/`, add a box, open the cart, and choose **Checkout**. Fill the form and place the order. You should land on an order page with a real code such as `JMB-KBZ47D`.

Deploy:

```bash
void deploy --platform cloudflare
```

## The live stage

`/preview/5` uses a seeded demo cart. The full app at `/` uses your real cart. The order page is public by unguessable order code; it contains the customer's contact details, so do not enumerate order IDs.

Stage 4 remains available at `/preview/4` with the cart but no checkout.

## Gotchas

- **The cart is deleted after the order, not before.** A failed insert must not lose the box.
- **Snapshot the line items.** Menu prices and names change; receipts must not.
- **Validate the pickup slot on the server.** A date select is not a security boundary.
- **Orders are not payments.** Jumble is pickup-only and pay-at-collection in this stage.
- **The public order code is a capability.** It is random and single-order; stage 7 protects the admin list.
- **The checkout can race the menu.** Re-read the active menu during checkout and prune unavailable lines.

## Recap

The cart can now become a real D1 order with a pickup window, a public code, and line-item history.

Next: **[Order Status](/learn/void/06-order-status)** — a queue confirms the order, the page polls, and a cron rotates the weekly menu.
