---
title: "Learning Eve: Build Your First Agent"
description: "Vercel's Eve is a filesystem-first framework for durable AI agents. We build one real agent from an empty folder — instructions, model, tools, skills, and a channel — learning each building block as we add it."
series: "eve-core"
releaseDate: 2026-07-18
sourceUrl: "https://eve.dev/docs/introduction"
difficulty: "Beginner"
estMinutes: 40
img: "/eve.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

Think of Eve as "Next.js for agents." Instead of one giant config object, your agent is a **folder of ordinary files**: instructions in Markdown, tools in TypeScript. Eve discovers the structure and turns it into an agent that runs locally, serves HTTP, connects to other platforms, and keeps working across many turns.

::BlogAlert{type="info"}
Based on the official [Eve introduction](https://eve.dev/docs/introduction). We're learning to _use_ what it ships, not restating the docs.
::

## What we're building

A **Personal Research Assistant**. By the end of the series it has an identity, a chosen model, a weather tool, a research playbook (skill), and a channel so you can talk to it. Each lesson extends the same project.

## How this series works

Each step takes one building block through the same path: **What it is → Why you'd care → Before → After → Do it yourself → Gotchas → Recap.**

Mark steps complete as you go — progress is saved in your browser. Start with step one.
