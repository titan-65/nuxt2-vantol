---
title: "Run It & Go Further"
description: "See durable sessions in action, recap the building blocks, and get pointers to Eve's advanced features."
series: "eve-core"
order: 6
feature: "durable execution / recap"
sourceUrl: "https://eve.dev/docs/introduction"
---

## What it is

An Eve session isn't one request and one response. It streams progress, calls tools, can pause for a human answer, then resume — and it survives restarts via the open-source Workflow SDK.

## Why you'd care

You get production-shaped behavior (crash-safe, resumable, stateful across turns) without wiring it yourself.

## Before

Stateless chat that forgets everything between calls.

## After

Run your agent and watch a multi-turn conversation keep context, call tools mid-flight, and pick back up after a pause. That durability is built in.

## Do it yourself

1. Run `eve dev` and have a multi-turn conversation that uses your weather tool.
2. Notice the agent remembers earlier turns and resumes smoothly.
3. Review your full `agent/` folder — that tree *is* the agent.

## Recap

You built a Personal Research Assistant from an empty folder:

- `instructions.md` — who it is
- `agent.ts` — which model
- `tools/` — what it can do
- `skills/` — on-demand expertise
- `channels/` — where it's reachable

## Go further

This series covered the core path. Eve also ships: `connections/` (MCP/OpenAPI tools), `sandbox/` (isolated compute), `subagents/` (delegation), `schedules/` (recurring work), hooks, human-in-the-loop, evaluations, and one-command deploy to Vercel. Start with the [Eve docs](https://eve.dev/docs/introduction).
