---
title: "Subagents: Delegate Specialist Work"
description: "Two ways to delegate: the root-only built-in agent tool (a fresh copy of the root) and declared subagents with their own directories. Covers isolation, outputSchema task mode, and the naming collision rule."
series: "eve-advanced"
order: 3
feature: "agent tool / defineAgent subagents"
sourceUrl: "https://eve.dev/docs/subagents"
---

## What it is

A subagent is a way to run independent work in parallel, narrow the available tools, or hand a task to a specialist. Eve supports two kinds:

- **The built-in `agent` tool** (root-only): the model delegates a task to a fresh copy of the root agent.
- **Declared subagents**: specialists under `agent/subagents/<id>/`, each with its own `instructions`, `tools`, `skills`, `sandbox`, and `hooks`.

Both lower to the same model-visible tool shape: `{ message, outputSchema? }`.

## Why you'd care

Some jobs are better run by a focused copy of the agent than by the root juggling everything. Research, code analysis, drafting — each can run in parallel as its own session, then fold back into the parent's answer. Declared subagents let you give a child a _different_ prompt, model, and tool surface than the root, with hard isolation between them.

## Before

The root agent does everything in one context. Long research and drafting compete for the same window, and you can't easily run two investigations at once.

## After

The built-in `agent` tool ships on the root session. The model calls it with `message` and optional `outputSchema`:

```ts
{
  message: string;       // everything the child needs; it does not see the parent's history
  outputSchema?: object; // when set, the child runs in task mode and returns structured output
}
```

Emit multiple `agent` calls in one response and eve runs them concurrently, returning every result before the root continues. Give parallel children non-overlapping write scopes.

**Declared subagent** — its location under `subagents/` is what marks it. `description` is required or the compiler rejects it:

```ts [agent/subagents/researcher/agent.ts]
import { defineAgent } from "eve";

export default defineAgent({
  description: "Investigate ambiguous questions before the parent agent responds.",
  model: "anthropic/claude-opus-4.8",
});
```

Minimum files:

```text
agent/subagents/researcher/
├── agent.ts            # required (must export a description)
├── instructions.md     # optional
├── tools/              # optional, its own tools
├── skills/             # optional, its own skills
├── sandbox/            # optional, its own sandbox + workspace seed
└── subagents/          # optional, nested subagents
```

The tool name is the bare path basename: `agent/subagents/researcher/` registers as `researcher`. Unlike connection tools, it carries no namespace.

## Do it yourself

1. Add `agent/subagents/researcher/agent.ts` with the `defineAgent` example above and a short `instructions.md`.
2. Prompt the root: _"Research X, then summarize."_ Confirm the model delegates to `researcher` and folds the result back.
3. Use `outputSchema` to get structured output. Set it on the call and the child runs in task mode, returning typed data as the tool result instead of free text.
4. Run two investigations in parallel by asking for two unrelated research tasks in one message; confirm both subagents run concurrently.

**Isolation boundary.** A declared subagent inherits _nothing_ from the root's slots — discovery treats its directory as its own agent root. An absent slot falls back to the framework default, not the root's version. The built-in `agent` copy _does_ inherit root tools (minus root-only `agent`/`Workflow`) and shares the root's sandbox. `defineState` is never shared, for either kind.

## Gotchas

- **Naming collision is a build failure.** A subagent named `researcher` collides with a tool named `researcher` (same runtime tool namespace). Eve rejects the build rather than picking a winner — keep directory names distinct from tool names.
- **`agent` is root-only.** Copies and declared subagents never receive the built-in `agent` tool. A forced recursive call is rejected, not started.
- **`schedules/` is not supported in subagents.** Schedules and the `Workflow` tool are root-only.
- **Subagents aren't an approval boundary.** Put sensitive tools behind `approval`, connection approval, or route/session auth wherever they can be called.
- **No parent history.** The child sees only what you pack into `message`. Include all the context it needs.

## Recap

Delegate with the built-in `agent` tool (parallel root copies) or declared subagents (isolated specialists with their own slots). `outputSchema` switches a child to task mode for structured output. The bare directory name is the tool name — keep it clear of your tool names. Next: run the agent on a clock with schedules.
