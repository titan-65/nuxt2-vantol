# Eve Core Tutorial Series — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Author a 7-file, beginner-friendly Eve tutorial series (`learn/eve-core/`) that builds one runnable Personal Research Assistant while teaching each Eve building block.

**Architecture:** Plain markdown content in the blog's existing `learn/<series>/` Nuxt-Content collection. One `index.md` plus six numbered lessons. Each lesson extends the same Eve project and follows the path: What it is → Why you'd care → Before → After → Do it yourself → Gotchas → Recap.

**Tech Stack:** Nuxt Content (markdown + frontmatter), Eve framework (`eve`, `eve/tools`, `eve/sandbox`, `eve/channels/*`), Zod, TypeScript.

---

## File Structure

All files live under `apps/web/content/learn/eve-core/`:

- `index.md` — series landing (frontmatter + intro + how-it-works note)
- `01-instructions.md` — `instructions.md` + `npx eve init`
- `02-agent-config.md` — `agent.ts` / `defineAgent`
- `03-tools.md` — `tools/get_weather.ts` / `defineTool` + Zod
- `04-skills.md` — `skills/deep_research.md`
- `05-channels.md` — channel setup (CLI + Slack example from docs)
- `06-run-and-recap.md` — durable sessions, recap, pointers to advanced docs

Shared author block (reuse in every frontmatter):
```yaml
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
```

---

### Task 0: Series landing (`index.md`)

**Files:**
- Create: `apps/web/content/learn/eve-core/index.md`

- [ ] **Step 1: Write `index.md`**

```markdown
---
title: "Learning Eve: Build Your First Agent"
description: "Vercel's Eve is a filesystem-first framework for durable AI agents. We build one real agent from an empty folder — instructions, model, tools, skills, and a channel — learning each building block as we add it."
series: "eve-core"
releaseDate: 2026-07-18
sourceUrl: "https://eve.dev/docs/introduction"
difficulty: "Beginner"
estMinutes: 40
img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000&auto=format&fit=crop"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

Think of Eve as "Next.js for agents." Instead of one giant config object, your agent is a **folder of ordinary files**: instructions in Markdown, tools in TypeScript. Eve discovers the structure and turns it into an agent that runs locally, serves HTTP, connects to other platforms, and keeps working across many turns.

::BlogAlert{type="info"}
Based on the official [Eve introduction](https://eve.dev/docs/introduction). We're learning to *use* what it ships, not restating the docs.
::

## What we're building

A **Personal Research Assistant**. By the end of the series it has an identity, a chosen model, a weather tool, a research playbook (skill), and a channel so you can talk to it. Each lesson extends the same project.

## How this series works

Each step takes one building block through the same path: **What it is → Why you'd care → Before → After → Do it yourself → Gotchas → Recap.**

Mark steps complete as you go — progress is saved in your browser. Start with step one.
```

- [ ] **Step 2: Verify frontmatter parses**

Run from repo root: `vp check` (or open `apps/web` dev server and visit `/learn/eve-core`).
Expected: no YAML/frontmatter errors; `index.md` appears under the learn collection.

- [ ] **Step 3: Commit**

```bash
git add apps/web/content/learn/eve-core/index.md
git commit -m "content: add Eve core series landing page"
```

---

### Task 1: Instructions & first run (`01-instructions.md`)

**Files:**
- Create: `apps/web/content/learn/eve-core/01-instructions.md`

- [ ] **Step 1: Write the lesson**

```markdown
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
eve
```

Then ask: *"What's the difference between durable and ephemeral execution?"* — the agent answers from its instructions.

## Do it yourself

1. Run `npx eve@latest init my-agent` and `cd my-agent`.
2. Open `agent/instructions.md` and set an identity plus two guardrails.
3. Run `eve` and hold a short conversation.
4. Confirm the agent stays in character and respects your guardrails.

## Gotchas

- `instructions.md` is always in context — keep it specific, not a novel.
- The filename matters: `instructions.md` is the reserved name Eve discovers automatically.

## Recap

