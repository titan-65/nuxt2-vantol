import { integer, sqliteTable, text } from "void/schema-d1";

export const weeks = sqliteTable("weeks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  label: text("label").notNull(),
  startsOn: text("starts_on").notNull(),
  endsOn: text("ends_on").notNull(),
  isActive: integer("is_active").notNull().default(0),
});

export const flavors = sqliteTable("flavors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  priceCents: integer("price_cents").notNull(),
  color: text("color").notNull(),
  accent: text("accent").notNull(),
  imageKey: text("image_key"),
});

export const weekFlavors = sqliteTable("week_flavors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  weekId: integer("week_id")
    .notNull()
    .references(() => weeks.id, { onDelete: "cascade" }),
  flavorId: integer("flavor_id")
    .notNull()
    .references(() => flavors.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
});

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
  locationId: integer("location_id")
    .notNull()
    .references(() => pickupLocations.id),
  pickupDate: text("pickup_date").notNull(),
  pickupWindow: text("pickup_window").notNull(),
  notes: text("notes").notNull().default(""),
  subtotalCents: integer("subtotal_cents").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull(),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  flavorSlug: text("flavor_slug").notNull(),
  flavorName: text("flavor_name").notNull(),
  boxSize: integer("box_size").notNull(),
  boxLabel: text("box_label").notNull(),
  quantity: integer("quantity").notNull(),
  priceCents: integer("price_cents").notNull(),
  lineTotalCents: integer("line_total_cents").notNull(),
});

export const orderEvents = sqliteTable("order_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull(),
});
