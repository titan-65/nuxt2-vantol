---
title: "Void: Ship Vite Apps at Warp Speed — The Deployment Platform Built for Vite"
description: "Void is VoidZero's new deployment platform for Vite — a Vite plugin + backend SDK + edge runtime that turns your imports into infrastructure. Here's what it is, how it works, and why it matters for Nuxt apps like this one."
date: 2026-08-28
tag: "Technology"
img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1775009589/viteplus_et4prw.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1767533048/PXL_20251010_202726442_2_hhudfr.jpg"
  website: "https://vantolbennett.com"
readTime: 10
keywords: [void, voidzero, vite, vite-plus, deployment, cloudflare, nuxt, d1, edge, fullstack]
language: "TypeScript"
rating: 5
---

# Introduction

If Vite changed how we build frontends, **Void** wants to change how we ship them.

Built by [VoidZero](https://voidzero.dev) — the team behind Vite, Vitest, Rolldown, and Oxc, led by Evan You — Void is a deployment platform designed specifically for Vite apps. Not a generic host with Vite support bolted on. A platform where `vite dev` and production share the same runtime, and your source code _is_ your infrastructure config.

One plugin. One command. Live at `your-app.void.app`.

<!--more-->

::BlogAlert{type="info"}
Void is in **Private Beta** as of August 2026. Not recommended for mission-critical production yet — but perfect for prototyping, learning, and early adoption. Back up your data if you deploy.
::

# What Is Void?

Void combines three things:

1. **A Vite plugin** — `voidPlugin()` — that scans your code and wires up the platform
2. **A backend SDK** — `void/db`, `void/kv`, `void/storage`, `void/ai`, queues, crons, auth — built for the edge
3. **A deployment platform** — built on Cloudflare Workers, global from day one

```ts [vite.config.ts]
import { defineConfig } from "vite";
import { voidPlugin } from "void";

export default defineConfig({
  plugins: [voidPlugin()],
});
```

```bash
void deploy
# → https://your-app.void.app
```

That's the pitch from [void.cloud](https://void.cloud): write code, not config. Import what you need, skip what you don't, and `void deploy` handles builds, migrations, resource provisioning, and edge deployment.

# The Idea: Your Code Is Your Infra

Most stacks split your app and its platform into two worlds. You write code in one place, then stitch it to infrastructure with config files, dashboard clicks, and deployment scripts. Caching, scaling, and limits live somewhere else entirely.

Void closes that gap:

- `import { db } from 'void/db'` → local D1 database in dev + provisioned D1 in production
- `import { kv } from 'void/kv'` → local KV + provisioned KV
- `import { storage } from 'void/storage'` → local R2 + provisioned R2
- `import { ai } from 'void/ai'` → Workers AI inference, metered
- `import { queues } from 'void/queues'` / `defineScheduled` → queues and cron jobs

No `wrangler.toml` dance. No manual binding declarations. The plugin's **resource inference** scans your source at build time and provisions what you actually use.

::Callout{icon="⚡" title="Resource Inference = Zero Config"}
Void scans `routes/`, `pages/`, `middleware/`, `crons/`, `queues/` (or `src/`/`app/`/`server/` in framework mode) using `es-module-lexer` + regex + AST. If it sees `void/db`, you get `DB`. If it sees `env.KV`, you get `KV`. Override with `void.json` `inference.bindings` if needed.
::

```txt
vite.config.ts          → voidPlugin() (works with any Vite app)
import { db }           → D1 database (auto-provisioned)
import { kv }           → KV namespace (auto-provisioned)
import { storage }      → R2 bucket (auto-provisioned)
import { ai }           → Workers AI inference (metered)
db/schema.ts            → Drizzle schema (source of truth for DB types)
db/migrations/*.sql     → Applied to D1 on deploy
void deploy             → Live at https://<slug>.void.app
```

Same runtime locally and in production — `vite dev` runs your server code in the Workers runtime, with local D1/KV/R2 ready.

# Project Structure

Void is file-based and convention-driven. Every directory is optional — you only add what you use:

```txt
routes/          # API endpoints (Hono, file-based)
pages/           # Full-stack pages (React/Vue/Svelte/Solid)
middleware/      # Global middleware (01.logger.ts, 02.auth.ts)
db/              # Drizzle schema + SQL migrations
crons/           # Scheduled jobs (defineScheduled)
queues/          # Queue consumers (defineQueue)
src/             # Shared components/utils
public/          # Static assets (served as-is)
void.json        # Optional Void config (routing, inference, worker)
vite.config.ts   # Must include voidPlugin()
```

Routes are method exports:

```ts [routes/api/hello.ts]
import { defineHandler } from "void";

export const GET = defineHandler(() => {
  return { message: "Hello from Void" };
});
```

- Dynamic segments: `routes/users/[id].ts` → `/api/users/:id`
- Catch-all: `routes/search/[...query].ts` → `/api/search/*`
- Route groups: `(admin)/` organizes without affecting URL

Pages pair a component with a `.server.ts` loader/action:

```txt
pages/index.tsx         → /
pages/index.server.ts   → loader + action for /
pages/users/[id].tsx    → /users/:id
```

Layouts nest automatically. Markdown pages with frontmatter work out of the box.

# Quickstart in 4 Steps

```bash
npm install -D void
```

```bash
npx void init
# Choose Vite+ or Vite, framework, D1 vs PostgreSQL vs Static
```

Edit the generated route at `routes/api/hello.ts`, then:

```bash
npm run dev        # → http://localhost:5173
void auth login    # first time only
void deploy        # → https://<slug>.void.app
```

On deploy Void will build, detect migrations, provision resources you actually import, upload assets (cached), and ship to the edge. Add GitHub push-to-deploy with `void init --github`.

::BlogAlert{type="warning"}
Local dev for framework apps (Nuxt, SvelteKit, Astro) still needs `wrangler` installed — Void syncs inferred bindings into `wrangler.jsonc` so the Nitro/Cloudflare dev proxy and Void share `.wrangler/state/v3`.
::

# The Platform: What You Get

**Edge-native.** Deployed to Cloudflare Workers — your server runs close to users, scales without extra config, static assets served from the edge with proper cache headers.

- **Database:** D1 (SQLite) with read replication + Drizzle schema as source of truth, or PostgreSQL when you need heavier writes. `void db generate` handles migrations.
- **KV & Object Storage:** `void/kv` and `void/storage` (R2) — both typed, both local in dev.
- **AI:** `void/ai` → `ai.run('@cf/meta/llama-3.1-8b-instruct', { prompt })` on Workers AI.
- **Typed end-to-end:** Drizzle schema types → route handler inference → `typed fetch` client checks calls at the usage site. One Standard Schema validator drives runtime + compile-time types.
- **Platform primitives:** Cron jobs, queues, WebSockets, SSE, Live event streams, sandboxes, auth, ISR/revalidation, prerendering, redirects/rewrites, custom headers.
- **Secrets & env:** `void secret put KEY=value`, `void.json` + `env.ts` with build-time validation and a client-leak guard that fails the build if a server-only key reaches the browser.

```ts [crons/heartbeat.ts]
import { defineScheduled } from "void";
export const cron = "*/5 * * * *";
export default defineScheduled(async () => {
  // runs every 5 minutes
});
```

```ts [queues/email.ts]
import { defineQueue } from "void";
export default defineQueue(async (batch) => {
  for (const msg of batch.messages) {
    // process message
    msg.ack();
  }
});
```

You don't need a Cloudflare account to start. Every build still outputs a standard Cloudflare Worker, so you can self-host with your own `wrangler.json` later via the [Cloudflare integration](https://void.cloud/integrations/cloudflare).

# Nuxt Integration — Why This Matters for the Web App

This portfolio runs on **Nuxt 4** (`apps/web` in this monorepo) — currently on Vercel + Firebase (Auth + Realtime Database for views, presence, comments, newsletter, guestbook). Void supports Nuxt directly:

```ts [nuxt.config.ts]
import { resolve } from "node:path";
import { voidPlugin } from "void";

export default defineNuxtConfig({
  nitro: { preset: "cloudflare-module", alias: { "@schema": resolve(__dirname, "db/schema.ts") } },
  vite: { plugins: [voidPlugin()] },
});
```

```jsonc [wrangler.jsonc]
{
  "name": "my-app",
  "compatibility_date": "2026-02-24",
  "compatibility_flags": ["nodejs_compat", "nodejs_als"],
}
```

Then in any Nitro route:

```ts [server/api/users.get.ts]
import { db } from "void/db";
import { users } from "@schema";

export default defineEventHandler(async () => {
  return db.select().from(users);
});
```

::BlogAlert{type="info"}
Nuxt caveat: Nitro bundles server routes outside Vite's pipeline, so `db.query.*` relational helpers aren't available — use `db.select().from(table)` instead. KV, R2, and AI work the same.
::

Void also works with TanStack Start, SvelteKit, Astro, React Router, Analog, and full Hono apps. For a Nuxt + Nuxt Content blog like this one, D1 + KV could replace Firebase for views/likes/comments with zero client SDKs, all at the edge.

# Void vs. Where We Are Now

| Concern      | Current (Vercel + Firebase)                   | Void (Cloudflare edge)                         |
| ------------ | --------------------------------------------- | ---------------------------------------------- |
| Hosting      | Vercel (Nitro preset `vercel`)                | Cloudflare Workers (`cloudflare-module`)       |
| Data         | Firebase RTDB, client-direct + rules          | D1/KV/R2, server-side, Drizzle-typed           |
| Auth         | Firebase Google OAuth                         | Void auth (framework mode: bring Better Auth)  |
| Dev parity   | Vite dev + Firebase emulator (separate)       | `vite dev` = Workers runtime + local D1/KV/R2  |
| Infra config | `firebase.json` + Vercel dashboard + env vars | Imports are infra — no extra files             |
| Deploy       | `vercel --prod` / git push                    | `void deploy` (migrations + provisioning auto) |

Migrating this blog to Void wouldn't be about chasing hype — it would be about collapsing three systems (Vercel, Firebase, Cloudinary) into one typed, file-based surface that `vp` already understands.

# Why Void?

- **Stop bridging app and platform** — one plugin connects Vite directly to the edge
- **Real runtime in dev** — no "works locally, breaks on deploy" mismatch
- **Types everywhere** — DB schema → server handlers → fetch client, all inferred
- **AI-native** — skills + MCP so coding agents can scaffold and ship in one prompt
- **Same Vite you know** — Void is from the VoidZero team that ships Vite, Vite+, Vitest, Rolldown, Oxc

::BlogCard

### The VoidZero Stack

Vite → Vitest → Oxlint/Oxfmt → Rolldown → Vite+ (`vp`) → **Void**. One team, one toolchain, from editor to edge. If Vite was the upgrade from Webpack, Void is the upgrade from gluing Vite to a host.
::

# What's Next: Build Jumble on Void

This post is the overview. Next we go hands-on with a real product: **Jumble Cookies**, a Jamaican cookie storefront built as a standalone Void + Vue app in `apps/jumble`.

::BlogCard

### The Interactive Series Is Live

Start here: **[Void in Practice: Build Jumble Cookies](/learn/void)** — an eight-stage build where every lesson embeds the actual app at that stage, not a screenshot.
::

**The eight stages:**

1. **[The Jumble Foundation](/learn/void/01-the-jumble-foundation)** — Void + Vue, the branded shell, and `/preview/:stage`
2. **Weekly menu** — D1 + Drizzle, a seeded rotating menu, and typed loaders
3. **[Storefront](/learn/void/03-the-storefront)** — cookie pages, box sizes, and typed page props
4. **[Box + cart](/learn/void/04-box-and-cart)** — KV sessions, the cart API, and a live drawer
5. **[Pickup + checkout](/learn/void/05-pickup-and-checkout)** — locations, pickup slots, validation, and orders in D1
6. **[Order status](/learn/void/06-order-status)** — polling, a confirmation queue, and a weekly menu cron
7. **[Admin + auth](/learn/void/07-admin-and-auth)** — protected menu and order operations
8. **[Ship](/learn/void/08-ship)** — R2 images, GitHub Actions, and the production domain

Stages 1–8 are live now. The blog reads the app URL from `NUXT_PUBLIC_JUMBLE_URL`; the app reads the stage from the lesson preview. One codebase, one deploy, eight real stages.

Each tutorial ships real code — no slides, just `vite dev` → `void deploy` → live URL.

---

Void is betting that the future of full-stack Vite isn't "pick a database, pick a host, wire them together" — it's "import it and ship." If they pull it off, `vp` + Void could be the most boringly productive way to build for the web in a long time. And boring, in tooling, is a compliment.