`instructions.md` is your agent's brain. One file, one `npx eve init`, and you have a talking agent. Next, we choose its model.
```

- [ ] **Step 2: Verify it builds** — `vp check`; no frontmatter errors.
- [ ] **Step 3: Commit** — `git add apps/web/content/learn/eve-core/01-instructions.md && git commit -m "content: Eve lesson 1 — instructions"`

---

### Task 2: Pick a model (`02-agent-config.md`)

**Files:**
- Create: `apps/web/content/learn/eve-core/02-agent-config.md`

- [ ] **Step 1: Write the lesson**

```markdown
---
title: "Agent Config: Choose a Model"
description: "Add agent.ts with defineAgent to pick a model and configure the runtime. Eve uses a default model until you override it."
series: "eve-core"
order: 2
feature: "defineAgent / agent.ts"
sourceUrl: "https://eve.dev/docs/agent-config"
---

## What it is

`agent.ts` is where you configure the agent — most importantly, which model it uses. Eve picks a sensible default, so the file is optional until you want control.

## Why you'd care

Different tasks want different models (cheap vs. capable). `agent.ts` is the one place to set that, plus runtime options via the AI Gateway.

## Before

You rely on Eve's default model and can't tell which one is answering.

## After

```ts [agent/agent.ts]
import { defineAgent } from "eve";

export default defineAgent({
  model: "openai/gpt-5.4-mini",
});
```

Eve now routes calls through the chosen model. Runtime options (timeouts, retries, streaming) live here too, powered by the AI Gateway.

## Do it yourself

1. Create `agent/agent.ts` and `export default defineAgent({ model: "openai/gpt-5.4-mini" })`.
2. Run `eve` and confirm responses still work.
3. Swap the model string and re-run to feel the difference.

## Gotchas

- `agent.ts` is optional — only add it when you want to override the default.
- The model string format follows the AI Gateway convention (`provider/model`).

## Recap

`agent.ts` + `defineAgent` is your control panel: choose the model and tune the runtime. Next, we give the agent something to do — tools.
```

- [ ] **Step 2: Verify** — `vp check`.
- [ ] **Step 3: Commit** — `git commit -m "content: Eve lesson 2 — agent config"`

---

### Task 3: Tools (`03-tools.md`)

**Files:**
- Create: `apps/web/content/learn/eve-core/03-tools.md`

- [ ] **Step 1: Write the lesson**

```markdown
---
title: "Tools: Give Your Agent Hands"
description: "Define a typed tool in tools/ with defineTool and Zod. The filename becomes the tool name — no registry to maintain."
series: "eve-core"
order: 3
feature: "defineTool / tools/"
sourceUrl: "https://eve.dev/docs/tools"
---

## What it is

Tools are typed functions the model can call. Drop a TypeScript file in `tools/` and Eve discovers it; the filename becomes the tool name.

## Why you'd care

This is how an agent does things — fetch live data, hit an API, compute a result. No manual registration; the filesystem is the interface.

## Before

The agent can only talk. Ask for the weather and it guesses.

## After

```ts [agent/tools/get_weather.ts]
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Get the current weather for a city.",
  inputSchema: z.object({ cityName: z.string() }),
  async execute(input) {
    const res = await fetch(
      `${process.env.WEATHER_API_URL}/current?city=${input.cityName}`
    );
    const data = await res.json();
    return data.current_condition[0];
  },
});
```

Name the file `get_weather.ts` and the tool is `get_weather`. The Zod `inputSchema` types the arguments the model must provide.

## Do it yourself

1. Create `agent/tools/get_weather.ts` with the code above.
2. Run `eve` and ask *"What's the weather in Lisbon?"*
3. Confirm the model called the tool and returned typed data.
4. Add a second tool (e.g. a calculator) and call it.

## Gotchas

- The `inputSchema` (Zod) is what the model sees — make descriptions precise.
- The return value is what the model receives back; shape it for clarity.

## Recap

`tools/` turns a talking agent into a doing agent. Filename = tool name, Zod = typed input. Next, reusable playbooks via skills.
```

- [ ] **Step 2: Verify** — `vp check`.
- [ ] **Step 3: Commit** — `git commit -m "content: Eve lesson 3 — tools"`

---

### Task 4: Skills (`04-skills.md`)

**Files:**
- Create: `apps/web/content/learn/eve-core/04-skills.md`

- [ ] **Step 1: Write the lesson**

```markdown
---
title: "Skills: Reusable Playbooks"
description: "Add a Markdown skill that the agent loads only when relevant. Long procedures stay out of the system prompt until needed."
series: "eve-core"
order: 4
feature: "skills/"
sourceUrl: "https://eve.dev/docs/skills"
---

