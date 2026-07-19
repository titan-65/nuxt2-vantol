---
kind: ticket
title: "Vercel deploy webhook — trigger mechanics"
type: research
hitl: false
status: 2
blockedBy: []
claimedBy: opencode (traycer agent ce004cf0)
---

## Question

How does a self-hosted worker learn "a blog post just deployed," and which one? Assess:

- Vercel **deploy hooks / webhook events** (e.g. `deployment.succeeded`): how to register a
  target URL, payload shape, and signature verification.
- What the payload tells us about **which content changed** — does it expose routes/paths, or
  only deploy metadata (URL, env, status)?
- If the webhook is content-blind, the worker must diff **what changed in
  `apps/web/content/blog`** between deploys (git ref of last deploy vs current). Explore that
  mapping: identify added/updated `.md` slugs from the deploy delta.
- Network: how the worker (on the user's machine) receives the webhook — public URL, tunnel,
  or polling the Vercel API for latest deploy + git sha.

Deliver a markdown summary: the exact trigger path recommended, payload fields, and how the
worker resolves *which slug(s)* to draft for. Feeds the worker architecture (t5).

## Resolution

**FEASIBLE.** Use `deployment.succeeded` (filter `target === "production"`). Payload is
content-blind — it carries the deploy's git SHA (`meta.githubCommitSha`) but **not** which
files changed. So the worker diffs `git diff --name-only <lastSha> <newSha> --
apps/web/content/blog` to get the changed slugs, idempotent via `lastProcessedSha`.
Recommended trigger for a self-hosted worker: **poll** `GET /v6/deployments?target=production`
(read-only `VERCEL_TOKEN`) — no public URL needed. Webhook alternative requires a public
endpoint + `x-vercel-signature` HMAC verify. Neither needs Blue Sky creds at deploy time.

Full summary: `../assets/t2-vercel-webhook.md`

Unblocks: t5 (worker arch) partially; t4 still waits on t3.
