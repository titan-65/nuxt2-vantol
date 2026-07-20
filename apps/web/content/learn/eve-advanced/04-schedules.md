---
title: "Schedules: Run the Agent on a Clock"
description: "Define agent/schedules/ with a cron cadence. Fire-and-forget markdown prompt, or a handler that hands work to a channel via receive/waitUntil. Dev dispatch route, Vercel Cron mapping, and self-hosted gotchas."
series: "eve-advanced"
order: 4
feature: "defineSchedule / schedules/"
sourceUrl: "https://eve.dev/docs/schedules"
---

## What it is

A schedule starts the agent on its own clock instead of waiting for an inbound message. Each is a single file under `agent/schedules/` carrying a cron expression. Schedules are root-only — declared subagents can't have a `schedules/` directory. The name comes from the path under `schedules/` (`agent/schedules/billing/sweep.ts` → `"billing/sweep"`).

Every schedule provides a `cron` (standard 5-field, minute granularity) and exactly one of `markdown` (fire-and-forget task mode) or `run` (handler).

## Why you'd care

Daily digests, data syncs, cleanup sweeps, heartbeats — work that should fire on a cadence without a human triggering it. Schedules run on the same durable runtime as any session, so they can call tools, write to backends, and survive crashes. On Vercel they become Vercel Cron Jobs automatically.

## Before

Everything the agent does is reactive — it only runs when a user or a webhook pings it. Recurring work needs an external cron you wire up by hand.

## After

**Markdown form** — minimal fire-and-forget task mode:

```ts [agent/schedules/heartbeat.ts]
import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "*/5 * * * *",
  markdown: "Pull open Linear issues and POST a summary to the metrics endpoint.",
});
```

Same thing as a `.md` file whose frontmatter takes `cron` and whose body is the prompt:

```md [agent/schedules/cleanup.md]
---
cron: "0 0 * * 0"
---

Sweep stale workflow state.
```

**Handler form** — when the schedule must deliver to a channel, branch, or compute args at fire time:

```ts [agent/schedules/critical-alerts.ts]
import { defineSchedule } from "eve/schedules";
import slack from "../channels/slack";

export default defineSchedule({
  cron: "* * * * *",
  async run({ receive, waitUntil, appAuth }) {
    waitUntil(
      receive(slack, {
        message: "Check for new critical alerts. Report only when there are any.",
        target: { channelId: "C0123ABC" },
        auth: appAuth,
      }),
    );
  },
});
```

- `receive(channel, { message, target, auth })` — starts a session on another channel.
- `waitUntil(promise)` — extends the cron task's lifetime so the parked session and in-flight fetches settle before the task ends. Wrap `receive` in it.
- `appAuth` — the app principal; pass it as `auth` for work the agent does on its own behalf.

## Do it yourself

1. Add `agent/schedules/heartbeat.ts` with the markdown example. Run `eve dev`.
2. `eve dev` never fires schedules on their cadence, so trigger it out of band via the dev dispatch route:

```bash
curl -X POST http://localhost:3000/eve/v1/dev/schedules/heartbeat
# -> { "scheduleId": "heartbeat", "sessionIds": ["..."] }
```

The `:scheduleId` is the path-derived name (`heartbeat`; URL-encode the `/` in nested names). It returns started session ids so you can subscribe to each stream. Unknown id → `404` with `availableScheduleIds`.
3. Add a handler-form schedule that delivers to your Slack channel via `receive(...)`, wrapping it in `waitUntil`.
4. Deploy (next lesson) and confirm the schedule appears under **Settings → Cron Jobs** and runs in UTC.

## Gotchas

- **`eve dev` does not fire cron.** Use the dev dispatch route to test. A built app served with `eve start` *does* run production scheduled tasks.
- **Vercel evaluates cron in UTC.** `"0 9 * * 1-5"` fires 09:00 UTC on weekdays. Plan time zones accordingly.
- **Markdown task mode can't park.** It runs to completion or fails; it cannot wait for a person or an OAuth sign-in. Use the handler form (which can park on a channel handoff) when you need to wait.
- **Custom hosting gotcha.** If you adapt the output to a host that serves HTTP but doesn't start Nitro's scheduled task runner, schedules compile but won't fire. Use `eve start`, a Nitro-scheduled host, or trigger from your own scheduler.

## Recap

Schedules run the agent on a cron from `agent/schedules/`: `markdown` for fire-and-forget task mode, `run` for channel handoffs via `receive`/`waitUntil`. Test with the dev dispatch route; in production they become Vercel Cron Jobs (UTC). Next: observe the runtime with hooks.
