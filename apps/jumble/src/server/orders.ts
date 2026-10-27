import { asc, db, desc, eq } from "void/db";
import { orderEvents, orderItems, orders, pickupLocations } from "@schema";
import { BOX_SIZES } from "../boxes";
import {
  isOrderStatus,
  ORDER_STATUS_LABELS,
  type OrderEventView,
  type OrderItemInput,
  type OrderItemView,
  type OrderStatus,
  type OrderSummary,
  type OrderView,
} from "../orders";
import { PICKUP_WINDOWS, pickupDateOptions } from "../pickup";
import { getActiveMenu } from "./menu";
import { getPickupLocations } from "./pickup";

export type CreateOrderInput = {
  publicId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  locationId: number;
  pickupDate: string;
  pickupWindow: string;
  notes: string;
  subtotalCents: number;
  status?: OrderStatus;
  items: OrderItemInput[];
};

export async function getOrder(publicId: string): Promise<OrderView | null> {
  const [row] = await db
    .select({
      id: orders.id,
      publicId: orders.publicId,
      customerName: orders.customerName,
      customerEmail: orders.customerEmail,
      customerPhone: orders.customerPhone,
      pickupDate: orders.pickupDate,
      pickupWindow: orders.pickupWindow,
      notes: orders.notes,
      subtotalCents: orders.subtotalCents,
      status: orders.status,
      createdAt: orders.createdAt,
      locationId: pickupLocations.id,
      locationSlug: pickupLocations.slug,
      locationName: pickupLocations.name,
      locationAddress: pickupLocations.address,
      locationHours: pickupLocations.hours,
    })
    .from(orders)
    .innerJoin(pickupLocations, eq(orders.locationId, pickupLocations.id))
    .where(eq(orders.publicId, publicId))
    .limit(1);

  if (!row) return null;

  const [items, events] = await Promise.all([
    db
      .select({
        id: orderItems.id,
        flavorSlug: orderItems.flavorSlug,
        flavorName: orderItems.flavorName,
        boxSize: orderItems.boxSize,
        boxLabel: orderItems.boxLabel,
        quantity: orderItems.quantity,
        priceCents: orderItems.priceCents,
        lineTotalCents: orderItems.lineTotalCents,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, row.id))
      .orderBy(asc(orderItems.id)),
    db
      .select({
        id: orderEvents.id,
        type: orderEvents.type,
        message: orderEvents.message,
        createdAt: orderEvents.createdAt,
      })
      .from(orderEvents)
      .where(eq(orderEvents.orderId, row.id))
      .orderBy(asc(orderEvents.id)),
  ]);

  return {
    id: row.id,
    publicId: row.publicId,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    customerPhone: row.customerPhone,
    pickupDate: row.pickupDate,
    pickupWindow: row.pickupWindow,
    notes: row.notes,
    subtotalCents: row.subtotalCents,
    status: isOrderStatus(row.status) ? row.status : "pending",
    createdAt: row.createdAt,
    location: {
      id: row.locationId,
      slug: row.locationSlug,
      name: row.locationName,
      address: row.locationAddress,
      hours: row.locationHours,
    },
    items,
    events,
  };
}

export async function listOrders(): Promise<OrderSummary[]> {
  const rows = await db
    .select({
      id: orders.id,
      publicId: orders.publicId,
      customerName: orders.customerName,
      customerEmail: orders.customerEmail,
      customerPhone: orders.customerPhone,
      pickupDate: orders.pickupDate,
      pickupWindow: orders.pickupWindow,
      subtotalCents: orders.subtotalCents,
      status: orders.status,
      createdAt: orders.createdAt,
      locationName: pickupLocations.name,
    })
    .from(orders)
    .innerJoin(pickupLocations, eq(orders.locationId, pickupLocations.id))
    .orderBy(desc(orders.createdAt));

  return rows.map((row) => ({
    ...row,
    status: isOrderStatus(row.status) ? row.status : "pending",
  }));
}

export async function createOrder(input: CreateOrderInput): Promise<OrderView> {
  const now = new Date().toISOString();
  const status = input.status ?? "pending";

  const [created] = await db
    .insert(orders)
    .values({
      publicId: input.publicId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      locationId: input.locationId,
      pickupDate: input.pickupDate,
      pickupWindow: input.pickupWindow,
      notes: input.notes,
      subtotalCents: input.subtotalCents,
      status,
      createdAt: now,
    })
    .returning({ id: orders.id });

  try {
    await db.insert(orderItems).values(
      input.items.map((item) => ({
        orderId: created.id,
        flavorSlug: item.flavorSlug,
        flavorName: item.flavorName,
        boxSize: item.boxSize,
        boxLabel: item.boxLabel,
        quantity: item.quantity,
        priceCents: item.priceCents,
        lineTotalCents: item.lineTotalCents,
      })),
    );

    await db.insert(orderEvents).values({
      orderId: created.id,
      type: "placed",
      message: "Order placed.",
      createdAt: now,
    });
  } catch (cause) {
    await db.delete(orders).where(eq(orders.id, created.id));
    throw cause;
  }

  const order = await getOrder(input.publicId);
  if (!order) throw new Error("Order was created but could not be read back.");
  return order;
}

export async function addOrderEvent(
  orderId: number,
  type: string,
  message: string,
): Promise<void> {
  await db.insert(orderEvents).values({
    orderId,
    type,
    message,
    createdAt: new Date().toISOString(),
  });
}

export async function updateOrderStatus(
  publicId: string,
  status: OrderStatus,
): Promise<OrderView | null> {
  const order = await getOrder(publicId);
  if (!order) return null;

  await db.update(orders).set({ status }).where(eq(orders.id, order.id));
  await addOrderEvent(order.id, "status", `Status changed to ${ORDER_STATUS_LABELS[status]}.`);

  return getOrder(publicId);
}

export async function confirmOrder(publicId: string): Promise<OrderView | null> {
  const order = await getOrder(publicId);
  if (!order || order.status !== "pending") return order;

  await db.update(orders).set({ status: "confirmed" }).where(eq(orders.id, order.id));
  await addOrderEvent(order.id, "confirmed", "Pickup confirmed. We will have the box ready.");

  return getOrder(publicId);
}

export async function ensureDemoOrder(): Promise<OrderView | null> {
  const existing = await getOrder("JMB-DEMO-001");
  if (existing) return existing;

  const [menu, locations] = await Promise.all([getActiveMenu(), getPickupLocations()]);
  const flavor = menu.flavors[0];
  const location = locations[0];
  const pickupDate = pickupDateOptions()[0]?.value;

  if (!flavor || !location || !pickupDate) return null;

  const box = BOX_SIZES[1] ?? BOX_SIZES[0];

  const order = await createOrder({
    publicId: "JMB-DEMO-001",
    customerName: "Demo Pickup",
    customerEmail: "demo@jumble.local",
    customerPhone: "+1 876 555 0104",
    locationId: location.id,
    pickupDate,
    pickupWindow: PICKUP_WINDOWS[0],
    notes: "A demo order for the lesson.",
    subtotalCents: box.priceCents,
    status: "confirmed",
    items: [
      {
        flavorSlug: flavor.slug,
        flavorName: flavor.name,
        boxSize: box.size,
        boxLabel: box.label,
        quantity: 1,
        priceCents: box.priceCents,
        lineTotalCents: box.priceCents,
      },
    ],
  });

  await addOrderEvent(
    order.id,
    "confirmed",
    "Pickup confirmed. We will have the box ready.",
  );

  return getOrder(order.publicId);
}

export type { OrderEventView, OrderItemView };
