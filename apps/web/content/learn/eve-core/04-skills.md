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
2. Run `eve dev` and ask a genuinely research-y question.
3. Confirm the agent followed the playbook's steps.

## Gotchas

- The `description` is how Eve decides relevance — write it for *discovery*, not just humans.
- Skills are not always in context; they're loaded on demand.

## Recap

`skills/` gives the agent on-demand expertise without inflating the prompt. Next, we let people actually talk to it.
