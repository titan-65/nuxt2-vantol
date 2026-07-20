---
kind: ticket
title: "Blue Sky publishing API — feasibility"
type: research
hitl: false
status: 2
blockedBy: []
claimedBy: opencode (traycer agent ce004cf0)
---

## Question

Can a self-hosted worker post to Blue Sky, and what are the real constraints? Assess:

- Auth model: app password vs OAuth (AT Protocol / `atproto`), what a script needs to hold.
- Core call: `com.atproto.repo.createRecord` for a `app.bsky.feed.post`; libraries
  (`@atproto/api`) vs raw fetch.
- Hard limits: 300 grapheme characters per post; **threading** for longer promos
  (parent/reply chain) and how to split a draft across posts.
- Rate limits / spam guard for a low-volume deploy-driven poster.
- Cost: is posting free? (Expected: yes — no API paywall, unlike X.)
- Whether a draft *staged in the repo* (human publishes) changes what we need at all.

Deliver a markdown summary (linked asset) with: minimal post snippet, auth steps, limits,
and a clear feasibility verdict. This is the foundational gate for the whole design.

## Resolution

**FEASIBLE and free.** Official `@atproto/api` SDK + app-password auth (env vars, revocable,
not the main password). Post via `agent.post()` → `com.atproto.repo.createRecord`
(`app.bsky.feed.post`). Constraints: **300 graphemes/post** (thread via `reply.root/parent`
refs for longer promos), content-write limit ~1,666 posts/hr (irrelevant at our volume),
no cost. The repo-staged-draft model needs *no* Blue Sky access at deploy time — only the
later human-run publish adapter holds the app password.

Full summary + minimal publish snippet: `../assets/t1-bluesky-feasibility.md`

Unblocks: t5 (worker arch) and t6 (publish adapter) partially — both still wait on t2/t3.
