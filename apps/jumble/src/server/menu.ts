import { and, asc, db, eq } from "void/db";
import { flavors, weekFlavors, weeks } from "@schema";
import type { AdminFlavor } from "../admin";

export type MenuWeek = typeof weeks.$inferSelect;

export type MenuFlavor = {
  id: number;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  color: string;
  accent: string;
  imageKey: string | null;
};

export type ActiveMenu = {
  week: MenuWeek | null;
  flavors: MenuFlavor[];
};

export async function getActiveMenu(): Promise<ActiveMenu> {
  const [week] = await db.select().from(weeks).where(eq(weeks.isActive, 1)).limit(1);

  if (!week) {
    return { week: null, flavors: [] };
  }

  const items = await db
    .select({
      id: flavors.id,
      slug: flavors.slug,
      name: flavors.name,
      description: flavors.description,
      priceCents: flavors.priceCents,
      color: flavors.color,
      accent: flavors.accent,
      imageKey: flavors.imageKey,
    })
    .from(weekFlavors)
    .innerJoin(flavors, eq(weekFlavors.flavorId, flavors.id))
    .where(eq(weekFlavors.weekId, week.id))
    .orderBy(asc(weekFlavors.sortOrder));

  return { week, flavors: items };
}


export type AdminMenu = {
  week: MenuWeek | null;
  flavors: AdminFlavor[];
};

export async function getAdminMenu(): Promise<AdminMenu> {
  const [week] = await db.select().from(weeks).where(eq(weeks.isActive, 1)).limit(1);
  const allFlavors = await db
    .select({
      id: flavors.id,
      slug: flavors.slug,
      name: flavors.name,
      priceCents: flavors.priceCents,
      imageKey: flavors.imageKey,
    })
    .from(flavors)
    .orderBy(asc(flavors.id));

  const activeIds = week
    ? new Set(
        (
          await db
            .select({ flavorId: weekFlavors.flavorId })
            .from(weekFlavors)
            .where(eq(weekFlavors.weekId, week.id))
        ).map((row) => row.flavorId),
      )
    : new Set<number>();

  return {
    week: week ?? null,
    flavors: allFlavors.map((flavor) => ({
      ...flavor,
      isActive: activeIds.has(flavor.id),
    })),
  };
}

export async function setFlavorActive(flavorId: number, active: boolean): Promise<boolean> {
  const [week] = await db.select().from(weeks).where(eq(weeks.isActive, 1)).limit(1);
  if (!week) return false;

  const current = await db
    .select({ flavorId: weekFlavors.flavorId })
    .from(weekFlavors)
    .where(eq(weekFlavors.weekId, week.id));

  if (active) {
    if (current.some((row) => row.flavorId === flavorId)) return true;

    await db.insert(weekFlavors).values({
      weekId: week.id,
      flavorId,
      sortOrder: current.length + 1,
    });
    return true;
  }

  await db
    .delete(weekFlavors)
    .where(and(eq(weekFlavors.weekId, week.id), eq(weekFlavors.flavorId, flavorId)));

  return true;
}
