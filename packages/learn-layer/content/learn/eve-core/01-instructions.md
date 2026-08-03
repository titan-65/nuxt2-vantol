---
title: "Instructions: Your Agent's Brain"
description: "Start an Eve project with npx eve init and write instructions.md — the always-on Markdown that defines who your agent is and how it behaves."
series: "eve-core"
order: 1
feature: "instructions.md"
sourceUrl: "https://eve.dev/docs/instructions"
---

## What it is

An Eve agent begins as a folder. The single most important file is `instructions.md` — a Markdown document that tells the model who it is and how it should behave. It is the always-on system prompt.

## Why you'd care

You can get a talking agent with zero TypeScript. Instructions are where you set tone, scope, and guardrails before any code exists.

## Before

An empty directory. No agent, no behavior.

## After

Scaffold the project and write your first instructions:

```bash
npx eve@latest init my-agent
cd my-agent
```

```md [agent/instructions.md]
# Identity

You are a personal research assistant. You help the user understand
topics by giving grounded, citation-friendly answers.

# Guardrails

- Never invent facts. If you don't know, say so.
- Prefer primary sources and clearly separate facts from opinion.
```

Run it:

```bash
eve dev
```

Then ask: _"What's the difference between durable and ephemeral execution?"_ — the agent answers from its instructions.

## Do it yourself

1. Run `npx eve@latest init my-agent` and `cd my-agent`.
2. Open `agent/instructions.md` and set an identity plus two guardrails.
3. Run `eve dev` and hold a short conversation.
4. Confirm the agent stays in character and respects your guardrails.

## Gotchas

- `instructions.md` is always in context — keep it specific, not a novel.
- The filename matters: `instructions.md` is the reserved name Eve discovers automatically.

## Recap

`instructions.md` is your agent's brain. One file, one `npx eve init`, and you have a talking agent. Next, we choose its model.
