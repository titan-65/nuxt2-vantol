---
title: "Building a Production API with Drizzle ORM + Nitro: A Complete Guide"
description: "Learn how to build a production-ready API using Drizzle ORM with Nitro. From setup to deployment, this guide covers everything you need for type-safe database operations."
date: 2026-03-03
tag: "Technology"
img: "https://images.unsplash.com/photo-1555949963-aa79dcee981c"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
readTime: 12
keywords: [drizzle, orm, nitro, database, postgres, sqlite, typescript]
language: "TypeScript"
rating: 5
---

# Introduction

In our **BrewStop food truck series**, we used Unstorage for data persistence—an excellent choice for prototypes and simple applications. But when you're building for production, you need something more robust: a proper database with type-safe queries, migrations, and scalable architecture.

That's where **Drizzle ORM** comes in.

Drizzle is a lightweight, TypeScript-first ORM that gives you the control of raw SQL with the ergonomics of an ORM. It pairs beautifully with Nitro, offering a production-ready data layer that won't slow you down.

In this post, we'll build a complete database-backed API using **Drizzle ORM + Nitro**—covering setup, schema design, queries, and deployment.

<!--more-->

# Why Drizzle ORM?

Before we dive in, let's talk about why Drizzle is worth your attention:

- **Type-safe queries** — TypeScript understands your schema end-to-end
- **Lightweight** — No heavy runtime, compiles to efficient SQL
- **Portable** — Works with PostgreSQL, MySQL, SQLite, and more
- **Migration support** — First-class migration tooling
- **Zero dependencies** — Doesn't pull in unnecessary bloat

::BlogAlert{type="info"}
Drizzle is designed to feel like you're writing SQL—but with full type safety and IDE autocomplete.
::

---

# Main Content

## Prerequisites

This guide assumes you have:
- Node.js 18+ installed
- Basic knowledge of TypeScript
- A PostgreSQL or SQLite database (we'll use SQLite for simplicity, but the code is mostly identical)

---

## Step 1: Project Setup

Let's start by creating a new Nitro project and installing Drizzle.

```bash [terminal]
# Create a new Nitro project
npx create-nitro-app brewstop-api-v2
cd brewstop-api-v2

# Install Drizzle ORM and SQLite driver
npm install drizzle-orm better-sqlite3
npm install -D drizzle-kit @types/better-sqlite3
```

::BlogAlert{type="warning"}
Make sure to use the appropriate driver for your database (pg for PostgreSQL, mysql2 for MySQL, etc.). We'll use better-sqlite3 for this example.
::

---

## Step 2: Configure Drizzle

Create a configuration file for Drizzle. This tells Drizzle where your database is and how to handle migrations.

Create `drizzle.config.ts`:

```ts [drizzle.config.ts]
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./server/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./brewstop.db",
  },
});
```

---

## Step 3: Define Your Schema

Now let's design our database schema. For BrewStop, we need:

- **Menu items** — products the food truck sells
- **Orders** — customer orders
- **Order items** — individual items within an order

Create `server/db/schema.ts`:

```ts [server/db/schema.ts]
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Menu Items Table
export const menuItems = sqliteTable("menu_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  category: text("category").notNull(), // coffee, tea, food
  available: integer("available", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`),
});

// Orders Table
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  status: text("status").notNull().default("pending"), // pending, preparing, ready, completed
  customerName: text("customer_name"),
  total: real("total").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`),
});

// Order Items Table (junction table)
export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  menuItemId: text("menu_item_id")
    .notNull()
    .references(() => menuItems.id),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: real("unit_price").notNull(),
});

// Type exports for TypeScript
export type MenuItem = typeof menuItems.$inferSelect;
export type NewMenuItem = typeof menuItems.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
```

::Callout{icon="🔑" title="Schema Best Practices"}
Always define your schema in TypeScript. Drizzle's type inference means your queries will be fully typed—no more guessing what fields exist on your models.
::

---

## Step 4: Initialize the Database Connection

Create a database connection utility that Nitro can use.

Create `server/db/index.ts`:

```ts [server/db/index.ts]
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database("brewstop.db");
export const db = drizzle(sqlite, { schema });

// Initialize tables on startup
export function initializeDatabase() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      available INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'pending',
      customer_name TEXT,
      total REAL NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      menu_item_id TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      unit_price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
    );
  `);
  
  console.log("✅ Database initialized");
}
```

---

## Step 5: Seed Some Data

Let's add an endpoint to populate our menu with sample data.

Create `server/api/seed.post.ts`:

```ts [server/api/seed.post.ts]
import { db } from "../db";
import { menuItems } from "../db/schema";

const defaultMenuItems = [
  { id: "latte", name: "Latte", description: "Smooth espresso with steamed milk", price: 4.5, category: "coffee" },
  { id: "espresso", name: "Espresso", description: "Rich, bold espresso shot", price: 3.0, category: "coffee" },
  { id: "americano", name: "Americano", description: "Espresso with hot water", price: 3.5, category: "coffee" },
  { id: "cappuccino", name: "Cappuccino", description: "Espresso with equal parts milk foam", price: 4.5, category: "coffee" },
  { id: "chai", name: "Chai Tea", description: "Spiced black tea with milk", price: 4.0, category: "tea" },
  { id: "green-tea", name: "Green Tea", description: "Organic Japanese green tea", price: 3.5, category: "tea" },
  { id: "croissant", name: "Croissant", description: "Buttery French pastry", price: 3.5, category: "food" },
  { id: "muffin", name: "Blueberry Muffin", description: "Freshly baked muffin", price: 3.0, category: "food" },
  { id: "bagel", name: "Bagel with Cream Cheese", description: "Toasted bagel with cream cheese", price: 4.0, category: "food" },
];

export default defineEventHandler(async () => {
  // Clear existing menu items
  await db.delete(menuItems).run();
  
  // Insert default items
  for (const item of defaultMenuItems) {
    await db.insert(menuItems).values({
      ...item,
      available: true,
    });
  }
  
  return { message: "Menu seeded successfully", count: defaultMenuItems.length };
});
```

---

## Step 6: Create API Endpoints

### Get Menu

Create `server/api/menu.get.ts`:

```ts [server/api/menu.get.ts]
import { db } from "../db";
import { menuItems } from "../db/schema";

export default defineEventHandler(async () => {
  const items = await db.select().from(menuItems).where(menuItems.available);
  return { items };
});
```

### Get Single Menu Item

Create `server/api/menu/[id].get.ts`:

```ts [server/api/menu/[id].get.ts]
import { db } from "../db";
import { menuItems } from "../db/schema";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Menu item ID is required",
    });
  }
  
  const item = await db.select().from(menuItems).where(menuItems.id.equals(id)).get();
  
  if (!item) {
    throw createError({
      statusCode: 404,
      statusMessage: "Menu item not found",
    });
  }
  
  return item;
});
```

### Create Order

This is where Drizzle really shines—let's create a proper order with related items.

Create `server/api/orders.post.ts`:

```ts [server/api/orders.post.ts]
import { db } from "../db";
import { orders, orderItems, menuItems } from "../db/schema";
import { eq } from "drizzle-orm";

interface OrderItemInput {
  menuItemId: string;
  quantity: number;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  // Validate input
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Order must contain at least one item",
    });
  }
  
  // Calculate total and fetch menu item prices
  let total = 0;
  const orderItemInputs: OrderItemInput[] = [];
  
  for (const item of body.items) {
    const menuItem = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, item.menuItemId))
      .get();
    
    if (!menuItem) {
      throw createError({
        statusCode: 400,
        statusMessage: `Menu item ${item.menuItemId} not found`,
      });
    }
    
    if (!menuItem.available) {
      throw createError({
        statusCode: 400,
        statusMessage: `Menu item ${menuItem.name} is not available`,
      });
    }
    
    total += menuItem.price * item.quantity;
    orderItemInputs.push({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
    });
  }
  
  // Create the order
  const orderId = crypto.randomUUID();
  const now = Date.now();
  
  await db.insert(orders).values({
    id: orderId,
    customerName: body.customerName || "Guest",
    status: "pending",
    total,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  });
  
  // Create order items
  for (const input of orderItemInputs) {
    const menuItem = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, input.menuItemId))
      .get();
    
    await db.insert(orderItems).values({
      id: crypto.randomUUID(),
      orderId,
      menuItemId: input.menuItemId,
      quantity: input.quantity,
      unitPrice: menuItem!.price,
    });
  }
  
  // Fetch the complete order
  const createdOrder = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .get();
  
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));
  
  return {
    ...createdOrder,
    items,
  };
});
```

### Update Order Status

Create `server/api/orders/[id].patch.ts`:

```ts [server/api/orders/[id].patch.ts]
import { db } from "../db";
import { orders } from "../db/schema";
import { eq } from "drizzle-orm";

