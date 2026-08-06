---
title: "Remote and Private Layers"
description: "extends can take a git URL. That's genuinely useful for private shared code and genuinely dangerous if you point it at a branch — here's why, and what to do instead."
series: "nuxt-layers-advanced"
order: 1
feature: "git-sourced layers, auth tokens, and the c12 cache"
sourceUrl: "https://nuxt.com/docs/4.x/guide/going-further/layers"
difficulty: "Advanced"
estMinutes: 10
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

`extends` entries aren't limited to the filesystem. Nuxt resolves config through **c12**, which can fetch a layer straight from a git host:

```ts
export default defineNuxtConfig({
  extends: ["github:acme/nuxt-layers/design-system#v2.3.0"],
});
```

That string is `provider:owner/repo/subdir#ref`. `gitlab:`, `bitbucket:` and a bare URL work too. Private repos take an options tuple:

```ts
export default defineNuxtConfig({
  extends: [
    [
      "github:acme/private-layer#v2.3.0",
      {
        auth: process.env.GITHUB_TOKEN,
        install: true,
      },
    ],
  ],
});
```

- `auth` — a token with read access. Without it, a private repo fails as a 404, which reads like a typo rather than a permissions problem.
- `install: true` — installs the layer's own dependencies after download. A remote layer isn't in your lockfile, so nothing else will do it.

The download is cached under `node_modules` and reused on subsequent starts.

## Why you'd care

The honest use case is narrow: **shared code you're not allowed to publish and can't put in the same repo.** An internal design system across four product repos at a company that won't run a private registry. For that, remote layers are the difference between working and copy-pasting.

Everything else — same monorepo, or code you'd happily publish — should be a workspace package or an npm package. You lose nothing and get a lockfile.

The danger is specific and worth spelling out. A remote layer is **not** in your lockfile. Point it at a branch:

```ts
extends: ['github:acme/design-system'] // implicitly the default branch
```

…and your build is now a function of what that branch looked like when the cache was populated. Two developers, same commit of your app, different sites. CI, with a cold cache, gets a third. Nothing in your repo records which version you built against, so a bisect can't find it and a rollback can't undo it.

## Before

```ts
extends: ['github:acme/design-system'],
```

Reproducible only by accident.

## After

```ts
const DESIGN_SYSTEM_REF = "v2.3.0"; // bump deliberately, in a commit of its own

export default defineNuxtConfig({
  extends: [
    [
      `github:acme/design-system#${DESIGN_SYSTEM_REF}`,
      {
        auth: process.env.NUXT_LAYERS_TOKEN,
        install: true,
      },
    ],
  ],
});
```

Three rules make remote layers safe:

1. **Always pin to a tag or a commit sha**, never a branch. A ref that can move is a build that can move.
2. **Bump the ref in its own commit**, with the upstream changelog in the message. That commit is the only record you'll have.
3. **Treat the cache as a build input.** Clear it in CI, or accept that CI and local can disagree.

If any of that feels heavy — it is. That's the signal to publish the layer to a registry instead, even a private one. `npm` was designed for this problem and has a lockfile.

## Do it yourself

1. Extend a public layer from git and start the dev server:

```ts
extends: ['github:nuxt/starter/templates/layer'],
```

2. Find the download. It lives under your project's `node_modules`, outside your source tree — so it is invisible to `git status` and to every reviewer.
3. Delete the cache directory and restart. Note the re-download, and note that nothing warned you about a version change.
4. Now do it properly: pin to a tag, put the token in `.env`, and add `install: true`.
5. Confirm the failure mode. Remove `auth` on a private layer and read the error — it will say the repository could not be found. Recognising that as _"your token is missing"_ saves half an hour every time.

## Gotchas

- **A 404 usually means auth, not a typo.** Git hosts don't distinguish "missing" from "you can't see this" for private repos.
- **Remote layers resolve at config load**, before modules run. A network problem is a startup failure, not a warning — which means your production build depends on GitHub being up.
- **The cache is not in your lockfile and not in your repo.** No `git status`, no PR diff, no reviewer.
- **`install: true` runs a package install as a side effect of loading config.** Know that before wiring it into CI.
- **Tokens end up in `nuxt.config.ts`.** Read them from `process.env` — never inline. A committed token in a config file is the classic way to leak one.
- **Subdirectory syntax is easy to get wrong.** `github:owner/repo/path/to/layer#ref` — the path is repo-relative, not URL-encoded.

## Recap

`extends` takes git sources with `auth` and `install` options, cached outside the lockfile. Use them only for code you can't publish and can't co-locate — and when you do, pin to a tag, bump it in a dedicated commit, and treat the cache as an unreviewed build input. Next: whether this should have been a module.
