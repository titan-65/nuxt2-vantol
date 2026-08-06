---
title: "vp check Deep Dive"
description: "What vp check actually does: format via Oxfmt, lint via Oxlint, and type-check via the TypeScript Go toolchain — merged into one fast pass. Configure it in vite.config.ts and turn on type-aware linting."
series: "vite-plus-intermediate"
order: 1
feature: "Oxfmt + Oxlint + tsgo in one pass"
sourceUrl: "https://viteplus.dev/guide/check"
difficulty: "Intermediate"
estMinutes: 15
img: "/vite_plus.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

`vp check` bundles three static checks into a single command:

- **Format** — [Oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) (Prettier-compatible output)
- **Lint** — [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) (750+ ESLint-compatible rules, written in Rust)
- **Type-check** — the TypeScript Go toolchain via [tsgolint](https://github.com/oxc-project/tsgolint), when enabled

Merging them into one command is faster than three separate tool invocations, because the work is coordinated and parallelized.

## Why you'd care

This is the command you run before every commit. Understanding its parts — and how to configure them in `vite.config.ts` — is the difference between fighting the tool and having it disappear into your workflow.

## Before

Separate `eslint`, `prettier`, and `tsc` runs, each re-reading files, each with its own config file and its own speed profile. `tsc` in particular is often the slow one.

## After

```bash
vp check          # format + lint + type-check
vp check --fix    # and auto-fix everything fixable
```

## Do it yourself

### 1. Configure lint and format in `vite.config.ts`

All config lives in one file. A solid base:

```ts [vite.config.ts]
import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    options: {
      typeAware: true, // enable type-aware lint rules
      typeCheck: true, // run TS type checks as part of `vp check`
    },
  },
});
```

`vp create` and `vp migrate` enable both `typeAware` and `typeCheck` by default. If you're on a hand-wired project, add them yourself so `vp check` becomes your single static-check command.

### 2. Run the parts you need

```bash
vp check --no-fmt            # lint + type-check, skip formatting
vp check --no-lint           # format + type-check, skip lint rules
vp check --no-fmt --no-lint  # type-check only
```

### 3. Turn a step off by default

If a project wants everything _except_ formatting:

```ts [vite.config.ts]
export default defineConfig({
  check: {
    fmt: false, // vp check lints + type-checks but won't format
  },
});
```

Standalone `vp fmt` and `vp lint` still work — this only affects `vp check`.

## Gotchas

- **Type-aware ≠ type-check.** `typeAware` unlocks lint rules that need type info; `typeCheck` runs actual TS type checking inside `vp check`. You usually want both `true`.
- `vp check` config changes propagate to **pre-commit hooks** that call `vp check` — disabling `fmt` in config disables it at commit time too.
- Oxlint is fast but doesn't yet implement _every_ ESLint rule. Most common rules have equivalents; check the Oxlint docs if a specific rule is missing.

## Recap

`vp check` = Oxfmt + Oxlint + tsgo, coordinated and fast. Configure it in the `lint`, `fmt`, and `check` blocks of `vite.config.ts`; turn on `typeAware` + `typeCheck` to make it your one static-check command. Next: the testing side of the loop.