const validStatuses = ["pending", "preparing", "ready", "completed", "cancelled"];

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Order ID is required",
    });
  }
  
  if (!body.status || !validStatuses.includes(body.status)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    });
  }
  
  const existingOrder = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .get();
  
  if (!existingOrder) {
    throw createError({
      statusCode: 404,
      statusMessage: "Order not found",
    });
  }
  
  // Update the order
  await db
    .update(orders)
    .set({
      status: body.status,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id));
  
  const updatedOrder = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .get();
  
  return updatedOrder;
});
```

### Get All Orders

Create `server/api/orders.get.ts`:

```ts [server/api/orders.get.ts]
import { db } from "../db";
import { orders, orderItems } from "../db/schema";

export default defineEventHandler(async () => {
  const allOrders = await db
    .select()
    .from(orders)
    .orderBy(orders.createdAt);
  
  // Fetch items for each order
  const ordersWithItems = await Promise.all(
    allOrders.map(async (order) => {
      const items = await db
        .select()
        .from(orderItems)
        .where(orderItems.orderId.equals(order.id));
      return { ...order, items };
    })
  );
  
  return { orders: ordersWithItems };
});
```

---

## Step 7: Run Migrations

Now that our schema is defined, let's generate and push the migrations.

```bash [terminal]
# Generate migration files
npx drizzle-kit generate:sqlite

# Push schema to database
npx drizzle-kit push:sqlite
```

::Callout{icon="🛠️" title="Migration Workflow"}
In development, you can use `push:sqlite` to sync changes quickly. For production, use `generate` to create migration files and run them separately.
::

---

## Step 8: Test the API

Start your server and test the endpoints:

```bash [terminal]
npm run dev
```

### Seed the menu:

```bash
curl -X POST http://localhost:3000/api/seed
```

### Get the menu:

```bash
curl http://localhost:3000/api/menu
```

### Create an order:

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John",
    "items": [
      { "menuItemId": "latte", "quantity": 2 },
      { "menuItemId": "croissant", "quantity": 1 }
    ]
  }'
```

### Update order status:

```bash
curl -X PATCH http://localhost:3000/api/orders/ORDER_ID \
  -H "Content-Type: application/json" \
  -d '{"status": "preparing"}'
```

---

## What We've Built

By the end of this guide, you have:

- A fully typed database schema using Drizzle ORM
- Type-safe queries throughout your API
- Proper data validation and error handling
- Order creation with transaction-like behavior
- Status update workflow

### API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | Get available menu items |
| GET | `/api/menu/:id` | Get single menu item |
| POST | `/api/orders` | Create new order |
| GET | `/api/orders` | Get all orders |
| PATCH | `/api/orders/:id` | Update order status |
| POST | `/api/seed` | Seed menu data |

---

# Conclusion

Drizzle ORM transforms your database layer from an afterthought into a **first-class citizen** of your application. The type safety alone justifies the switch—no more runtime errors from typos in column names, no more guessing what a query returns.

Combined with Nitro's filesystem routing and deployment flexibility, you have a production-ready stack that scales:

- **Start with SQLite** for development and small projects
- **Switch to PostgreSQL** for production without changing your code
- **Deploy anywhere** — Node.js, serverless, edge

In the next post, we'll add **authentication** to protect our order management endpoints. Until then, enjoy your type-safe API! ☕🚀
