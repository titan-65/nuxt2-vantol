---
title: "Sandbox: Isolate Untrusted Work"
description: "Every agent has an isolated /workspace with bash, file, glob, and grep tools. Get a live handle via ctx.getSandbox(), seed files, pick a backend, and lock down egress with network policy + credential brokering."
series: "eve-advanced"
order: 2
feature: "defineSandbox / ctx.getSandbox"
sourceUrl: "https://eve.dev/docs/sandbox"
---

## What it is

The sandbox is the agent's isolated bash environment: a filesystem rooted at `/workspace` where it can run shell commands, execute scripts, and read or write files without touching your app runtime. Every agent has exactly one. The built-in `bash`, `read_file`, `write_file`, `glob`, and `grep` tools already target it, and your authored code can too via `ctx.getSandbox()`. A working sandbox exists by default — override it only to add setup, seed files, pick a backend, or lock down the network.

## Why you'd care

Authored tools run in your app runtime with full `process.env`. That's the wrong place for untrusted or heavyweight work (running user-supplied code, parsing untrusted archives, building a repo). The sandbox gives the model shell and file access in an isolated VM while your secrets and app process stay clean. You control the backend, what's preinstalled, and exactly what the sandbox can reach on the network.

## Before

Your tools do everything in-process. Running a Python analysis means piping untrusted script into your server's shell — no isolation, full env exposure, no egress control.

## After

The default tools (`bash`, `read_file`, `write_file`, `glob`, `grep`) already run in `/workspace`. From an authored tool, get a live handle:

```ts [agent/tools/run_analysis.ts]
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Run a Python analysis script and return its output.",
  inputSchema: z.object({ script: z.string() }),
  async execute({ script }, ctx) {
    const sandbox = await ctx.getSandbox();
    await sandbox.writeTextFile({ path: "analysis/run.py", content: script });
    const result = await sandbox.run({ command: "python analysis/run.py" });
    return { stdout: result.stdout };
  },
});
```

`ctx.getSandbox()` is async and only works inside authored runtime execution. Relative paths resolve from `/workspace`; `sandbox.resolvePath("repo/build.py")` anchors a relative path to its absolute form.

**Long-running processes** use `spawn`:

```ts
const sandbox = await ctx.getSandbox();
const server = await sandbox.spawn({ command: "python -m http.server 8000" });
// ...do other work against the server...
await server.kill(); // SandboxProcess: stdout/stderr streams, wait(), kill()
```

## Do it yourself

1. In a tool, call `ctx.getSandbox()`, `writeTextFile` a script, and `run` it. Confirm stdout comes back.
2. Seed files by creating `agent/sandbox/workspace/` (this requires the folder layout `agent/sandbox/sandbox.ts`, not the top-level `agent/sandbox.ts` shorthand). Files mirror into `/workspace` with structure intact:

```text
agent/sandbox/
  sandbox.ts
  workspace/
    schema.sql          ← lands at /workspace/schema.sql
    scripts/run.sh      ← lands at /workspace/scripts/run.sh
```

3. Override the sandbox to choose a backend and run setup:

```ts [agent/sandbox/sandbox.ts]
import { defineSandbox } from "eve/sandbox";
import { vercel } from "eve/sandbox/vercel";

export default defineSandbox({
  backend: vercel({ resources: { vcpus: 2 } }),
  revalidationKey: () => "repo-bootstrap-v1",
  async bootstrap({ use }) {
    const sandbox = await use();
    await sandbox.run({ command: "apt-get install -y jq" });
  },
  async onSession({ use }) {
    await use({ networkPolicy: "deny-all" });
  },
});
```

**Backends:** `vercel()` (hosted Vercel Sandbox), `docker()` (local Docker CLI), `microsandbox()` (local VM, closest to Vercel), `justbash()` (pure-JS, no real binaries), and `defaultBackend()` (auto-picks in availability order). Omit `backend` and eve uses `defaultBackend()`.

**Network policy** goes on the backend factory or in `onSession`'s `use()`. Three forms:

```ts
networkPolicy: "allow-all";            // default
networkPolicy: "deny-all";             // block all egress, including DNS
networkPolicy: {
  allow: ["ai-gateway.vercel.sh", "*.github.com"],
  subnets: { deny: ["10.0.0.0/8"] },
};
```

Change it mid-turn with `sandbox.setNetworkPolicy(...)`. **Credential brokering** keeps secrets out of the sandbox — the policy's per-domain `transform` injects auth at the firewall:

```ts
async onSession({ use }) {
  await use({
    networkPolicy: {
      allow: {
        "github.com": [{ transform: [{ headers: { authorization: "Basic <base64>" } }] }],
        "*": [],
      },
    },
  });
}
```

## Gotchas

- **Authored tools ≠ sandbox tools.** Your `tools/` execute in the app runtime (full `process.env`). Only the built-in file/shell tools and `ctx.getSandbox()` run in the sandbox.
- **Default sandbox is not a substitute for policy.** Set `deny-all` or an allow-list before running untrusted tools or handling sensitive data.
- **`bootstrap` is template-scoped, `onSession` is per durable session.** Network policy set only in `bootstrap` does not carry into later sessions — configure it on the factory or in `onSession`.
- **`setNetworkPolicy` is backend-limited.** `vercel()` and `microsandbox()` support domain allow-lists + brokering; `docker()` honors only allow/deny-all; `justbash()` rejects it entirely.

## Recap

The sandbox gives the model an isolated `/workspace` with shell and file tools, reachable from your code via `ctx.getSandbox()`. Seed files under `agent/sandbox/workspace/`, pick a backend with `defineSandbox`, and lock egress with network policy and credential brokering so secrets never enter the sandbox. Next: delegate work to subagents.
