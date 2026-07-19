---
title: "Step 5: Deploy to Vercel"
description: "Take the digest agent to production: eve build, a vercel() sandbox backend, real auth replacing placeholderAuth, vercel deploy. The schedule becomes a Vercel Cron Job (UTC) and the digest runs unattended."
series: "eve-capstone"
order: 5
feature: "eve build / vercel deploy"
sourceUrl: "https://eve.dev/docs/guides/deployment"
---

## What it is

Going from `eve dev` to production is mostly mechanical. `eve build` compiles the agent and, when `VERCEL` is set, writes the Vercel Build Output bundle under `.vercel/output` and prewarms Vercel Sandbox templates. `vercel deploy` ships it; schedules become **Vercel Cron Jobs**.

## Why you'd care

The capstone only pays off live. Once deployed, the cron fires in UTC, the `researcher` subagent runs on Vercel Sandbox, and the digest lands in Slack every morning with no laptop involved. Deploy also gives you the Agent Runs dashboard for observability.

## Before

Everything runs under `eve dev` on your machine. No deployment, no sandbox prewarm, no cron, no observability.

## After

**1. Sandbox backend.** On Vercel, attach `vercel()`:

```ts [agent/sandbox/sandbox.ts]
import { defineSandbox } from "eve/sandbox";
import { vercel } from "eve/sandbox/vercel";

export default defineSandbox({ backend: vercel() });
```

**2. Route auth.** The scaffolded `placeholderAuth()` lives in `agent/channels/eve.ts` on the `eveChannel` factory — not on `defineAgent` (which has no `auth` field). It rejects production browser traffic by default (fails closed), so swap in a real policy there:

```ts [agent/channels/eve.ts]
import { eveChannel } from "eve/channels";
import { httpBasic } from "eve/channels/auth";

export default eveChannel({
  auth: [httpBasic({ password: process.env.ROUTE_AUTH_BASIC_PASSWORD! })],
});
```

(Use `jwtHmac`, `oidc`, `vercelOidc`, or a custom `AuthFn` to match your setup. `defineAgent` only takes `model`, `reasoning`, `modelOptions`, `limits`, `experimental`, `outputSchema`, and `build`.)

**3. Build.**

```bash
eve build
```

On Vercel this writes `.vercel/output` and prewarms sandbox templates. A local `eve build` skips that unless you run `vercel build`.

**4. Environment and secrets.** Set in the deployment environment, never in source: a model credential (`AI_GATEWAY_API_KEY` or `ANTHROPIC_API_KEY`/`OPENAI_API_KEY`) and your route-auth secret. Plus the connection tokens from Step 2 (`LINEAR_API_TOKEN`, `GITHUB_TOKEN`) and the Slack Connect client.

**5. Deploy.**

```bash
vercel deploy
```

The deployed app serves the same `/eve/v1/...` routes as local. `agent/schedules/daily-digest.ts` becomes a **Vercel Cron Job** (UTC) — check **Settings → Cron Jobs** and run history under **Observability → Cron Jobs**.

## Do it yourself

1. Add `agent/sandbox/sandbox.ts` with `vercel()`.
2. Replace `placeholderAuth()` in `agent/channels/eve.ts` with a real policy (`httpBasic`, `jwtHmac`, etc.).
3. Set model credential, route-auth secret, `LINEAR_API_TOKEN`, `GITHUB_TOKEN`, and the Slack Connect client in the Vercel project env.
4. `eve build` locally; open `.eve/` to confirm your surfaces will load.
5. `vercel deploy`.
6. In the dashboard, confirm **Settings → Cron Jobs** lists `daily-digest` and that it's scheduled in UTC.
7. Smoke-test the live schedule:

```bash
curl -X POST https://<your-app>/eve/v1/dev/schedules/daily-digest
```

and confirm the digest arrives in the Slack channel. Also check a health route:

```bash
curl https://<your-app>/eve/v1/health
```

8. Open **Observability → Cron Jobs** to watch the next real 08:00 UTC fire.

## Gotchas

- **`VERCEL` drives the output.** Hosted Vercel builds emit `.vercel/output` + prewarm; local `eve build` doesn't. A failed prewarm fails the build, not post-deploy.
- **Auth fails closed.** An unconfigured app rejects production traffic by default — configure the auth on `agent/channels/eve.ts` before launch.
- **Cron is UTC.** Your `"0 8 * * *"` is 08:00 UTC. Confirm that's the wall-clock time you want.
- **Self-host alternative.** `eve build && PORT=3000 eve start --host 0.0.0.0` writes Nitro output under `.output/` and runs the schedule runner. Forward both `/eve/` and `/.well-known/workflow/`.
- **Observability.** The Agent Runs dashboard (feature-gated) shows sessions and traces; it's separate from any OTel exporter in `instrumentation.ts`.

## Recap

`eve build` + `vercel deploy`, a `vercel()` sandbox backend, real auth, and env secrets take the digest agent live. The schedule becomes a Vercel Cron Job firing in UTC, the `researcher` runs on Vercel Sandbox, and the digest lands in Slack unattended. That closes the capstone — connections, subagents, schedules, and deploy, composed into one production agent.
