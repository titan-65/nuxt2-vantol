import { asc, db, eq } from "void/db";
import { defineScheduled } from "void";
import { weeks } from "@schema";

export const cron = "0 6 * * 1";

export default defineScheduled(async (controller) => {
  const today = new Date(controller.scheduledTime).toISOString().slice(0, 10);
  const allWeeks = await db.select().from(weeks).orderBy(asc(weeks.startsOn));

  const current =
    allWeeks.find((week) => week.startsOn <= today && week.endsOn >= today) ??
    allWeeks.filter((week) => week.startsOn <= today).at(-1);

  if (!current || current.isActive === 1) return;

  await db.update(weeks).set({ isActive: 0 });
  await db.update(weeks).set({ isActive: 1 }).where(eq(weeks.id, current.id));
});
