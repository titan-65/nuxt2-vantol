---
kind: asset
title: "Blue Sky (AT Protocol) posting — feasibility research"
ticket: t1-blue-sky-api
---

# Blue Sky posting — feasibility research

**Verdict: FEASIBLE, and free.** Posting to Blue Sky from a self-hosted worker is the
easy part of this whole effort. Official TypeScript SDK, app-password auth, generous limits,
no API paywall. The only real design work is *threading* promos longer than 300 graphemes.

## Auth model

- **App password** (recommended for a single-account personal automation): create one at
  `bsky.app/settings/app-passwords` — it is *not* your main account password and can be
  revoked anytime. Held as an env var (`BLUESKY_HANDLE`, `BLUESKY_APP_PASSWORD`).
- Session: `com.atproto.server.createSession` with `{ identifier, password }` → returns
  `accessJwt` (short-lived, minutes) + `refreshJwt` (longer). SDK manages refresh automatically.
- **OAuth** (`@atproto/oauth-client-node`) also exists for delegated/per-user auth, but is
  overkill for one account. App password wins here.

## Posting

- SDK: **`@atproto/api`** (official, TypeScript) — perfect for our Node worker.
  `const agent = new BskyAgent({ service: 'https://bsky.social' }); await agent.login({...});`
  then `await agent.post({ text, createdAt: new Date().toISOString() })`.
- Under the hood: `com.atproto.repo.createRecord`, collection `app.bsky.feed.post`,
  record `{ $type, text, createdAt }`. Returns `{ uri, cid }`.
- Rich features available: `langs`, `facets` (links/mentions via byte-index spans),
  `embed` for **external website cards** (the blog URL preview — ideal for promo), images,
  quote posts.

## Limits (the real constraints)

- **Text: 300 graphemes per post** (enforced by the `app.bsky.feed.post` lexicon
  `maxGraphemes: 300`). A blog promo will usually exceed this → must **thread** (see below).
- **Content writes (per account):** 5,000 points/hour, 35,000/day. CREATE = 3 pts →
  ~1,666 creates/hour, ~11,666/day. A deploy-driven poster (a few posts ever) is nowhere near.
- **PDS request rate:** 3,000/5min per IP. `createSession`: 30/5min, 300/day per account.
- Blob (image) max 50 MB.

## Threading (how to post a longer promo)

Replies are first-class: a reply record carries `reply: { root: {uri,cid}, parent: {uri,cid} }`.
So a promo splits into a chain: post 1 (hook + blog link + website-card embed), each
subsequent post replies to the previous while referencing the same root. The draft step
(t6) should emit an ordered list of ≤300-grapheme segments; the publish adapter posts them
in sequence, wiring `root`/`parent` refs from the returned URIs/CIDs.

## Cost

**Free.** No API paywall, no tier, no per-call charge. App passwords are free. (Direct
contrast with X, whose write API requires a paid Basic tier.)

## What the "draft staged in repo" model changes

Nothing about feasibility — it *simplifies* it. The deploy-time worker needs **zero** Blue
Sky access: it only writes `social/drafts/<slug>.md`. Only the later **publish adapter**
(run by the human) needs the app password + `@atproto/api`. So the credential surface is
small and human-gated.

## Minimal publish snippet (for the t6 adapter)

```ts
import { BskyAgent } from '@atproto/api'

const agent = new BskyAgent({ service: 'https://bsky.social' })
await agent.login({ identifier: process.env.BLUESKY_HANDLE!, password: process.env.BLUESKY_APP_PASSWORD! })

// single post
await agent.post({ text: 'New post: <title> <url>', createdAt: new Date().toISOString() })

// threaded promo: post segments[0], then reply with each subsequent segment
let root, parent
for (const seg of segments) {
  const res = await agent.post({ text: seg, createdAt: new Date().toISOString(),
    ...(parent ? { reply: { root, parent } } : {}) })
  if (!root) root = { uri: res.uri, cid: res.cid }
  parent = { uri: res.uri, cid: res.cid }
}
```

## Sources

- Posts guide: https://docs.bsky.app/docs/advanced-guides/posts
- Get started (session + post): https://docs.bsky.app/docs/get-started
- Rate limits: https://docs.bsky.app/docs/advanced-guides/rate-limits
- SDK: https://www.npmjs.com/package/@atproto/api
