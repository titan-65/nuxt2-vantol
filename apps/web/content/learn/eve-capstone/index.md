---
title: "Eve Capstone: The Daily Research Digest"
description: "Build a real Daily Research Digest agent end-to-end: it pulls recent GitHub and Linear activity via MCP connections, delegates deep research to a dedicated subagent, assembles a digest, and delivers it to Slack on a cron schedule — then ships to Vercel. This capstone weaves together the four advanced building blocks (connections, subagents, schedules, deploy) into one production agent."
series: "eve-capstone"
releaseDate: 2026-07-18
sourceUrl: "https://eve.dev/docs/"
difficulty: "Advanced"
estMinutes: 120
img: "/eve.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

You finished [eve-core](/learn/eve-core) and [eve-advanced](/learn/eve-advanced). You know every building block: tools, skills, channels, connections, sandboxes, subagents, schedules, hooks, evals, and deploy. Now we put them to work in one agent that uses *all of them together*.

::BlogAlert{type="info"}
Based on the official [Eve docs](https://eve.dev/docs/). We're learning to *use* what it ships, not restating the docs.
::

## What we're building

A **Daily Research Digest** agent. Every morning on a cron cadence it:

1. Pulls recent activity from **GitHub** and **Linear** via MCP connections.
2. Delegates a deep-dive on each meaningful item to a `researcher` **subagent**.
3. Assembles everything into a single digest.
4. Delivers that digest to a **Slack** channel via a schedule handler.

Then we **deploy** it to Vercel, where the schedule becomes a Vercel Cron Job and the whole thing runs unattended in production.

## What it showcases

This capstone is the four advanced features, composed:

- **Connections** — read live GitHub and Linear data without writing a single integration client.
- **Subagents** — a focused `researcher` child that digs into each item in isolation while the parent orchestrates.
- **Schedules** — one cron entry that wakes the agent, builds the digest, and hands it to Slack.
- **Deploy** — `eve build` + `vercel deploy`, a `vercel()` sandbox backend, real auth, and a live cron job.

## Builds on

- [eve-core](/learn/eve-core) — instructions, model, tools, skills, channels.
- [eve-advanced](/learn/eve-advanced) — connections, subagents, schedules, deploy.

Every one of those building blocks is assumed known. We don't re-teach mechanics; we combine them.

## Final file tree

```text
daily-digest/
├── agent/
│   ├── agent.ts             # the orchestrator model
│   ├── instructions.md      # the digest-assembler persona
│   ├── connections/
│   │   ├── github.ts        # MCP: recent PRs/commits/issues
│   │   └── linear.ts        # MCP: issues, projects, cycles
│   ├── subagents/
│   │   └── researcher/
│   │       ├── agent.ts     # the deep-dive specialist
│   │       └── instructions.md
│   ├── channels/
│   │   └── slack.ts         # delivery target
│   ├── sandbox/
│   │   └── sandbox.ts       # vercel() backend
│   └── schedules/
│       └── daily-digest.ts  # cron + receive(...) to Slack
└── .env                     # LINEAR_API_TOKEN, GITHUB_TOKEN, etc.
```

## Start

Begin with step one: scaffold the digest agent.
