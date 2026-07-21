---
title: "CI & Docker"
description: "Run Vite+ in CI with voidzero-dev/setup-vp, replacing setup-node + package-manager + cache steps, and add remote Vite Task caching. Then use the official ghcr.io/voidzero-dev/vite-plus image for container builds and multi-stage production images."
series: "vite-plus-advanced"
order: 3
feature: "setup-vp, remote cache, official image"
sourceUrl: "https://viteplus.dev/guide/ci"
difficulty: "Advanced"
estMinutes: 16
img: "/vite_plus.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

For CI, `voidzero-dev/setup-vp` installs Vite+, provisions the right Node.js and package manager, and can cache package installs — collapsing several setup steps into one. For containers, Vite+ publishes an official image at `ghcr.io/voidzero-dev/vite-plus` with `vp` preinstalled.

## Why you'd care

CI config is where toolchain sprawl hurts most — separate Node setup, package-manager setup, cache actions. Vite+ folds those into a single action, and the image gives you a reproducible build environment where Node is resolved from your project, not the image tag.

## Before

```yaml [.github/workflows/ci.yml]
- uses: pnpm/action-setup@v6
  with: { version: 11 }
- uses: actions/setup-node@v6
  with: { node-version: '24', cache: pnpm }
- run: pnpm install --frozen-lockfile && pnpm dev:setup
- run: pnpm check
- run: pnpm test
```

## After

```yaml [.github/workflows/ci.yml]
- uses: voidzero-dev/setup-vp@v1
  with:
    node-version: '24'
    cache: true
- run: vp install && vp run dev:setup
- run: vp check
- run: vp test
- run: vp build
```

## Do it yourself

### 1. Adopt `setup-vp` in GitHub Actions

The `with: cache: true` handles package-manager dependency caching automatically. That's install cache — to also reuse **Vite Task** results across runs, add a separate [GitHub Actions cache for Vite Task](https://viteplus.dev/guide/github-actions-cache) on top.

### 2. Use the image for container-based CI

On GitLab CI, Buildkite, CircleCI, Jenkins, etc., run the image directly:

```yaml [.gitlab-ci.yml]
build:
  image: ghcr.io/voidzero-dev/vite-plus:latest
  script:
    - vp install --frozen-lockfile
    - vp check
    - vp test
    - vp build
```

Node.js is resolved from your project (`.node-version`, `devEngines.runtime`, or `engines.node`) at build time — so there's no Node-specific image tag; tags track the `vp` version.

### 3. Multi-stage production image

Build with the toolchain image, then ship only Node + your app + prod deps:

```dockerfile [Dockerfile]
FROM ghcr.io/voidzero-dev/vite-plus:latest AS build
WORKDIR /app
COPY --chown=vp:vp package.json pnpm-lock.yaml pnpm-workspace.yaml .node-version* ./
RUN vp install --frozen-lockfile
COPY --chown=vp:vp . .
RUN vp build
RUN cp "$(vp env which node | head -1)" /tmp/node

FROM ghcr.io/voidzero-dev/vite-plus:latest AS deps
WORKDIR /app
COPY --chown=vp:vp package.json pnpm-lock.yaml pnpm-workspace.yaml .node-version* ./
RUN vp install --frozen-lockfile --prod

FROM debian:bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /tmp/node /usr/local/bin/node
COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
USER nobody
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

## Gotchas

- **On GitHub Actions, prefer `setup-vp` over the image.** The image is for other CI systems, devcontainers, and ad-hoc use.
- **Prune prod deps in a *separate* stage.** Running `vp install --prod` after a full install in the same stage won't remove the already-installed devDependencies — the whole `vite-plus` toolchain would leak into your runtime image.
- The image runs as the **non-root `vp` user**, so copy sources with `COPY --chown=vp:vp …` or `vp install` can't write. The `vp` user has passwordless `sudo` for the occasional root step (`playwright install --with-deps`).
- For browser tests, use `vp exec playwright install` (project's Playwright, matching your lockfile), not `vpx playwright install` (whatever's latest).

## Recap

`setup-vp` collapses CI setup into one action (+ a separate Task cache for cross-run reuse); the official image gives reproducible container builds with project-resolved Node. Next: shipping libraries and binaries with `vp pack`.
