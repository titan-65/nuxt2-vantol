---
title: "Deploy to the Blog"
description: "Install the module in a real Nuxt app, build it, and verify the mark on production output — plus the packaging trap that only shows up once you consume the module from outside its own playground."
series: "nuxt-modules-capstone"
order: 2
feature: "Workspace install, production build, verification"
sourceUrl: "https://nuxt.com/docs/4.x/getting-started/deployment"
difficulty: "Advanced"
estMinutes: 10
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

The module leaves the playground and installs into the real blog you're reading.

## Why you'd care

A module that works in its own playground has been tested against a config you wrote to suit it. Real apps have their own modules, their own prerender setup, their own build host. Everything ambiguous surfaces here.

## Before

The module works in `packages/presence/playground`.

## After

99 prerendered pages on this blog, each carrying a mark signed with the commit that built them.

## Do it yourself

### 1. Install it

```bash
vp add "@vantol/presence@workspace:*"
```

```ts
// apps/web/nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/content', '@nuxtjs/tailwindcss', '@nuxt/image', 'shadcn-nuxt', '@vantol/presence'],
  presence: {
    mark: { handle: 'vantolbennett' },
  },
});
```

### 2. Set the site URL

`siteUrl` gets signed into the payload, so it has to be real at build time:

```bash
NUXT_PUBLIC_SITE_URL=https://vantolbennett.com
```

### 3. The packaging trap

The first build failed here, and the reason is worth the detour. The package was set up to build a bundle and export `dist/module.mjs` — the normal thing for a library. But `setup()` registers runtime paths relative to the module entry:

```ts
addPlugin({ src: resolve("./runtime/plugins/presence.client") });
```

From `dist/module.mjs`, that resolves to `dist/runtime/plugins/presence.client` — which the bundle never emitted, because the build only had one entry. Inside the playground everything worked, because the playground aliased straight to `src/`.

Two ways out. Either your build emits the runtime tree alongside the entry, preserving structure — or, for a module you're not publishing, skip the build and export source:

```json
{
  "files": ["src"],
  "exports": {
    ".": {
      "types": "./src/module.ts",
      "import": "./src/module.ts"
    }
  }
}
```

Nuxt loads modules through jiti, which compiles the TypeScript. One fewer build step, one fewer way to be wrong.

### 4. Build and verify

```bash
NUXT_PUBLIC_SITE_URL=https://vantolbennett.com npx nuxi build
```

Then check the actual output rather than trusting the build log:

```bash
grep -o 'name="presence-mark" content="[^"]*"' .output/public/index.html
grep -rl "presence-mark" .output/public --include="*.html" | wc -l
```

And check the signature holds, against the key that was generated during that build:

```js
const [enc, sig] = token.split(".");
const ok = verify(null, Buffer.from(enc), createPublicKey(readFileSync(".presence/public.pem")),
  Buffer.from(sig, "base64url"));
// signature valid: true
// payload: {"handle":"vantolbennett","siteUrl":"https://vantolbennett.com","buildSha":"3e7882a",…}
```

That `buildSha` is the commit that produced the build. The mark is doing what it claimed.

### 5. On the live site

Open devtools on any page here:

```js
await $presence.verify()
// { valid: true, payload: { handle: "vantolbennett", … } }
```

## Gotchas

- **Check `git check-ignore` before the first push**, not after. A generated `private.pem` is one `git add -A` away from being public forever. If it ever lands in a commit, rotating the key is the only fix — a later deletion doesn't remove it from history.
- **Native modules pin your Node version.** This build fails under Node 24 because `better-sqlite3` was compiled for Node 22's ABI. That's the app's constraint, not the module's, but it's your problem the moment you're building the app.
- **Prerendered vs SSR changes what "runtime" means.** The mark is baked into static HTML at build; the verify endpoint still needs a server. Know which parts of your module survive `nuxi generate`.
- **Uninstall should be one line.** Removing the module from `modules` leaves nothing behind — no migrations, no state to drain. Design for that from the first line of setup().

## Recap

Eight steps across three series: a function that edits the app, a package Nuxt can load, a component and plugin registered by path, opt-in server routes over a shared store, typed options split by audience, tests at the cheapest tier that proves each thing, a build-time signature, and a real deploy.

The module is running on this page. The mark in the source is signed by the build that published it — go check.
