# Wayfinder Map: Eve Advanced Series + Capstone

> Local-markdown tracker (no issue tracker configured on this repo's remote `titan-65/nuxt2-vantol`). Adapted from the wayfinder skill: this file is the `wayfinder:map` artifact; tickets are sections below.

## Destination

A published **advanced Eve tutorial series** at `apps/web/content/learn/eve-advanced/` (7 lessons, audience = devs who finished `eve-core`) **plus a capstone tutorial** that builds, wires, and deploys one real multi-capability agent. Both follow the established `learn/` format (index + `NN-slug.md`, the _What it is → Why → Before → After → DIY → Gotchas → Recap_ path, real Eve API only).

## Notes

- Audience: web devs new to agents who completed the core series. Assume `instructions.md`, `agent.ts`, `tools/`, `skills/`, `channels/` are known.
- Voice/format mirror `learn/nuxt-4-4/` and `learn/eve-core/`.
- Every code sample must use the real, documented Eve API (verified from eve.dev during each ticket).
- Series slug proposed: `eve-advanced`. Capstone slug proposed: `eve-capstone`.

## Decisions so far

- Core series (`eve-core`, 7 files) is complete and is the prerequisite.
- Advanced topics confirmed from docs: `connections/`, `sandbox/`, `subagents/`, `schedules/`, `hooks/` — plus `evals/` (real API found at `/docs/evals/*`) and deploy (`/docs/guides/deployment`).
- Subagent semantics confirmed: built-in root `agent` tool (copy of root) vs declared `subagents/<id>/` specialists; name = path basename; collides with tool names → must stay distinct.
- **Capstone confirmed:** _Daily Research Digest_ agent (schedules + connections + subagents + deploy). Slugs confirmed: `eve-advanced` + `eve-capstone`.
- Both series authored (8 files each): `apps/web/content/learn/eve-advanced/` (index + 01–07) and `apps/web/content/learn/eve-capstone/` (index + 01–05). Not committed (repo rule).

## Not yet specified (fog)

- **Evaluations API** — `/docs/evaluations` 404'd. Verify exact define/run surface during L6.
- **Deploy CLI** — exact `eve` deploy command / Vercel flow 404'd. Verify during L7.
- **Human-in-the-loop** — approval helpers (`once()`/`always()`/`never()` from `eve/tools/approval`) confirmed in connections docs; decide whether it gets its own lesson or folds into L1 (connections) + L3 (subagents). Lean: fold into L1.
- **Capstone scope** — candidate: a _Daily Research Digest_ agent using schedules (cron digest) + connections (GitHub/Linear) + subagents (researcher) + deploy. Confirm during capstone ticket.

## Out of scope

- `eve-core` content (done).
- Non-agent Vercel products (Fluid Compute, CDN, etc.).
- Rewriting the blog engine or `learn/` collection schema.

---

## Tickets (frontier)

### T1 — Advanced L1: Connections

Research + write `01-connections.md`. MCP/OpenAPI connections, `defineMcpClientConnection`/`defineOpenAPIConnection`, app vs user auth, `connect()` via Vercel Connect, per-connection approval (`once()`), token brokering. Tool-qualified names `<connection>__<tool>`.

### T2 — Advanced L2: Sandbox

Research + write `02-sandbox.md`. Default sandbox + built-in `bash`/`read_file`/`write_file`; `ctx.getSandbox()`; seeding `agent/sandbox/workspace/`; `defineSandbox` (shorthand vs folder layout); backends (`vercel()`/`docker()`/`microsandbox()`/`justbash()`/`defaultBackend()`); network policy + credential brokering.

### T3 — Advanced L3: Subagents

Research + write `03-subagents.md`. Built-in `agent` tool (parallel copies) vs declared `subagents/<id>/` (`defineAgent` + required `description`); isolation boundary table; `outputSchema` task mode; naming collision rule.

### T4 — Advanced L4: Schedules

Research + write `04-schedules.md`. `defineSchedule` with `cron`; markdown (fire-and-forget task mode) vs `run` handler; `receive`/`waitUntil`/`appAuth`; dev dispatch route; Vercel Cron Jobs mapping.

### T5 — Advanced L5: Hooks

Research + write `05-hooks.md`. `defineHook` + `events` map; lifecycle events; `toolResultFrom` narrowing; execution order; hook vs tool vs provider.

### T6 — Advanced L6: Evaluations (fog: verify API)

Research (resolve evaluations API) + write `06-evaluations.md`. Define eval suites, scoring rubrics, run on deploy + schedule.

### T7 — Advanced L7: Deploy to Vercel (fog: verify CLI)

Research (resolve deploy command) + write `07-deploy.md`. `eve` build/deploy flow, `.vercel/output`, cron jobs in production, observability.

### T8 — Capstone: Build & deploy a real agent

Research + write capstone series (own `index.md` + lessons). Candidate: _Daily Research Digest_ combining schedules + connections + subagents + deploy. Confirm scope at ticket start.

---

## Execution order

T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8. Each ticket: research any fog, then author via the same subagent flow used for `eve-core` (write files, no commit unless asked, verify with `vp check`).
