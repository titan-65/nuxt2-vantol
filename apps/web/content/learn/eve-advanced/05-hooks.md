---
title: "Hooks: Observe the Runtime Stream"
description: "Subscribe to runtime stream events from agent/hooks/. Use cases: audit logging, metrics, alerting. Cover events map, lifecycle, toolResultFrom narrowing, execution order, and hook vs tool vs provider."
series: "eve-advanced"
order: 5
feature: "defineHook / hooks/"
sourceUrl: "https://eve.dev/docs/guides/hooks"
---

## What it is

Hooks are authored extension points for the runtime event stream. A hook subscribes to stream events and runs side effects *after* each event is durably recorded — audit logging, metrics, alerting, or persisting every session and message to your own database. The slug is the path-relative basename: `agent/hooks/audit.ts` → `"audit"`.

## Why you'd care

Sometimes you need to watch what the agent does without writing a tool or a channel adapter. Hooks give you an observe-only tap on the entire event stream — every session start, message completion, and tool result — so you can ship telemetry to your own systems without changing agent behavior.

## Before

To log a tool result you'd have to wrap the tool's `execute`, poll the stream from a client, or rebuild the event pipeline. None of that is clean, and it mutates the agent's own logic.

## After

Define a hook with `defineHook` and an `events` map keyed by event type, with `*` matching everything:

```ts [agent/hooks/audit.ts]
import { defineHook } from "eve/hooks";

export default defineHook({
  events: {
    async "session.started"(_event, ctx) {
      console.info("session started", { sessionId: ctx.session.id });
    },
    async "message.completed"(event) {
      console.info("model finished", { length: event.data.message?.length ?? 0 });
    },
  },
});
```

Handlers are observe-only — they cannot inject model context. To narrow a tool result, use `toolResultFrom` from `eve/tools`:

```ts [agent/hooks/audit.ts]
import { defineHook } from "eve/hooks";
import { toolResultFrom } from "eve/tools";
import getWeather from "../tools/get-weather";
import linear from "../connections/linear";

export default defineHook({
  events: {
    "action.result"(event) {
      const weather = toolResultFrom(event.data.result, getWeather);
      if (weather) console.log(weather.output.temperature); // typed as the tool's return

      const linearResult = toolResultFrom(event.data.result, linear);
      if (linearResult) console.log(linearResult.connectionToolName, linearResult.output);
    },
  },
});
```

`toolResultFrom` returns `undefined` on mismatch or when `isError` is `true`. For authored tools the return includes `{ output, toolName, callId }` (output typed); for connections `{ output, toolName, connectionToolName, callId }` (output `unknown`). It keys off the tool definition, so it matches namespaced results like `crm__search` from an extension too.

## Do it yourself

1. Create `agent/hooks/audit.ts` logging `session.started` and `message.completed` (use `ctx.session.id`).
2. Add an `action.result` handler with `toolResultFrom` on one of your tools; log the typed output.
3. Add a `"*"` handler that counts events into a metric — confirm typed handlers run before the wildcard.
4. Throw inside a handler and watch it surface as `turn.failed` (wrap risky bodies in `try`/`catch` for belt-and-suspenders).

**Execution order** when an event fires:

1. **Emit** — the channel adapter handler runs, then the event is written to the durable stream.
2. **Hooks** — stream-event hooks fire (typed handlers first, then `*`); return values ignored.
3. **Dynamic tool resolvers** — subscribed resolvers run and update the tool set.

Hooks always run *after* the event is durably recorded, so a thrown hook leaves the stream consistent. A thrown hook propagates as `turn.failed`; a hook on a failure-cascade event that also throws escalates to `session.failed`.

## Gotchas

- **Observe-only.** Hooks can't inject model context. To add runtime model messages, use `defineDynamic`/`defineInstructions` in `agent/instructions/` instead.
- **A thrown hook is a real failure.** Treat hooks as production code; wrap bodies in `try`/`catch` if a side effect (a flaky DB write) shouldn't fail the turn.
- **Subagent isolation.** Subagent `hooks/` fire only in the subagent scope; parent hooks don't see subagent turns and vice versa.
- **Hook vs. the alternatives.** Observe events → a hook (or channel adapter handler). Provide structured input on demand → a tool. Make a value available across the whole step → a context provider. Platform-specific events → a channel adapter handler. Stream-event hooks and channel adapter handlers are structurally identical; use the channel handler for adapter-specific behavior and `events.*` for agent-level behavior across every channel.

## Recap

Hooks tap the durable event stream from `agent/hooks/` — `defineHook` with an `events` map, `*` for all. `toolResultFrom` narrows `action.result` to typed tool/connection output. They run after the event is recorded, observe-only, and a throw becomes `turn.failed`. Next: catch regressions with evaluations.
