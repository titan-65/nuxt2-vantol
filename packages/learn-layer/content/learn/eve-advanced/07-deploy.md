---
title: "Deploy: Ship to Production"
description: "Take the agent from eve dev to Vercel or your own host. The eve build/deploy flow, .vercel/output, sandbox backend, auth, schedules becoming Vercel Cron Jobs, and observability in the Agent Runs dashboard."
series: "eve-advanced"
order: 7
feature: "eve build / eve deploy"
sourceUrl: "https://eve.dev/docs/guides/deployment"
---

## What it is

Eve runs the same way locally, on Vercel, and on a long-running Node host, so going from `eve dev` to production is mostly mechanical. `eve build` compiles the agent and writes host output. When `VERCEL` is set (every hosted Vercel build sets it), it writes the Vercel Build Output bundle under `.vercel/output`; a plain local `eve build` skips that. Either way you get compiled framework artifacts under `.eve/` (discovery manifest, compiled manifest, diagnostics, module map). Nitro is the HTTP host layer, so the same health, session, stream, channel, callback, and schedule routes serve outside the dev server.

## Why you'd care

You want the agent live — reachable over HTTP, durable, observable, and wired to its channels — without re-architecting. The checklist covers build output, env/secrets, sandbox backend, auth, deploy, and verify in one pass.

## Before

The agent runs only under `eve dev` on your laptop. No deployment, no sandbox prewarm, no cron jobs, no observability.

## After

**1. Build.**

```bash
eve build
```

On Vercel this writes `.vercel/output` and prewarms reusable Vercel Sandbox templates. Locally it's skipped unless you run `vercel build`. If build-time prewarm fails, the build fails — local builds must be linked to a Vercel project with sandbox-provisioning credentials.

**2. Environment and secrets.** Set in the deployment environment, never in source: a model credential (Vercel AI Gateway via project OIDC, or `AI_GATEWAY_API_KEY`, or a direct provider key like `ANTHROPIC_API_KEY`/`OPENAI_API_KEY`) and route-auth secrets (`ROUTE_AUTH_BASIC_PASSWORD`, JWT/OIDC signing keys). Route-auth secrets are never serialized into compiled artifacts; the runtime re-materializes them from your channel definition.

**3. Model routing.** A string id is gateway-routed (`model: "anthropic/claude-opus-4.8"`); a provider object calls the provider directly (`model: anthropic("claude-opus-4-8")`, needs `@ai-sdk/anthropic` + `ANTHROPIC_API_KEY`).

**4. Sandbox backend.** On Vercel, attach `vercel()`:

```ts [agent/sandbox/sandbox.ts]
import { defineSandbox } from "eve/sandbox";
import { vercel } from "eve/sandbox/vercel";

export default defineSandbox({ backend: vercel() });
```

Omit `backend` and eve falls back to `defaultBackend()` (Vercel on hosted builds, local elsewhere). For self-host, use `docker()`/`microsandbox()` and don't pin `vercel()`.

**5. Auth.** Replace any scaffolded `placeholderAuth()` with a real policy (`httpBasic()`, `jwtHmac()`, `jwtEcdsa()`, `oidc()`, `vercelOidc()`, or a custom `AuthFn`) before the first production request. The default rejects production browser traffic — it fails closed.

**6. Deploy on Vercel.**

```bash
vercel deploy
```

The deployed app serves the same `/eve/v1/...` routes you hit locally. Schedules from `agent/schedules/` become **Vercel Cron Jobs** (UTC); check **Settings → Cron Jobs** and run history under **Observability → Cron Jobs**.

**7. Deploy without Vercel.**

```bash
eve build
PORT=3000 eve start --host 0.0.0.0
```

This writes standard Nitro output under `.output/` instead of `.vercel/output` and starts Nitro's schedule runner. If a reverse proxy sits in front, forward **both** `/eve/` and `/.well-known/workflow/` — the workflow dispatch route lives under `/.well-known/workflow/`; a proxy restricted to `/eve/` lets sessions start but silently stalls runs.

## Do it yourself

1. Run `eve build` locally; open `.eve/` to confirm which authored surfaces will load.
2. Set your model credential and route-auth secret in the deployment environment.
3. Confirm `agent/sandbox/sandbox.ts` uses `vercel()` (or `defaultBackend()`), and replace `placeholderAuth()` with a real policy.
4. `vercel deploy` (or `eve build && eve start` for self-host).
5. Smoke-test the live routes:

```bash
curl https://<your-app>/eve/v1/health
curl -X POST https://<your-app>/eve/v1/session \
  -H 'content-type: application/json' \
  -d '{"message":"Hello from production"}'
```

Or drive the deployment with the dev TUI: `eve dev https://<your-app>` (set `VERCEL_AUTOMATION_BYPASS_SECRET` if it uses preview protection). 6. Open the **Agent Runs** tab under **Observability** in the Vercel dashboard (feature-gated; ask your Vercel contact to enable it) to browse sessions and traces.

## Gotchas

- **`VERCEL` drives the output.** Hosted Vercel builds emit `.vercel/output` + prewarm; local `eve build` doesn't. A failed prewarm fails the build, not post-deploy.
- **Auth fails closed.** An unconfigured app rejects production browser traffic by default — configure `placeholderAuth()`'s replacement before launch.
- **Forward both prefixes when self-hosting.** `/eve/` and `/.well-known/workflow/`. Missing the workflow prefix stalls runs forever.
- **Self-hosted workflow state.** The local Workflow world persists under `.eve/.workflow-data`; put that on persistent storage, or select another world via `experimental.workflow.world` in `agent.ts`. Pin the `@workflow/*` line to match your eve release.
- **Observability.** Agent Runs is separate from the OpenTelemetry exporters in `instrumentation.ts` — both work; OTel is the path for Braintrust/Datadog spans.
- **Schedules need the schedule runner.** `eve start` runs it; a custom HTTP-only host that skips Nitro scheduled tasks won't fire schedules.

## Recap

`eve build` compiles to `.vercel/output` on Vercel (with sandbox prewarm) or Nitro Node output elsewhere. Set model + route-auth secrets, pick the sandbox backend, replace `placeholderAuth()`, then `vercel deploy` (or `eve build && eve start`). Schedules become Vercel Cron Jobs; the Agent Runs dashboard gives observability. That's the full arc — from a folder of files to a durable, deployed agent.
