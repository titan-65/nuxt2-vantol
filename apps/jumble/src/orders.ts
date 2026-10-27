import type { PickupLocationView } from "./pickup";

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "picked_up",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready for pickup",
  picked_up: "Picked up",
  cancelled: "Cancelled",
};

export const ORDER_FINAL_STATUSES: OrderStatus[] = ["picked_up", "cancelled"];

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (ORDER_STATUSES as readonly string[]).includes(value);
}

export type OrderItemView = {
  id: number;
  flavorSlug: string;
  flavorName: string;
  boxSize: number;
  boxLabel: string;
  quantity: number;
  priceCents: number;
  lineTotalCents: number;
};

export type OrderEventView = {
  id: number;
  type: string;
  message: string;
  createdAt: string;
};

export type OrderView = {
  id: number;
  publicId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate: string;
  pickupWindow: string;
  notes: string;
  subtotalCents: number;
  status: OrderStatus;
  createdAt: string;
  location: PickupLocationView;
  items: OrderItemView[];
  events: OrderEventView[];
};

export type OrderSummary = {
  id: number;
  publicId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate: string;
  pickupWindow: string;
  subtotalCents: number;
  status: OrderStatus;
  createdAt: string;
  locationName: string;
};

export type OrderItemInput = {
  flavorSlug: string;
  flavorName: string;
  boxSize: number;
  boxLabel: string;
  quantity: number;
  priceCents: number;
  lineTotalCents: number;
};
