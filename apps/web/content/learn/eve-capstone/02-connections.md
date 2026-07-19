---
title: "Step 2: Wire GitHub and Linear Connections"
description: "Add MCP connections for GitHub and Linear so the agent can read recent PRs, commits, and issues by qualified tool name. Covers defineMcpClientConnection, env tokens, and the github__*/linear__* tool names."
series: "eve-capstone"
order: 2
feature: "defineMcpClientConnection / connections/"
sourceUrl: "https://eve.dev/docs/connections"
---

## What it is

A connection wires the agent into an external MCP server — here GitHub and Linear. Eve discovers the remote tools and surfaces them to the model as qualified names (`github__*`, `linear__*`). Tokens resolve out of band and never reach the model. Connections live under `agent/connections/`; the runtime name is the filename.

## Why you'd care

The digest needs real activity: recently merged PRs, opened issues, cycle progress. Hand-rolling a GitHub and Linear client means auth, token refresh, schemas, and error mapping — twice. A connection collapses each into one file. The model gains `github__list_pull_requests`, `linear__list_issues`, and friends with zero integration code in your tools.

## Before

The agent only has its persona and any tools you authored. To read GitHub or Linear you'd wrap their APIs by hand.

## After

**Linear** — app-scoped token via `getToken`:

```ts [agent/connections/linear.ts]
import { defineMcpClientConnection } from "eve/connections";

export default defineMcpClientConnection({
  url: "https://mcp.linear.app/mcp",
  description: "Linear workspace: issues, projects, cycles, and comments.",
  auth: {
    getToken: async () => ({ token: process.env.LINEAR_API_TOKEN! }),
  },
});
```

**GitHub** — same shape, its MCP URL:

```ts [agent/connections/github.ts]
import { defineMcpClientConnection } from "eve/connections";

export default defineMcpClientConnection({
  url: "https://api.githubcopilot.com/mcp",
  description: "GitHub: repositories, pull requests, issues, and commits.",
  auth: {
    getToken: async () => ({ token: process.env.GITHUB_TOKEN! }),
  },
});
```

The model now sees `linear__list_issues`, `github__list_pull_requests`, `github__list_commits`, etc. Tool names are the connection prefix plus the remote tool name, joined by `__`.

## Do it yourself

1. Create `agent/connections/linear.ts` and `agent/connections/github.ts` with the examples above.
2. Add `LINEAR_API_TOKEN` and `GITHUB_TOKEN` to `.env` (never commit secrets).
3. Run `eve dev` and ask *"List my open Linear issues and recent GitHub PRs."* Confirm the model calls `linear__list_issues` and `github__list_pull_requests`.
4. Try *"Summarize what changed in the last 24 hours across both."* The model should `connection_search` then call the qualified tools.
5. Leave the research depth shallow for now — the `researcher` subagent takes over deep-dives in Step 3.

## Gotchas

- **App-scoped auth for background work.** Schedules and local dev have no end-user principal, so `connect("linear/myagent")` (user-scoped) fails `principal_required` there. Use `principalType: "app"` (the `getToken` form above) for agent-owned reads.
- **Tokens never reach the model.** The URL and credential are brokered by eve; they stay out of conversation history.
- **Qualified names are the contract.** The model calls `github__list_pull_requests`, not `list_pull_requests`. If it drops the prefix, the call fails. Point it at the connection name in your instructions.
- **Per-connection approval optional.** Read-only digests rarely need it. Add `approval: once()` from `eve/tools/approval` only if you later let the agent write.

## Recap

Two `defineMcpClientConnection` files give the root read access to GitHub and Linear by qualified tool name, with tokens brokered out of band. Next: add the `researcher` subagent that deep-dives on each item.
