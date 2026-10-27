export type JumbleStage = {
  n: number;
  title: string;
  detail: string;
};

export const STAGES: JumbleStage[] = [
  { n: 1, title: "Foundation", detail: "Void + Vue, one deploy" },
  { n: 2, title: "Weekly menu", detail: "D1 + Drizzle" },
  { n: 3, title: "Storefront", detail: "Cookie pages + box sizes" },
  { n: 4, title: "Box + cart", detail: "KV sessions" },
  { n: 5, title: "Pickup + checkout", detail: "Orders in D1" },
  { n: 6, title: "Order status", detail: "Queue + cron" },
  { n: 7, title: "Admin + auth", detail: "Protected operations" },
  { n: 8, title: "Ship", detail: "R2 + CI + domain" },
];

export const LIVE_STAGE = 1;
export const CURRENT_STAGE = 8;
export const STAGE_COUNT = STAGES.length;
