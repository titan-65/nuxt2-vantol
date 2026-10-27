export const PICKUP_WINDOWS = ["11:00–12:00", "12:00–13:00", "15:00–16:00"] as const;

export type PickupWindow = (typeof PICKUP_WINDOWS)[number];

export type PickupLocationView = {
  id: number;
  slug: string;
  name: string;
  address: string;
  hours: string;
};

export type PickupDateOption = {
  value: string;
  label: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function utcDay(now: Date): number {
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

export function pickupDateOptions(now = new Date(), days = 14): PickupDateOption[] {
  const base = utcDay(now);
  const options: PickupDateOption[] = [];

  for (let offset = 1; offset <= days; offset += 1) {
    const date = new Date(base + offset * DAY_MS);
    const weekday = date.getUTCDay();

    if (weekday === 0 || weekday === 1) continue;

    options.push({
      value: date.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat("en", {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(date),
    });
  }

  return options;
}

export function isPickupDateAvailable(value: string, now = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(timestamp)) return false;

  const date = new Date(timestamp);
  if (date.toISOString().slice(0, 10) !== value) return false;

  const offset = Math.round((timestamp - utcDay(now)) / DAY_MS);
  const weekday = date.getUTCDay();

  return offset >= 1 && offset <= 14 && weekday !== 0 && weekday !== 1;
}

export function isPickupWindow(value: string): value is PickupWindow {
  return (PICKUP_WINDOWS as readonly string[]).includes(value);
}

export function formatPickupDate(value: string): string {
  return new Date(`${value}T12:00:00Z`).toLocaleDateString("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
