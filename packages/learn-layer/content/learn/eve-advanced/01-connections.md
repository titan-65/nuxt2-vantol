---
title: "Connections: Bring In External Tools"
description: "Wire your agent into MCP and OpenAPI services. Model calls remote tools by qualified name; auth tokens never reach the model. Covers app vs. user auth, Vercel Connect, and per-connection approval."
series: "eve-advanced"
order: 1
feature: "defineMcpClientConnection / connections/"
sourceUrl: "https://eve.dev/docs/connections"
---

## What it is

A connection wires your agent into an external server you don't author — an MCP server (Linear, GitHub, a warehouse) or any HTTP API with an OpenAPI document. Eve discovers the remote tools, surfaces them to the model, and brokers auth. Connections live under `agent/connections/`; the runtime name comes from the filename, so `agent/connections/linear.ts` registers as `"linear"`. The model discovers tools through `connection_search` and calls them by qualified name `<connection>__<tool>` (e.g. `linear__list_issues`). The URL and credentials never reach the model.

## Why you'd care

Hand-rolling a client for every third-party service means writing auth, token refresh, tool schemas, and error mapping yourself. Connections collapse all of that into a file. The model gets new capabilities (issue trackers, CRMs, payment APIs) without a single line of integration code in your tools, and you decide per connection whether the agent or the end-user owns the credential.

## Before

Your agent only has the tools you authored in `tools/`. To touch Linear, you'd write a tool that wraps the GraphQL API, manages a token, and re-maps errors. Three services in, that's three hand-rolled clients.

## After

Drop a file in `connections/` and the model can call remote tools by qualified name. App-scoped token via `getToken`:

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

The model now sees `linear__list_issues`, `linear__create_issue`, and the rest. An OpenAPI connection turns each operation into a tool:

```ts [agent/connections/warehouse.ts]
import { defineOpenAPIConnection } from "eve/connections";

export default defineOpenAPIConnection({
  spec: "https://warehouse.example.com/openapi.json",
  description: "The tenant data warehouse.",
});
```

No-auth (local/public only) means dropping `auth` entirely:

```ts [agent/connections/local.ts]
import { defineMcpClientConnection } from "eve/connections";

export default defineMcpClientConnection({
  url: "http://localhost:3001/mcp",
  description: "Local dev server.",
});
```

## Do it yourself

1. Create `agent/connections/linear.ts` with the `defineMcpClientConnection` example above and a `LINEAR_API_TOKEN` in your env.
2. Run `eve dev` and ask _"List my open Linear issues."_ Confirm the model calls `linear__list_issues`.
3. Add an OpenAPI connection from any public `openapi.json` you have, and confirm the model can call its operations.
4. Switch the Linear connection to Vercel Connect user auth (below) if you want each user to bring their own account.

**App vs. user auth.** `getToken` defaults to `principalType: "app"` (one shared credential). Use `principalType: "user"` when each end-user authorizes their own account — but user-scoped auth depends on route auth: the session must already carry a user principal, or the call fails with `principal_required`.

**Vercel Connect.** For interactive OAuth where each user signs in through their own browser:

```ts [agent/connections/linear.ts]
import { connect } from "@vercel/connect/eve";
import { defineMcpClientConnection } from "eve/connections";

export default defineMcpClientConnection({
  url: "https://mcp.linear.app/mcp",
  description: "Linear workspace: issues, projects, cycles, and comments.",
  auth: connect("linear/myagent"), // user-scoped shorthand
});
```

`"linear/myagent"` is the UID you chose when registering the Connect client. `connect("linear/myagent")` is shorthand for a user-scoped interactive OAuth connection: eve resolves a token for the active user, emits `authorization.required` if they haven't authorized yet, and resumes the parked turn after the callback. Make it app-scoped and non-interactive with:

```ts
auth: connect({ connector: "linear/myagent", principalType: "app" });
```

**Per-connection approval.** Put every tool a connection serves behind a human with helpers from `eve/tools/approval`:

```ts [agent/connections/linear.ts]
import { defineMcpClientConnection } from "eve/connections";
import { once } from "eve/tools/approval";

export default defineMcpClientConnection({
  url: "https://mcp.linear.app/mcp",
  description: "Linear workspace.",
  auth: { getToken: async () => ({ token: process.env.LINEAR_API_TOKEN! }) },
  approval: once(),
});
```

`never()` lets every call through, `once()` asks the first time in a session, `always()` asks every time. Same park/resume human-in-the-loop flow as tool approval.

## Gotchas

- **The model never sees the URL or token.** Auth is brokered by eve; tokens resolve and cache per step and stay out of conversation history.
- **User-scoped auth needs a user session.** A scheduled or local-dev run has no end-user principal, so `connect("linear/myagent")` (user) fails `principal_required` there. Use `principalType: "app"` for agent-owned background work.
- **`headers` stack on top of `auth`.** Use it for non-Bearer schemes (API-key headers) or per-caller values via a function form `headers: (ctx) => ({...})`.
- **Approval is separate from auth.** Order the user sees is approve, then sign in. The approval record survives the sign-in park, so there's no double prompt.

## Recap

Connections turn external MCP and OpenAPI services into model-callable tools by qualified name, with tokens brokered out of band. Pick app vs. user auth, wire Vercel Connect for interactive OAuth, and gate destructive tools with per-connection approval. Next: give the agent an isolated workspace for untrusted work.
