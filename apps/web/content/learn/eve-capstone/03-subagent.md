---
title: "Step 3: Add the Researcher Subagent"
description: "Add agent/subagents/researcher/ — an isolated specialist that deep-dives on one digest item at a time, with its own instructions. The root delegates per topic; results fold back into the digest."
series: "eve-capstone"
order: 3
feature: "defineAgent / subagents/"
sourceUrl: "https://eve.dev/docs/subagents"
---

## What it is

A declared subagent: a specialist under `agent/subagents/<id>/` with its own `instructions`, `tools`, `skills`, `sandbox`, and `hooks`. The root calls it as a model-visible tool named for the directory basename (`researcher`). It inherits nothing from the root — its directory is its own agent root.

## Why you'd care

The root should orchestrate, not research. Each digest item (a PR, an incident thread, a stalled cycle) deserves focused investigation, ideally in parallel and without bloating the parent's context. The `researcher` child takes a single item, digs via the same connections, and returns a tight briefing the root assembles.

## Before

The root juggles gathering *and* deep research in one context. Long investigations compete for window space and can't easily run in parallel.

## After

```ts [agent/subagents/researcher/agent.ts]
import { defineAgent } from "eve";

export default defineAgent({
  description: "Investigate ambiguous questions before the parent agent responds.",
  model: "anthropic/claude-opus-4.8",
});
```

`description` is required — the compiler rejects a subagent without it. Give the child its own research brief in `instructions.md`:

```md [agent/subagents/researcher/instructions.md]
# Researcher

You receive one digest item at a time: a GitHub PR, a Linear issue, or a short
pointer to activity. Investigate it and return a tight briefing:

- **What it is** — one sentence.
- **Why it matters** — impact on the team or the release.
- **Signals** — linked PRs, reviewers, status, recent comments.
- **Risks / follow-ups** — anything the team should act on.

Use the github__* and linear__* tools to pull specifics. Do not pad. If the
item is thin, say so. Return markdown the parent can paste directly into the
digest.
```

The child can reuse the parent's connections because discovery sees its directory as its own agent root — add the same `agent/connections/` files (or let it inherit the root's connection discovery only if you mirror them). Simplest: copy `github.ts` and `linear.ts` into `agent/subagents/researcher/connections/`.

The tool name is the bare basename: `agent/subagents/researcher/` registers as `researcher`.

## Do it yourself

1. Add `agent/subagents/researcher/agent.ts` with the `defineAgent` example and a short `instructions.md`.
2. Mirror the `github.ts` and `linear.ts` connections under `agent/subagents/researcher/connections/` so the child can read.
3. Prompt the root: *"Read recent GitHub PRs, then delegate a deep-dive on the top one to the researcher."* Confirm it calls `researcher` and folds the result back.
4. Ask for two unrelated items in one message and confirm both `researcher` calls run concurrently.

## Gotchas

- **Naming collision is a build failure.** A subagent named `researcher` collides with a tool named `researcher` in the shared runtime tool namespace. Keep directory names clear of your tool names.
- **No parent history.** The child sees only what you pack into `message`. The root must hand it the item's id, URL, and any context — not *"look into that PR we discussed."*
- **`agent` is root-only.** The `researcher` child never receives the built-in `agent` tool, so it won't spawn its own subagents. Fine here.
- **`schedules/` not supported in subagents.** Only the root schedules. The cron stays in `agent/schedules/` (next step).
- **Not an approval boundary.** The child can call the same read tools; if you later gate writes, gate them in the child too.

## Recap

The `researcher` subagent isolates deep-dive work from the orchestrator, runs in parallel, and returns paste-ready markdown. The root now gathers, delegates, and assembles. Next: wake it all on a clock with a schedule.
