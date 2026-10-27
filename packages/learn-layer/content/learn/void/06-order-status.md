---
title: "Order Status: Queue, Polling, and the Weekly Cron"
description: "Move order confirmation into a queue, poll the status page, and rotate the menu on a schedule."
series: "void"
order: 6
feature: "Queue + polling + cron"
sourceUrl: "https://void.cloud/guide/queues"
difficulty: "Advanced"
estMinutes: 30
img: "/jumble-stage-1.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1767533048/PXL_20251010_202726442_2_hhudfr.jpg"
  website: "https://vantolbennett.vercel.app"
---

Checkout writes the order. The confirmation should not block the request.

Stage 6 puts a queue between checkout and the confirmation side effects, adds a polling status page, and schedules the Monday menu rotation.

::JumblePreview{stage="6" height="780"}
::

The preview is a real demo order in D1 with its timeline. The full app shows the same page after a checkout.

## What it is

- `order_events` — the append-only timeline you already see on the order page.
- `queues/order-confirmation.ts` — a typed consumer that confirms a pending order.
- `queues["order-confirmation"].send()` — enqueued after the D1 order is written.
- `GET /api/orders/:publicId` — the status endpoint the page polls.
- `crons/weekly-menu.ts` — activates the week whose dates contain today.

The order status page stays public by order code. It reveals only that order.

## The queue

```ts [queues/order-confirmation.ts]
import { defineQueue } from "void";
import { confirmOrder } from "../src/server/orders";

export type OrderConfirmationMessage = {
  publicId: string;
};

export default defineQueue<OrderConfirmationMessage>(async (batch) => {
  for (const message of batch.messages) {
    try {
      await confirmOrder(message.body.publicId);
      message.ack();
    } catch (cause) {
      console.error("Could not confirm order", message.body.publicId, cause);
      message.retry({ delaySeconds: 30 });
    }
  }
});
```

The producer is one line in checkout:

```ts [routes/api/checkout.ts]
try {
  await queues["order-confirmation"].send({ publicId: order.publicId });
} catch (cause) {
  console.error("Could not enqueue order confirmation", order.publicId, cause);
}
```

The order is already committed at that point. A queue outage leaves it pending; it does not lose the sale. The consumer's `confirmOrder` is idempotent: it only moves `pending` to `confirmed` and appends the confirmation event.

Void provisions the queue and connects the producer to the consumer at deploy. Locally, sending to the queue invokes the consumer through Miniflare.

## The status page

The page takes an order from the loader, then polls while the order is still moving:

```ts [src/JumbleOrder.vue]
async function refresh() {
  const response = await fetch(`/api/orders/${current.value.publicId}`);
  if (!response.ok) return;

  const payload = await response.json();
  current.value = payload;

  if (ORDER_FINAL_STATUSES.includes(payload.status)) {
    stopPolling();
  }
}

onMounted(() => {
  if (displayStage.value >= 6 && !finalStatus.value) {
    timer = setInterval(() => void refresh(), 4000);
  }
});
```

`GET /api/orders/:publicId` reads the order, its items, and its events. It sets `Cache-Control: no-store`; a status page must not be cached.

The event timeline is the real state transition log:

```txt
Order placed.
Pickup confirmed. We will have the box ready.
Status changed to Preparing.
Status changed to Ready for pickup.
```

## The weekly menu cron

The menu is a row; the active week is a flag. A cron makes the flag follow the calendar:

```ts [crons/weekly-menu.ts]
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
```

The stage 6 migration seeds a second week starting November 2. When the cron runs on a Monday, the storefront moves to that week's flavors without a deploy.

## Do it yourself

The migration adds `order_events` and the second menu week:

```bash
void db generate
void db migrate
pnpm dev
```

Place an order through checkout. The checkout response is `pending`; within a second or two the order page should become `confirmed` as the local queue consumer runs.

Test the cron locally with Void's development endpoint:

```bash
curl -X POST http://localhost:5173/__void/scheduled \
  -H "x-void-dev-trigger: <printed-token>" \
  -d '{"cron":"0 6 * * 1","scheduledTime":'$(date -d 'next monday' +%s000)'}'
```

Deploy:

```bash
void deploy --platform cloudflare
```

## The live stage

`/preview/6` is `JMB-DEMO-001`, a real confirmed order with a timeline. The full app shows the page after checkout. The status pill moves through Pending, Confirmed, Preparing, Ready, and Picked up as the admin advances it.

Stage 5 remains at `/preview/5` with checkout and no confirmation queue.

## Gotchas

- **Acknowledge per message.** One bad order should not retry the rest of the batch forever.
- **Make confirmation idempotent.** Queues deliver at least once; a retry must not duplicate events or reset a later status.
- **Poll, then stop.** Clear the interval on unmount and when the order reaches a final status.
- **Keep the public code unguessable.** It is the capability for the status page.
- **Cron expressions run in UTC.** The menu week dates are date-only strings; compare them consistently.
- **A queue is not a transaction.** Enqueue after the order is committed. A failed enqueue leaves an order for a retry or an admin, not a phantom sale.
- **Stage 5 does not have the queue.** The stage routes are how you see that boundary in the app.

## Recap

Orders now confirm in the background, the receipt updates itself, and the menu changes on schedule.

Next: **[Admin + Auth](/learn/void/07-admin-and-auth)** — a password-gated dashboard for orders and the weekly menu.
