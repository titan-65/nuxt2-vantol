---
title: "Migrating an Existing Project"
description: "vp migrate consolidates separate Vite, Vitest, ESLint/Oxlint, and Prettier/Oxfmt setups into Vite+: updating deps, rewriting imports, merging config into vite.config.ts, and updating scripts. Plus the verify loop after."
series: "vite-plus-intermediate"
order: 4
feature: "vp migrate and its rewrites"
sourceUrl: "https://viteplus.dev/guide/migrate"
difficulty: "Intermediate"
estMinutes: 14
img: "/vite_plus.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

`vp migrate` moves an existing project onto Vite+. It updates dependencies, rewrites imports where needed, merges tool-specific config into `vite.config.ts`, updates `package.json` scripts to the Vite+ surface, and can set up commit hooks and agent/editor config.

## Why you'd care

Most real adoption isn't greenfield — you have a project already using Vite + Vitest + ESLint + Prettier. `vp migrate` does the mechanical consolidation so you don't wire each tool by hand.

## Before

Split tooling: `vite.config.ts` for Vite, `vitest.config.ts` for tests, `.eslintrc` for lint, `.prettierrc` for format, imports pointing at `vite` and `vitest`.

## After

One `vite.config.ts` with `lint`, `fmt`, `test`, and `pack` blocks; imports rewritten to `vite-plus`; scripts pointing at `vp` commands.

## Do it yourself

### 1. Prepare

Before migrating, get on recent versions — the migration expects them:

- **Vite 8+**
- **Vitest 4.1+**

### 2. Run the migration

```bash
vp migrate                  # migrate the current directory
vp migrate my-app           # or a specific path
vp migrate --no-interactive # no prompts (CI-friendly)
```

Prefer to hand it to a coding agent? The docs ship a [migration prompt](https://viteplus.dev/guide/migrate#migration-prompt) you can paste in.

### 3. Verify — the required post-migration loop

```bash
vp install
vp check
vp test
vp build
```

If all four pass, the migration landed cleanly.

### 4. Know what got rewritten

| From | To |
| --- | --- |
| `import … from 'vite'` (config) | `'vite-plus'` |
| `import … from 'vitest'` | `'vite-plus/test'` |
| `@vitest/browser*` | `vite-plus/test/browser*` |
| `tsdown.config.ts` options | `pack` block in `vite.config.ts` |
| `lint-staged` config | `staged` block in `vite.config.ts` |

Remove the old `vite` / `vitest` / `@vitest/browser*` deps **only after** confirming the rewrites — `vite-plus` ships them as direct dependencies.

## Gotchas

- **Expect manual follow-up.** The docs are explicit: most projects need some hand adjustments after `vp migrate`.
- **Leave `declare module 'vitest'` augmentations alone** — they must target the upstream module, not `vite-plus/test`.
- **Git hook tools:** automatic migration handles Husky v9+ and lint-staged. `lefthook`, `simple-git-hooks`, `yorkie`, and Husky < 9 are left untouched with a warning — migrate those by hand (next lesson covers the hook setup).
- Migrate on a clean branch so you can diff and review every rewrite before committing.

## Recap

`vp migrate` consolidates split tooling into Vite+: deps, imports, config, and scripts. Always finish with `vp install → check → test → build`, and expect a little manual cleanup. Next: the commit hooks that keep a migrated project honest.
