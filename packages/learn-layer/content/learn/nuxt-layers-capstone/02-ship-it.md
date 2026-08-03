---
title: "Ship It"
description: "The split works in dev. Production has four ways to disagree: package manager resolution, CSS scanning, prerendered content dumps, and a layer that isn't in the deployed directory at all."
series: "nuxt-layers-capstone"
order: 2
feature: "building and deploying an app whose feature set lives outside its directory"
sourceUrl: "https://nuxt.com/docs/4.x/getting-started/deployment"
difficulty: "Advanced"
estMinutes: 11
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

Deploying an app whose routes live in a different directory than the app. Nothing about the deploy _command_ changes:

```bash
pnpm --filter @vvantol2000/web build
```

What changes is what has to be true on the build machine before that command works. In dev, the layer resolved because pnpm symlinked `packages/learn-layer` into `apps/web/node_modules`. On a build machine, that symlink only exists if the install step ran with the whole workspace present.

```json
// vercel.json
{
  "installCommand": "corepack prepare pnpm@10.33.0 --activate && pnpm install --no-frozen-lockfile"
}
```

That's a workspace-wide install from the repo root, which is what makes `extends: ['@vvantol2000/learn-layer']` resolvable during the build. A deploy configured to install only inside `apps/web` will fail on the `extends` line, before any of your code runs — with a config-resolution error that mentions a package name and nothing about layers.

## Why you'd care

Four production-only failure modes, in rough order of how confusing they are:

**1. The layer isn't there.** Root-directory-scoped deploys, `--filter` installs, and Docker builds that `COPY apps/web` all produce the same result: the package isn't on disk, config resolution fails, and the error names a missing module rather than a missing layer. Whatever your platform, the build needs the workspace root.

**2. Tailwind stops seeing the layer's classes.** Utility-class scanning works from a list of paths. `@nuxtjs/tailwindcss` derives that list from every layer's `srcDir`, so it keeps working after a split — but a hand-written `content: []` array in a `tailwind.config` that names `./app/**/*.vue` and nothing else will silently ship a `/learn` with no styling. Dev usually hides this: the JIT compiler sees files as you open them.

**3. Content ships as a prerendered SQL dump.** Nuxt Content prerenders `/__nuxt_content/<collection>/sql_dump.txt` per collection at build time. After the split, `tutorials` is built from the layer's `content/` — so if the layer's markdown wasn't in the deployed tree (see 1), the build _succeeds_ and produces a site where `/learn` renders an empty list. No error, because an empty collection is a valid collection.

**4. Routes that outlived their owner.** `/learn/rss.xml` is a Nitro route inside the layer. Prerender hints, redirects, and cache rules for it may still live in the host's `nuxt.config.ts` or in platform config. They're not wrong, but they now describe a route the host doesn't contain — check them explicitly, because a stale rule for a route that moved is invisible until someone hits a cached 404.

## Before

Verified in dev only: `nuxt dev`, click around `/learn`, ship it. Which tests exactly none of the four above — every one of them is a build-time or install-time behaviour.

## After

A local production build and preview before pushing:

```bash
pnpm --filter @vvantol2000/web build
pnpm --filter @vvantol2000/web preview

for u in / /blog /learn /learn/nuxt-layers-core /learn/nuxt-layers-core/01-what-a-layer-is /learn/rss.xml /sitemap.xml; do
  printf '%s -> %s\n' "$u" "$(curl -s -o /dev/null -w '%{http_code}' "localhost:3000$u")"
done
```

Then the check a status code can't give you — did the layer's content actually reach the build output? The dump is gzipped base64, so grepping it directly always returns zero and tells you nothing:

```bash
# .output/public/__nuxt_content/<collection>/sql_dump.txt — decode before you search it.
node -e "const z=require('node:zlib'),f=require('node:fs');
process.stdout.write(z.gunzipSync(Buffer.from(f.readFileSync(process.argv[1],'utf8'),'base64')))" \
  apps/web/.output/public/__nuxt_content/tutorials/sql_dump.txt \
  | grep -o 'nuxt-layers-[a-z]*' | sort | uniq -c
```

```
  22 nuxt-layers-advanced
  18 nuxt-layers-capstone
  29 nuxt-layers-core
  22 nuxt-layers-intermediate
```

Four series, all sourced from the layer, all inside a build output that lives in `apps/web`.

A `200` on `/learn` with an empty series list is the failure this catches — the page renders, the layout is right, and there's nothing in it.

## Do it yourself

1. Build and preview locally. Walk the URL list above. A 200 is necessary, not sufficient — open `/learn` and count the series.
2. Grep the SQL dump for a slug that only exists in the layer. If it's missing, your content source isn't resolving from the layer.
3. Simulate the deploy machine. In a scratch clone:

```bash
git clone <repo> /tmp/deploy-probe && cd /tmp/deploy-probe
pnpm install --frozen-lockfile
pnpm --filter @vvantol2000/web build
```

A clean clone catches the thing your working tree hides: a file you moved but never committed, or a dependency that only exists in your local `node_modules`.

4. Check your platform's root directory setting. It must be the **repo root**, not `apps/web`, or the layer won't be installed.
5. Deploy to a preview URL and re-run the same curl loop against it. Same checks, real environment.
6. After it's live, prove the layer boundary from outside:

```bash
curl -s https://your-site/learn/rss.xml | head -5
```

That feed is generated by a Nitro route that doesn't exist in the app you deployed. That's the whole point.

## Gotchas

- **`--frozen-lockfile` after moving dependencies.** Moving `@nuxt/content` into the layer's `package.json` changes the lockfile. Commit it, or a strict CI install fails on a change you made three commits ago.
- **`postinstall: nuxt prepare` runs before the build.** It resolves layers too — so a broken `extends` shows up at install time, with an error that looks like an install problem.
- **Native modules still need build approval.** pnpm 10 doesn't run dependency build scripts by default; `better-sqlite3` for Content needs `onlyBuiltDependencies` in the root `package.json`. This isn't layer-specific, but a split is exactly when you'll be doing a fresh install and meet it.
- **An empty collection is not an error.** Content will happily build a site with zero documents. Assert on document counts in CI if `/learn` matters.
- **Layer changes don't invalidate a build cache you scoped to `apps/web`.** If your CI caches or triggers on a path filter, add the layer's path — or you'll deploy a lesson edit that doesn't appear.
- **Check redirects and route rules after the move.** A rule in the host that points at a route now owned by the layer isn't an error, and isn't right either.

## Recap

The build command doesn't change; the preconditions do. Install from the workspace root, verify the layer's content reached `.output` rather than trusting a 200, check that CSS scanning still covers the layer's files, and prove it from a clean clone before you prove it in production.

That's the series. This site now runs as a blog that extends a learning platform — one `extends` line, one directory, and a boundary you can delete to test.

## Where to go next

- **[Nuxt Layers documentation](https://nuxt.com/docs/4.x/getting-started/layers)** — the official guide, including the `layers/` auto-scan.
- **[Authoring Nuxt Layers](https://nuxt.com/docs/4.x/guide/going-further/layers)** — remote sources, `$meta`, and publishing notes.
- **[Nuxt Content: collections](https://content.nuxt.com/docs/collections/define)** — how `content.config.ts` resolves per layer.
- **[Building a Nuxt Module: The Basics](/learn/nuxt-modules-core)** — the other half of the reuse story, when files alone aren't enough.
