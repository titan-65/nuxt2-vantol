---
title: "Nuxt CLI v4: The Interactive Dev Panel"
description: "nuxt dev grows a pinned TUI with request-attributed logs, single-key shortcuts, takeover locks for agent-spawned servers, and nuxt curl / task / docs companions. Smaller, faster, same commands."
series: "nuxt-4-6"
order: 4
feature: "@nuxt/cli v4"
sourcePRs: ["https://github.com/nuxt/cli/releases/tag/v4.0.0"]
---

## What's new

Nuxt 4.6 ships **Nuxt CLI v4** as a dependency of `nuxt` — `npx nuxt upgrade --dedupe` gets it automatically. `nuxt dev` grows an interactive panel pinned to the bottom of the terminal: URLs, startup progress, single-key shortcuts (`r` restart, `o` open, `l` logs, `n` requests, `p` pages + server routes). Every request gets an id, so logs and errors attribute to the request that caused them. Prefer the classic output? Pass `--no-tui`.

## Why you'd care

"Why did it reload? Which config key changed? Which module is slow? Which request threw?" — the dev server now answers all four unprompted: it tells you why it reloaded or restarted, diffs `nuxt.config` keys, breaks down slow-start time and per-module setup cost. And the workflow papercuts are fixed: a save that changes nothing no longer restarts; hard restarts keep serving on the same port.

## Before

One scrolling log stream, unattributed errors, mystery restarts:

```bash
nuxt dev
# …pages of output, which request was that error for?
```

Two `nuxt dev` processes on one project fought over the port.

## After

The panel plus a `.nuxt/` lock file that coordinates multiple servers: a second `nuxt dev` (say, one started by an agent) takes over from or defers to yours. The same lock powers three new companions:

```bash
nuxt curl /api/users    # hit the running server without leaving the terminal
nuxt task cleanup       # trigger a server task against the running server
nuxt docs "routeRules"  # search the docs for your installed Nuxt version
nuxt preview --takeover # replace a running preview server
```

It's also dramatically leaner:

|                          | v3.37   | v4.0   |
| ------------------------ | ------- | ------ |
| `@nuxt/cli` install size | 13.1 MB | 3.5 MB |
| dependencies             | 70      | 31     |
| first paint              | 330 ms  | 50 ms  |
| port bound               | 338 ms  | 104 ms |
| memory at rest (Linux)   | 630 MB  | 440 MB |

## Do it yourself

1. Run `npx nuxt upgrade --dedupe`, then `nuxt dev` — explore the panel (`l`, `n`, `p`).
2. Trigger an error and confirm the request id ties the log line to the request in `n`.
3. Start a second `nuxt dev` in another terminal; take the takeover path.
4. Try `nuxt curl` against one of your own API routes from a third terminal.
5. Introduce a `nuxt.config.ts` syntax error — note the served error page that live-reloads when you fix it.

## Gotchas

Major version, minor migration: CLI requires Node.js v22.21+, v24.11+ or v26+; `nuxt init` is dropped (use `npm create nuxt@latest`); Nuxt 2 and `@nuxt/bridge` support is gone. None of that should bite Nuxt v4 users, but CI images pinned to old Node will — check them before upgrading.

## Recap

CLI v4 = interactive `nuxt dev` panel with request ids, restart reasons, and config diffs; lock-file coordination for agent-spawned servers; `nuxt curl`/`task`/`docs` companions; 73% smaller, 6.6x faster first paint. Node floor raised; `nuxt init` retired.
