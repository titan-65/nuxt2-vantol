---
title: "The Weekly Menu: D1 + Drizzle in the Real Storefront"
description: "Model Jumble's rotating menu in D1, seed it locally and remotely, and render the first real cookie storefront through a typed Void loader."
series: "void"
order: 2
feature: "D1 + Drizzle + typed loader"
sourceUrl: "https://void.cloud/guide/database"
difficulty: "Advanced"
estMinutes: 25
img: "/jumble-stage-1.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1767533048/PXL_20251010_202726442_2_hhudfr.jpg"
  website: "https://vantolbennett.vercel.app"
---

Stage 1 gave Jumble a body. Stage 2 gives it a menu.

The weekly menu is the first real data in the product: an active week, eight rotating cookie flavors, prices, descriptions, and the join table that keeps the order. All of it lives in D1 and reaches the page through a typed loader.

::JumblePreview{stage="2" height="720"}
::

## What it is

D1 is Cloudflare's SQLite database. Void gives you a local D1 database in development and provisions the deployed one when you run `void deploy`. Drizzle is the schema and query layer. Import `db` from `void/db`, define tables in `db/schema.ts`, and the types flow into the loader and the page.

The menu uses three tables:

- `weeks` — one active week, with a label and a start/end date.
- `flavors` — the reusable cookie catalog: slug, name, description, price, and the two colors used by the menu art.
- `week_flavors` — the ordered join between a week and its flavors.

That join table is the part that makes the menu rotate. Next week, insert a new week and eight new join rows; the flavor catalog stays intact.

## Why you'd care

A hard-coded menu is a marketing page. A menu in the database is a product. You can change the lineup without a deploy, schedule the next week, and add a box builder against the same data later. The loader also means the menu is server-rendered: the first paint has the cookies, not a loading skeleton.

The query is one active week plus one ordered join:

```ts [src/server/menu.ts]
import { asc, db, eq } from "void/db";
import { flavors, weekFlavors, weeks } from "@schema";

export async function getActiveMenu() {
  const [week] = await db
    .select()
    .from(weeks)
    .where(eq(weeks.isActive, 1))
    .limit(1);

  if (!week) return { week: null, flavors: [] };

  const items = await db
    .select({
      id: flavors.id,
      slug: flavors.slug,
      name: flavors.name,
      description: flavors.description,
      priceCents: flavors.priceCents,
      color: flavors.color,
      accent: flavors.accent,
    })
    .from(weekFlavors)
    .innerJoin(flavors, eq(weekFlavors.flavorId, flavors.id))
    .where(eq(weekFlavors.weekId, week.id))
    .orderBy(asc(weekFlavors.sortOrder));

  return { week, flavors: items };
}
```

The page loader returns the result as props:

```ts [pages/index.server.ts]
import { defineHandler, type InferProps } from "void";
import { CURRENT_STAGE } from "../src/stages";
import { getActiveMenu } from "../src/server/menu";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async () => {
  const menu = await getActiveMenu();
  return { stage: CURRENT_STAGE, embed: false, ...menu };
});
```

```vue [pages/index.vue]
<script setup lang="ts">
import type { Props } from "./index.server";
import JumbleMenu from "../src/JumbleMenu.vue";

defineProps<Props>();
</script>

<template>
  <JumbleMenu :stage="stage" :embed="embed" :week="week" :flavors="flavors" />
</template>
```

## Before / after

Before stage 2, `/` was the foundation page: brand, roadmap, and no data. `/preview/1` still is that page, preserved for lesson 1.

After stage 2, `/` is the menu. `/preview/2` is the same menu in embed mode for this lesson. The stage 1 preview still works because the preview route branches on the stage number before it touches D1.

## Do it yourself

### 1. Define the tables

```ts [db/schema.ts]
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
});

export const weekFlavors = sqliteTable("week_flavors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  weekId: integer("week_id").notNull().references(() => weeks.id, { onDelete: "cascade" }),
  flavorId: integer("flavor_id").notNull().references(() => flavors.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
});
```

### 2. Generate the migration

```bash
void db generate
```

Because we removed the starter `messages` table, Drizzle may ask whether the new tables are renames. Choose **create table** for `flavors`, `week_flavors`, and `weeks`. The generated SQL creates the three tables and drops `messages`.

### 3. Seed the menu

Keep the seed in SQL so the same file runs locally and against the deployed database:

```sql [db/seed.sql]
INSERT OR REPLACE INTO weeks (id, label, starts_on, ends_on, is_active) VALUES
  (1, 'Week of October 26', '2026-10-26', '2026-11-01', 1);

INSERT OR REPLACE INTO flavors (id, slug, name, description, price_cents, color, accent) VALUES
  (1, 'sorrel-snickerdoodle', 'Sorrel Snickerdoodle', 'Cinnamon sugar cookie with a bright sorrel glaze.', 425, '#C94C3D', '#F3D9D2'),
  (2, 'coconut-drops', 'Coconut Drops', 'Toasted coconut, brown sugar, and a chewy center.', 400, '#E8D5B5', '#7A4B2A');

INSERT OR REPLACE INTO week_flavors (id, week_id, flavor_id, sort_order) VALUES
  (1, 1, 1, 1),
  (2, 1, 2, 2);
```

The real file has all eight cookies.

Local:

```bash
void db seed --yes
```

This resets the local D1 database, applies migrations, and runs `db/seed.sql`.

Deployed:

```bash
void deploy --platform cloudflare
```

The production seed is a **data migration** that mirrors `db/seed.sql`. `void deploy` applies it with the schema migration, so the deployed database has the active week and the eight flavors without a second command. Keeping it in a migration means every environment starts from the same menu.

### 4. Visit the menu

```txt
http://localhost:5173/
http://localhost:5173/preview/2
```

The full app and the stage preview use the same loader and the same component.

## The live stage

The preview above points at `/preview/2` on the deployed app. The menu is rendered from D1, not from a hard-coded array. If a flavor is missing from the join table, it disappears from the menu; if a new week is active, the page follows it.

Stage 1 remains available at `/preview/1` for lesson 1.

## Gotchas

- **`void db seed` is local.** Production uses the seed migration. If you change the menu, update `db/seed.sql` and add a new migration with the same inserts; do not rely on hand-editing the deployed database.
- **The migration prompt is real.** When tables are removed and added, Drizzle asks whether they are renames. A new menu table is a create, not a rename.
- **Use cents.** Store money as integers (`price_cents`) and format at the edge of the UI. Floating-point prices become a bad time later.
- **One active week.** The loader takes the first row where `is_active = 1`. Stage 6 adds the automation that flips the active week on a cron.
- **Destructive migrations need a pragma.** If a migration drops the starter table or seeds with `INSERT OR REPLACE`, add `-- void:allow-destructive` at the top. Void blocks it otherwise.
- **The stage 1 preview must stay data-free.** It does not query D1, so lesson 1 keeps working even when the menu changes.

## Recap

Jumble now has a real catalog in D1, a typed query, and a menu that renders on the server. The stage route proves the same code can show a historical state of the product.

Next: **[The Storefront](/learn/void/03-the-storefront)** — cookie pages, box sizes, and the first add-to-box controls.
