---
title: "Runtime & Supply Chain"
description: "vp env manages Node.js versions per project and globally through managed shims, resolving the version from .node-version, devEngines.runtime, or engines.node. Plus package-manager pinning, PGP signature verification, and custom mirrors."
series: "vite-plus-advanced"
order: 5
feature: "vp env, version resolution, signature verification"
sourceUrl: "https://viteplus.dev/guide/env"
difficulty: "Advanced"
estMinutes: 17
img: "/vite_plus.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

`vp env` manages Node.js versions — globally and per project — through **managed mode** (on by default), where `node`, `npm`, and related shims resolve through Vite+ and pick the right version for the current directory. It also handles package-manager pinning, PGP-verified Node downloads, and custom mirrors.

## Why you'd care

At senior level, "which Node, which package manager, from where" is a correctness and security question, not a convenience one. Vite+ makes runtime resolution deterministic and verifies what it downloads — replacing your `nvm` + Corepack + trust-the-mirror setup.

## Before

`nvm use` (easy to forget), a `.nvmrc` that CI may or may not honor, Corepack for the package manager, and implicit trust that `nodejs.org` gave you the right bytes.

## After

Shims resolve the version automatically, and Node downloads are signature-verified.

## Do it yourself

### 1. Understand the resolution order

The project Node version is resolved from these sources, in priority order (first found wins):

1. `.node-version` file (current or parent directories)
2. `devEngines.runtime` in `package.json`
3. `engines.node` in `package.json`
4. The global default (`vp env default`), then the latest LTS

`devEngines.runtime` outranks `engines.node` because it's the dev requirement, while `engines.node` is a consumer support range. `vp env doctor` warns on conflicts.

### 2. Pin a project

```bash
vp env pin lts     # or a specific version
vp env install     # install the resolved version
vp env current     # show what's resolved right now
vp env which node  # show which binary will run
```

`vp env pin` updates an existing `.node-version`, else writes `devEngines.runtime`; it only creates `.node-version` when there's no `package.json`. It never touches `engines.node`.

### 3. Switch for one shell

```bash
vp env use 20
vp env use --unset
```

### 4. Managed vs system-first

```bash
vp env on    # managed: shims always use Vite+-managed Node
vp env off   # system-first: prefer system Node, fall back to managed
```

### 5. Pin the package manager too

`packageManager` (or `devEngines.packageManager`) in `package.json` makes the matching shims use that version — e.g. `"npm@10.9.4"` routes both `npm` and `npx` through npm 10.9.4.

## Supply chain

- **Signature verification:** installing from official `nodejs.org` downloads the PGP-signed `SHASUMS256.txt.asc` and verifies it against bundled release keys *before* trusting any checksum; the archive's SHA-256 is verified afterward. An invalid signature is a hard error.
- **Custom mirror:** set `VP_NODE_DIST_MIRROR` for corporate proxies/Artifactory. Mirrors publishing only plain `SHASUMS256.txt` fall back to checksum-only.
- **Dependency build scripts:** native postinstalls (e.g. `better-sqlite3`) are gated for pnpm/bun/yarn and surfaced for approval — the same guard you saw in `vp create`.

## Gotchas

- **Windows shells need setup.** PowerShell must dot-source the generated `env.ps1` for `vp env use` to affect the session; `cmd.exe` uses `vp-use.cmd` instead. Other `vp env` commands work normally.
- **In CI**, `vp env use` writes a temp session file so later shim calls in the same job resolve the chosen version — no shell init required.
- On Node 25+, Corepack is no longer bundled; Vite+ installs it as a managed global on first use. `corepack enable` is patched to put launchers on `PATH` under `VP_HOME/bin`.
- Only bypass PGP verification (`VP_NODE_SKIP_SIGNATURE_VERIFY=1`) as a temporary escape hatch for a keyring issue — checksum verification still runs and a warning prints.

## Recap

`vp env` gives deterministic, per-project Node resolution through managed shims, pins the package manager, and verifies downloads with PGP + checksums. That completes the Advanced series — you can now orchestrate monorepos, reason about the cache, ship through CI/Docker, package libraries, and control the runtime and supply chain. You own the toolchain.
