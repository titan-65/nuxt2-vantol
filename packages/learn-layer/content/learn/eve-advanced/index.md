---
title: "Learning Eve: Going Further"
description: "You finished the core series and shipped a real agent. Now we go further: connect external services, sandbox untrusted work, delegate to subagents, run on a clock, observe with hooks, catch regressions with evals, and ship to production."
series: "eve-advanced"
releaseDate: 2026-07-18
sourceUrl: "https://eve.dev/docs/"
difficulty: "Intermediate"
estMinutes: 90
img: "/eve.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

You built a first agent in the [core series](/learn/eve-core): instructions, a model, tools, skills, a channel. That agent can think and act. But a production agent usually needs to reach _outside_ itself — other services, a controlled workspace, specialists, a clock, observability, and a safe path to ship.

::BlogAlert{type="info"}
Based on the official [Eve docs](https://eve.dev/docs/). We're learning to _use_ what it ships, not restating the docs.
::

## What this series covers

Seven deep dives, each a real capability you can add to the agent you already have:

1. **Connections** — bring in tools from MCP and OpenAPI services, with app vs. user auth, Vercel Connect, and per-connection approval.
2. **Sandbox** — run untrusted shell and file work in an isolated `/workspace`, seed files, pick a backend, and lock down the network.
3. **Subagents** — delegate parallel or specialist work to fresh agent copies or declared specialists.
4. **Schedules** — run the agent on a cron cadence, fire-and-forget or handed off to a channel.
5. **Hooks** — observe the runtime event stream for audit logs, metrics, and alerting.
6. **Evaluations** — define scored checks and run them on every deploy and on a schedule.
7. **Deploy** — take the agent from `eve dev` to Vercel or your own host.

## How this series works

Each step takes one building block through the same path: **What it is → Why you'd care → Before → After → Do it yourself → Gotchas → Recap.** It builds on the core series, so `instructions.md`, `agent.ts`, `tools/`, `skills/`, and `channels/` are assumed known.

Start with step one.
