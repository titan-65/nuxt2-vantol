# Design: "Learning Eve — Build Your First Agent" tutorial series

- **Date:** 2026-07-18
- **Status:** Approved (design)
- **Author:** Vantol Bennett
- **Source docs:** https://eve.dev/docs/introduction (and linked pages: agent-config, tools, skills, channels/overview)

## Goal

Produce a beginner-friendly, doc-driven tutorial series for Vercel's **Eve** agent framework, published in the blog's existing `learn/` section. The reader builds one real, runnable agent from an empty folder, learning each Eve building block as it is added.

## Audience

Web developers comfortable with TypeScript who are **new to building AI agents**. Agent concepts (model calls, tools, sessions, channels) are explained as they appear. No prior AI SDK experience assumed.

## Series format (matches existing `learn/` convention)

- Folder: `apps/web/content/learn/eve-core/`
- `index.md` + numbered lessons `NN-slug.md`
- Each lesson frontmatter mirrors the Nuxt series:
  - `index.md`: `title`, `description`, `series`, `releaseDate`, `sourceUrl`, `difficulty`, `estMinutes`, `img`, `author`
  - lesson: `title`, `description`, `series`, `order`, `feature`, `sourcePRs` (or `sourceUrl`)
- Each lesson body follows the proven path:
  **What it is → Why you'd care → Before → After → Do it yourself → Gotchas → Recap.**
- A `::BlogAlert` intro on `index.md` notes the series is based on the official Eve docs.

## The agent we build (cumulative, single repo)

A **Personal Research Assistant** — answers grounded questions, can call a tool for live data, follows a research playbook skill, and is reachable via CLI + web chat.

Lessons extend the same project so the final state is one coherent, runnable agent.

## Lesson plan

### `index.md`

Series landing: what Eve is ("Next.js for agents"), how the series works, difficulty/estimate, the doc-source note, and "start with step one."

### `01-instructions.md` — Meet your agent's brain

- `instructions.md`: identity, behavior, guardrails in Markdown.
- Run `npx eve@latest init my-agent` and talk to it.
- Before: a blank project. After: a talking agent from one file.
- DIY: write identity + 2 guardrails, run, ask it a question.
- Gotchas: instructions are the always-on system prompt; keep them specific.

### `02-agent-config.md` — Pick a model

- `agent.ts` via `defineAgent`, choosing `model` (e.g. `openai/gpt-5.4-mini`), runtime options via AI Gateway.
- Before: default model you didn't choose. After: explicit model + config.
- DIY: add `agent.ts`, set a model, confirm it's used.
- Gotchas: `eve` default model exists; `agent.ts` only needed to override.

### `03-tools.md` — Give it hands

- `tools/get_weather.ts` with `defineTool` + Zod `inputSchema`; filename → tool name; no registry.
- Before: agent that can only talk. After: agent calls a typed function.
- DIY: create the weather tool, call it from chat, confirm typed input.
- Gotchas: `inputSchema` with Zod; return shape is what the model sees.

### `04-skills.md` — Reusable playbooks

- `skills/deep_research.md`: Markdown procedures loaded only when relevant (with frontmatter `description`).
- Before: long procedure crammed into instructions. After: skill loaded on demand.
- DIY: add a research skill, trigger it via a relevant prompt.
- Gotchas: skills are discovered by `description`; they're not always in context.

### `05-channels.md` — Let people talk to it

- Channel setup so the same agent serves CLI + web chat (per docs `channels/overview`).
- Before: only local `eve` run. After: reachable from web/CLI from one codebase.
- DIY: enable a web/chat channel, send a message, get a response.
- Gotchas: one agent codebase, many surfaces; channel config is its own file under `channels/`.

### `06-run-and-recap.md` — Run it & go further

- Durable sessions in action (state persists across turns, parks/resumes).
- Full recap of the building blocks.
- Pointers to advanced docs: `connections/`, `sandbox/`, `subagents/`, `schedules/`, hooks, evaluations, deploy to Vercel.

## Conventions

- Code blocks use real Eve API from the docs (`defineAgent`, `defineTool`, Zod). No invented APIs.
- `Before`/`After` contrast makes each lesson self-contained.
- Tone: friendly, plain, for devs new to agents. Mirror the Nuxt series voice.
- Images: Unsplash URL in frontmatter, e.g. `https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000&auto=format&fit=crop` (agent/AI themed; swap if preferred).

## Out of scope (this series)

Connections (MCP/OpenAPI), sandbox customization, subagents, schedules, hooks, human-in-the-loop, evaluations, and Vercel deploy — covered by a future "Eve integrations" series (referenced in lesson 6).

## Acceptance

- All 7 files (`index.md` + 6 lessons) exist under `learn/eve-core/`.
- Files follow the existing `learn/nuxt-4-4/` frontmatter shape and body path.
- Every code sample is accurate to Eve's documented API.
- Lessons are cumulative and produce one runnable agent.
