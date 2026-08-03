---
title: "Step 1: Scaffold the Digest Agent"
description: "Create the daily-digest project with eve init, give it a digest-assembler persona in instructions.md, and pick a model. This is the orchestrator that later wires connections, a subagent, a schedule, and a channel."
series: "eve-capstone"
order: 1
feature: "eve init / agent.ts / instructions.md"
sourceUrl: "https://eve.dev/docs/introduction"
---

## What it is

A scaffolded Eve agent: an empty folder turned into a runnable project via `npx eve@latest init`, with an `instructions.md` that defines the agent's role and an `agent.ts` that selects its model. This is the orchestrator — the parent that will eventually read GitHub/Linear, spawn a `researcher` subagent, and assemble the digest.

## Why you'd care

The capstone is cumulative: every later lesson adds a surface to this same folder. Getting the root persona right now means the later pieces (connections, subagent, schedule) have a clear "boss" to report to. The digest assembly job belongs to the root; the deep-dive belongs to the child.

## Before

No project. Just an idea and a terminal.

## After

```bash
npx eve@latest init daily-digest
cd daily-digest
```

That gives you the standard layout: `agent/agent.ts`, `agent/instructions.md`, and the rest under `agent/`, plus a runnable dev server via `eve dev`.

Define the digest-assembler persona in `instructions.md`:

```md [instructions.md]
# Daily Research Digest

You are the orchestrator for a daily research digest. Each run you:

1. Gather recent activity from connected GitHub and Linear sources.
2. For each meaningful item, delegate a focused deep-dive to the `researcher`
   subagent with the exact context it needs.
3. Assemble the returned research into one tight, skimmable digest:
   - What changed
   - Why it matters
   - Any follow-ups or risks
4. Keep the tone concise and decision-oriented. No filler.

Never invent activity you did not read from a connection. If a source returned
nothing, say so plainly.
```

Pick a capable orchestration model in `agent.ts`:

```ts [agent.ts]
import { defineAgent } from "eve";

export default defineAgent({
  model: "anthropic/claude-opus-4.8",
});
```

## Do it yourself

1. Run `npx eve@latest init daily-digest` and `cd` into it.
2. Replace `instructions.md` with the digest-assembler persona above.
3. Set `model: "anthropic/claude-opus-4.8"` in `agent/agent.ts`.
4. Run `eve dev` and send a message like _"Draft an empty digest shell."_ Confirm the agent responds in the persona.
5. Note the folder structure — `agent/connections/`, `agent/subagents/`, `agent/channels/`, `agent/schedules/` are all coming next.

## Gotchas

- **This step is the root only.** The `researcher` subagent, connections, channel, and schedule are separate files added in later steps. Don't add them here.
- **Persona scope matters.** The root should _orchestrate_, not _research_. Keep the deep-dive instructions out of the root and save them for the subagent in Step 3.
- **Model choice is the orchestrator's.** The subagent picks its own model in its own `agent.ts`.

## Recap

`eve init` + a digest-assembler `instructions.md` + a root model gives you the orchestrator shell. Next: wire GitHub and Linear connections so it has real activity to read.
