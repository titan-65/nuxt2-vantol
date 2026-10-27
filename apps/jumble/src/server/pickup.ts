import { asc, db, eq } from "void/db";
import { pickupLocations } from "@schema";
import type { PickupLocationView } from "../pickup";

export async function getPickupLocations(): Promise<PickupLocationView[]> {
  const rows = await db
    .select({
      id: pickupLocations.id,
      slug: pickupLocations.slug,
      name: pickupLocations.name,
      address: pickupLocations.address,
      hours: pickupLocations.hours,
    })
    .from(pickupLocations)
    .where(eq(pickupLocations.isActive, 1))
    .orderBy(asc(pickupLocations.id));

  return rows;
}

export async function getPickupLocationBySlug(slug: string): Promise<PickupLocationView | null> {
  const [location] = await db
    .select({
      id: pickupLocations.id,
      slug: pickupLocations.slug,
      name: pickupLocations.name,
      address: pickupLocations.address,
      hours: pickupLocations.hours,
    })
    .from(pickupLocations)
    .where(eq(pickupLocations.slug, slug))
    .limit(1);

  return location ?? null;
}
