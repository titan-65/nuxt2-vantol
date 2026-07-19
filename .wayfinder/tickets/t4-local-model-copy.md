---
kind: ticket
title: "Local model — social-copy quality prototype"
type: prototype
hitl: true
status: 0
blockedBy: [t3]
---

## Question

Can a **local/open model** write punchy, on-brand Blue Sky promo from a post's frontmatter?
This is the #1 feasibility risk (quality, not plumbing). Build a cheap prototype:

- Pick a model runnable locally (e.g. via Ollama: `llama3.2`, `qwen2.5`, `mistral`) and a
  prompt that takes `title/description/keywords` (from t3's content-contract) and emits a
  ≤300-char Blue Sky post + optional 2–3 post thread.
- Run it against **3–4 real posts** from `apps/web/content/blog` (use t3's mapping).
- Judge: hook strength, accuracy (no hallucinated claims), character fit, brand voice.
  Human reviews the outputs.

Deliver the prototype (prompt + sample outputs) as a linked asset and a **quality verdict**:
is a local model good enough for draft-then-human-edit, or is a cloud model needed? This
directly drives the go/no-go.
