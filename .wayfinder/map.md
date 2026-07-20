---
kind: spec
title: "Deploy-triggered Blue Sky promo drafting — feasibility & architecture"
---

## Destination

A **feasibility verdict + recommended architecture** (no build in this effort) for an
automated system that, when a blog post or tutorial is **deployed** to this repo, has AI
**draft a Blue Sky promo post** from the post's content and **commit the draft back to the
repo** for human review/publish. This effort ends with a go/no-go decision and a design the
user can green-light later — it does *not* ship code.

## Settled design (from grilling — the thing being assessed)

These are locked; tickets below assess *how* to build it, not whether we want it:

- **Trigger:** repo deploy (Vercel deploy success), not a manual command.
- **Input:** the post's **source content at deploy time** (markdown + frontmatter in
  `apps/web/content/blog`), *not* a scrape of the rendered URL. The URL is the trigger handle
  and becomes the link in the post.
- **Output:** a Blue Sky promo draft (post text + the post URL) written to
  `social/drafts/<slug>.md`, committed to the repo.
- **Approval:** human-in-the-loop — AI drafts, the user reviews in the git flow and publishes
  later via an adapter.
- **Scope:** Blue Sky first; X is a later adapter (its paid write-API is out of scope here).
- **AI:** a **local/open model** (e.g. via Ollama) — free and private.
- **Runtime:** a **self-hosted worker** on a machine the user controls, triggered by the
  Vercel deploy webhook, running the local model and committing the draft.

## Notes

- Repo is a Nuxt 4 + `@nuxt/content` blog monorepo (`@vvantol2000/web`); posts in
  `apps/web/content/blog/*.md` with frontmatter `title/description/date/tag/keywords/...`.
- Tracker: local-markdown (`.wayfinder/`) — delete the folder to discard the whole map.
- Skills to consult while resolving tickets: `/research` (API facts), `/prototype`
  (local-model quality), `/grilling` + `/domain-modeling` (worker design decisions).
- Biggest feasibility risks, in order: (1) local-model *quality* for punchy social copy,
  (2) Vercel deploy webhook → which slug changed, (3) Blue Sky API specifics.

## Decisions so far

- [Vercel deploy webhook — trigger mechanics](tickets/t2-vercel-webhook.md) — FEASIBLE: `deployment.succeeded` (filter production); payload content-blind → worker diffs git SHA to find changed `content/blog` slugs; recommend **polling** Deployments API (no public URL). [detail](../assets/t2-vercel-webhook.md)

## Not yet specified

- Handling **multiple posts** deployed in one deploy (one draft each? batch?).
- **Notifications** when a draft is ready (GitHub comment? push? none?).
- Other targets beyond Blue Sky (Mastodon/Threads) as future adapters.
- **X adapter** specifics (paid Basic tier, ~$100/mo write access) — deferred, out of scope.
- Draft **storage/PR strategy** (commit to main vs open a PR vs a drafts branch).

## Out of scope

- **X automated posting** (paid write-API) — deferred to a later effort; Blue Sky proves the pattern.
- **Fully automatic publishing** (no human review) — explicitly rejected for the first cut.
- **AI writing the blog post itself** — the user authors; AI only promotes.