## What it is

Skills are Markdown playbooks in `skills/`. Each has a `description` frontmatter that tells Eve when it's useful. The agent loads the skill only when the task calls for it.

## Why you'd care

Instead of stuffing every procedure into `instructions.md`, you keep focused guidance available on demand — smaller prompt, sharper behavior.

## Before

A long research procedure lives in `instructions.md`, bloating every request.

## After

```md [agent/skills/deep_research.md]
---
description: Research unfamiliar topics
---

When the task is novel or ambiguous, gather evidence first, then answer.
1. Identify the smallest set of questions that resolve the ambiguity.
2. Search primary sources; note where each fact comes from.
3. Summarize findings before drawing conclusions.
```

The agent pulls in `deep_research` only when a research-shaped task arrives.

## Do it yourself

1. Create `agent/skills/deep_research.md` with the content above.
2. Run `eve` and ask a genuinely research-y question.
3. Confirm the agent followed the playbook's steps.

## Gotchas

- The `description` is how Eve decides relevance — write it for *discovery*, not just humans.
- Skills are not always in context; they're loaded on demand.

## Recap

`skills/` gives the agent on-demand expertise without inflating the prompt. Next, we let people actually talk to it.
```

- [ ] **Step 2: Verify** — `vp check`.
- [ ] **Step 3: Commit** — `git commit -m "content: Eve lesson 4 — skills"`

---

### Task 5: Channels (`05-channels.md`)

**Files:**
- Create: `apps/web/content/learn/eve-core/05-channels.md`

- [ ] **Step 1: Write the lesson**

```markdown
---
title: "Channels: Let People Talk to It"
description: "The same agent codebase serves the CLI, web chat, Slack, Discord and more. Add a channel file to surface your agent where people are."
series: "eve-core"
order: 5
feature: "channels/"
sourceUrl: "https://eve.dev/docs/channels/overview"
---

## What it is

Channels connect your agent to the places people talk — the terminal, a web chat, Slack, Discord, Teams. One agent codebase, many surfaces.

## Why you'd care

You write the agent once. Eve handles turning platform input into a message and delivering the response back in the right shape.

## Before

You can only talk to the agent via the local `eve` CLI.

## After

The local run already is a channel. To add Slack, drop a channel file:

```ts [agent/channels/slack.ts]
import { connectSlackCredentials } from "@vercel/connect/eve";
import { slackChannel } from "eve/channels/slack";

export default slackChannel({
  credentials: connectSlackCredentials("slack/my-agent"),
});
```

The same agent now answers in Slack. Web chat, Discord, and the rest follow the same pattern from `eve/channels/*`.

## Do it yourself

1. Run `eve` and hold a conversation in the terminal (your default channel).
2. Skim the docs `channels/overview` and add the Slack channel file above.
3. Confirm the agent answers from the same `instructions.md`/`tools` in both places.

## Gotchas

- Your tool code doesn't need to know which channel a message came from — Eve abstracts that.
- Each channel is its own file under `channels/`.

## Recap

Channels surface one agent everywhere. The CLI works out of the box; add a file to reach Slack, Discord, or web chat. Next: run it for real and see durability.
```

- [ ] **Step 2: Verify** — `vp check`.
- [ ] **Step 3: Commit** — `git commit -m "content: Eve lesson 5 — channels"`

---

### Task 6: Run, recap & next steps (`06-run-and-recap.md`)

**Files:**
- Create: `apps/web/content/learn/eve-core/06-run-and-recap.md`

- [ ] **Step 1: Write the lesson**

```markdown
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

1. Run `eve` and have a multi-turn conversation that uses your weather tool.
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
```

- [ ] **Step 2: Verify** — `vp check`.
- [ ] **Step 3: Commit** — `git commit -m "content: Eve lesson 6 — run & recap"`

---

## Self-Review Notes

- **Spec coverage:** All 7 files from the design exist as tasks (index + 6 lessons). Core path only; advanced topics referenced in lesson 6 per scope.
- **Placeholders:** None — every lesson has full frontmatter and real Eve code from the docs.
- **Type consistency:** `defineAgent`, `defineTool`, Zod `inputSchema`, `slackChannel` match Eve's documented API across tasks.
- **Verify step:** `vp check` at repo root validates frontmatter/collection parsing for each file before commit.
