---
kind: asset
title: "Vercel deploy webhook — trigger mechanics research"
ticket: t2-vercel-webhook
---

# Vercel deploy webhook — trigger mechanics

**Verdict: FEASIBLE.** Vercel emits a `deployment.succeeded` (or `deployment.ready`) webhook
with a signing secret, but the payload is **content-blind** — it tells you a deploy happened,
not *which file* changed. The worker must resolve the post(s) by **diffing the deploy's git
commit** against the last-processed one. For a self-hosted worker the cleanest path is
**polling the Deployments API** (no public URL needed); a webhook is the real-time alternative
if a public endpoint exists.

## Trigger event

- Event: **`deployment.succeeded`** (fires after build + checks pass) or `deployment.ready`.
  Configure via Dashboard *Settings → Webhooks* (Account Webhooks, Pro/Enterprise teams) or
  REST `POST /v1/webhooks` with `{ url, events: ["deployment.succeeded"], projectIds: [...] }`.
- **Filter to production only:** webhooks fire for preview + production. Act only when
  `payload.target === "production"` (the live blog). For polling, `target=production`.

## Payload (what we actually get)

`deployment.succeeded` body:
```
{ id, type, createdAt, region,
  payload: {
    deployment: { id, meta, url, name },
    target,            // "production" | "staging" | null
    project: { id },
    plan, ... } }
```
- `payload.deployment.meta` is a Map. For Git-connected projects it carries the commit info
  (`githubCommitSha`, `githubCommitRef`, `githubCommitMessage`). The authoritative source is
  the **Deployments API**: `GET /v6/deployments/{id}` (or list) returns
  `deployment.meta.githubCommitSha` + `target`.
- **No list of changed files.** So "which post?" is answered by the worker, not Vercel.

## Resolving which slug(s) changed

Worker holds `lastProcessedSha`. On a new production deploy with `newSha`:
```
git fetch origin
git diff --name-only <lastProcessedSha> <newSha> -- apps/web/content/blog
# → e.g. apps/web/content/blog/foo.md  apps/web/content/blog/bar.md
```
- Slug = filename minus `.md`. Read each via t3's content-contract.
- If diff is empty (code-only deploy) → do nothing. Idempotent by tracking `lastProcessedSha`.
- Multiple changed files → draft one per slug (t5 handles batching).

## Receiving the signal — two options

**Option A — Polling (recommended for self-hosted worker).**
Worker runs on a cron/timer (every few min) and calls:
```
GET /v6/deployments?projectId=<id>&target=production&state=READY&limit=1
Authorization: Bearer $VERCEL_TOKEN
```
Compare returned deployment's `meta.githubCommitSha` to `lastProcessedSha`; if different,
diff + draft. **No public ingress required** — works behind NAT/firewall. Read-only
`VERCEL_TOKEN`. Free, low-volume.

**Option B — Webhook (real-time).**
- Endpoint URL must be **public**. For a self-hosted worker this means a tunnel
  (ngrok/cloudflared) or a VPS with a static public URL. Tunnel URLs are unstable → prefer a
  small always-on endpoint on a VPS, or a serverless receiver that enqueues the work.
- **Verify signature:** `x-vercel-signature` header = HMAC-SHA256(raw body, webhook secret).
  Reject on mismatch. Secret shown once at webhook creation.
- No Vercel token needed just to *receive*, but you still need the commit SHA → either trust
  `payload.deployment.meta.githubCommitSha` or look it up via the Deployments API.

## Recommendation for this effort

**Option A (polling).** The worker is already self-hosted on a machine the user controls;
blog deploys are infrequent, so polling every few minutes is free and eliminates the public-URL
problem entirely. Webhook (B) only if the user wants sub-minute latency and has a stable
public endpoint.

## Credentials the worker needs

- Polling: read-only `VERCEL_TOKEN` (Vercel account token) + `VERCEL_PROJECT_ID`.
- Webhook: the webhook `secret` (for signature verify) + a public URL.
- Neither path needs Blue Sky creds at deploy time (see t1).

## Sources

- Webhook setup: https://vercel.com/docs/webhooks
- Webhook API reference (events + payload): https://vercel.com/docs/webhooks/webhooks-api
- Create webhook (events enum, secret): https://vercel.com/docs/rest-api/webhooks/creates-a-webhook
- Deploy Hooks (contrast — these *trigger* deploys, not notify): https://vercel.com/docs/deployments/deploy-hooks
