---
title: "Step 4: Schedule the Digest to Slack"
description: "Add agent/schedules/daily-digest.ts with a cron cadence and a run handler that assembles the digest and receives it to the Slack channel. Covers defineSchedule, receive/waitUntil/appAuth, and the dev dispatch route."
series: "eve-capstone"
order: 4
feature: "defineSchedule / schedules/"
sourceUrl: "https://eve.dev/docs/schedules"
---

## What it is

A schedule starts the agent on its own clock. One file under `agent/schedules/` with a cron expression. The handler form gives you `receive`, `waitUntil`, and `appAuth` so the schedule can build the digest and hand it to a channel. Schedules are root-only; the name is the path under `schedules/` (`daily-digest.ts` → `"daily-digest"`).

## Why you'd care

A digest nobody triggers is useless. The schedule fires every morning, orchestrates the connections + `researcher` subagent, and delivers the result to Slack — fully unattended. The same durable runtime means it survives crashes and can call every tool the root has.

## Before

The agent is reactive: it only runs when you message it. The digest has to be summoned by hand.

## After

First the Slack channel it delivers to:

```ts [agent/channels/slack.ts]
import { connectSlackCredentials } from "@vercel/connect/eve";
import { slackChannel } from "eve/channels/slack";

export default slackChannel({
  credentials: connectSlackCredentials("slack/my-agent"),
});
```

Then the schedule. Handler form because it must deliver to a channel:

```ts [agent/schedules/daily-digest.ts]
import { defineSchedule } from "eve/schedules";
import slack from "../channels/slack";

export default defineSchedule({
  cron: "0 8 * * *",
  async run({ receive, waitUntil, appAuth }) {
    waitUntil(
      receive(slack, {
        message:
          "Build the daily research digest: pull recent GitHub and Linear " +
          "activity, delegate a deep-dive on each meaningful item to the " +
          "researcher subagent, then deliver one tight digest to this channel.",
        target: { channelId: "C0123ABC" },
        auth: appAuth,
      }),
    );
  },
});
```

- `cron: "0 8 * * *"` — 08:00 daily. On Vercel this evaluates in **UTC**.
- `receive(channel, { message, target, auth })` — starts a session on the Slack channel.
- `waitUntil(promise)` — extends the cron task's lifetime so the parked session and in-flight subagent work settle before the task ends. Wrap `receive` in it.
- `appAuth` — the app principal; pass it as `auth` for work the agent does on its own behalf.

## Do it yourself

1. Add `agent/channels/slack.ts` with the `slackChannel` example, registering the `slack/my-agent` Connect client.
2. Add `agent/schedules/daily-digest.ts` with the handler above; set `channelId` to a real Slack channel.
3. Run `eve dev`. Schedules don't fire on cadence in dev, so trigger it via the dev dispatch route:

```bash
curl -X POST http://localhost:3000/eve/v1/dev/schedules/daily-digest
# -> { "scheduleId": "daily-digest", "sessionIds": ["..."] }
```

4. Confirm a digest session started and (once Slack creds are live) landed in the channel.
5. Try the markdown form for a fire-and-forget variant if you ever want the root to just run without a channel handoff.

## Gotchas

- **`eve dev` does not fire cron.** Use the dev dispatch route to test. A built app served with `eve start` *does* run production schedules.
- **Vercel evaluates cron in UTC.** `"0 8 * * *"` is 08:00 UTC, not your local 08:00. Shift the expression for your time zone.
- **Markdown task mode can't park.** It runs to completion or fails; it can't wait for a person or OAuth. You need the handler form (which parks on the channel handoff) to deliver to Slack.
- **`waitUntil` is mandatory for channel handoff.** Without it the cron task ends before the Slack session resolves and the digest may never arrive.
- **Channel auth is app-scoped.** The scheduled run has no end-user principal, so `connectSlackCredentials("slack/my-agent")` must be app-scoped, not user OAuth.

## Recap

`defineSchedule` with a cron + `run` handler wakes the agent, assembles the digest via connections and the `researcher` subagent, and `receive`s it to Slack — wrapped in `waitUntil`. Test with the dev dispatch route. Next: deploy it to Vercel so the cron runs for real.
