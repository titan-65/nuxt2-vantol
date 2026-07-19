---
kind: ticket
title: "Self-hosted worker — architecture"
type: grilling
hitl: true
status: 0
blockedBy: [t1, t2, t3]
---

## Question

Design the worker that turns "deploy succeeded" into "draft committed." Depends on the three
research tickets. Grill the open design decisions, e.g.:

- Receiving the webhook (t2): public endpoint vs tunnel vs poll; how it identifies the slug(s).
- Pipeline: detect changed post(s) → read source (t3) → call local model (t4 path) → render
  draft → write `social/drafts/<slug>.md` → commit (and/or open PR?).
- **Idempotency / de-dup:** don't re-draft a post already drafted for its current content
  (hash of content vs last-drafted hash).
- Handling multiple changed posts in one deploy.
- Failure modes: model down, webhook missed, commit conflict.
- Tech: a small Node script? Nuxt/Nitro task? Where it lives in this monorepo.

Deliver an architecture write-up (linked asset): component diagram, data flow, and the
concrete file/Module layout. Feeds the draft/publish adapter (t6) and the final verdict (t7).
