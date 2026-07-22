# @vantol/presence — Nuxt Module + Learn Series

## Overview

`@vantol/presence` is a Nuxt module that gives any Nuxt site two ways to express the developer's presence: a hidden communal scratch board where visitors leave signatures that float, age, and dissolve; and a cryptographic token stamped invisibly into the page that proves the dev authored this exact build. The module is built progressively across an 8-step learn series at `apps/web/content/learn/nuxt-modules/`, from "I know Nuxt, I've never written a module" to a deployed, verifiable module running on vantolbennett.com.

## Goals

- A working Nuxt module that installs in any Nuxt 4.x app with one line in `nuxt.config.ts`.
- Two complementary features in one package: a visitor-facing wall and a build-time mark.
- An 8-step tutorial series under the existing learn-series pattern, beginner-to-advanced.
- Module lives in `packages/presence/`, deployable as a workspace package or publishable to npm.
- Additive only — never modifies existing layouts, components, or styles of the consuming app.

## Non-goals

- Not analytics, not tracking, not user identification across visits.
- Not a comment system, not a chat widget, not persistent social content.
- Not opinionated on UI — ships one neutral default, every visual knob is configurable.
- Not a database-backed system — wall storage is in-memory with TTL; mark storage is the filesystem keypair.
- Not npm-published (the package is set up to support publishing; this series does not run the publish step).

## Module concept

**Name:** `@vantol/presence`
**Tagline:** "A hidden scratch board and a signed build mark for your Nuxt site."
**Framing:** "Presence" carries the dual meaning — visitors feel the dev's presence through the wall, the mark proves the dev's presence on the build.

Two features in one module:

1. **The Wall** — hidden communal scratch board. Visitors draw a signature, it floats on the canvas for `wall.ttlSeconds`, then dissolves. Keyboard combo to open on desktop, hash route `/presence` on mobile, `window.$presence` console helpers.
2. **The Mark** — cryptographic token rendered into the page's `<head>` (meta + comment). Signs `{handle, siteUrl, buildSha, timestamp}` with an ed25519 keypair generated on first run. Anyone can read the source and verify.

## Feature surface

### Beginner tier (steps 01–03)

- Module scaffold at `packages/presence/`.
- `<PresenceWall>` component, `usePresenceWall` composable.
- Keyboard combo listener (default `ArrowUp ArrowUp ArrowDown ArrowDown`).
- `window.$presence.{open,close,sign}` console API.
- Client-only wall (in-memory, no persistence).

### Intermediate tier (steps 04–06)

- Server-side wall persistence behind `wall.server: true` (opt-in).
- Nitro routes: `POST /api/_presence/wall`, `GET /api/_presence/wall`.
- In-memory TTL store with `wall.ttlSeconds`, `wall.maxSignatures` cap.
- Hash route fallback at `/presence` for mobile.
- Render styles: `cursive | block | monogram`.
- Typed `ModuleOptions` interface, `runtimeConfig` split (public/private).
- Vitest setup with `@nuxt/test-utils`, store + route tests.

### Advanced tier (steps 07–08)

- ed25519 keypair generated on first run into `.presence/` (gitignored `private.pem`, committed `public.pem`).
- Build hook signs payload, injects `<meta name="presence-mark">` + HTML comment.
- Server endpoint `POST /api/_presence/verify` for authoritative verification.
- Client-side verify using `runtimeConfig.public` public key.
- Module installed in `apps/web`, deployed to vantolbennett.com.

## Architecture

### Package layout

```
packages/presence/
  src/
    module.ts                   # defineNuxtModule entry, options defaults
    runtime/
      plugins/
        presence.client.ts      # combo listener + console API
      composables/
        usePresenceWall.ts      # wall state + actions
      components/
        PresenceWall.vue        # the canvas/overlay
      utils/
        crypto.ts               # sign / verify (advanced)
        storage.ts              # TTL helpers (intermediate)
    server/
      api/
        wall.post.ts            # POST /api/_presence/wall
        wall.get.ts             # GET  /api/_presence/wall
        verify.post.ts          # POST /api/_presence/verify (advanced)
      utils/
        wallStore.ts            # in-memory TTL store
  test/
    module.test.ts
    wall.test.ts
    crypto.test.ts
  playground/                   # dev Nuxt app
  nuxt.config.ts                # playground config
  package.json
  README.md
```

### Runtime topology

| Layer | What runs | When |
|---|---|---|
| Build (Nitro setup) | Generates keypair (first run), signs payload, injects into HTML head + comment | Once per build |
| Server (Nitro routes) | `POST/GET /api/_presence/wall`, `POST /api/_presence/verify` — only when `wall.server: true` | On visitor request |
| Client plugin | Combo listener, console API, mounts `<PresenceWall>` if route hash matches | On every page load |
| Auto-imported component | `<PresenceWall>` — renders the canvas when open | Only when wall is open |

### Data flow — Wall

```
visitor presses combo
        |
        v
client plugin opens <PresenceWall>
        |
        v
user draws signature on canvas
        |
        +-- wall.server === false --> keep in memory, render locally
        |
        +-- wall.server === true  --> POST /api/_presence/wall
                                            |
                                            v
                                      wallStore.add(sig, ttl)
                                            |
                                            v
                                      GET returns aged-out list
                                            |
                                            v
                                      other clients render
```

### Data flow — Mark

```
nuxi build
        |
        v
module setup hook runs
        |
        +-- .presence/ exists? --> load keys
        |
        +-- not exists?          --> generate ed25519 keypair, write to .presence/
                                    (gitignored), print first-run message
        |
        v
sign payload: { handle, siteUrl, buildSha, timestamp }
        |
        v
inject into head:
  <meta name="presence-mark" content="...">
  <!-- presence-mark: <base64 payload>.<base64 signature> -->
        |
        v
verify.post.ts lets visitors confirm the mark is valid
```

## API surface

### Module options

```ts
export default defineNuxtConfig({
  modules: ['@vantol/presence'],
  presence: {
    enabled: true,
    wall: {
      enabled: true,
      server: false,           // beginner default — flipped true in intermediate
      ttlSeconds: 3600,
      maxSignatures: 50,
      combo: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'],
      mobilePath: '/presence',
      renderStyle: 'cursive',  // 'cursive' | 'block' | 'monogram'
    },
    mark: {
      enabled: true,           // advanced only
      handle: '',              // empty → infer from package.json author
      keyDir: '.presence/',    // gitignored
    },
  },
})
```

Each article reveals only the options it needs.

### Client-side public surface (auto-imported)

```vue
<PresenceWall v-model:open="wallOpen" />

<script setup>
const { isOpen, signatures, add, clear } = usePresenceWall()
</script>
```

**Console helpers** (mounted by client plugin):

```js
window.$presence.open()
window.$presence.close()
window.$presence.sign('vantol was here')
window.$presence.verify()  // advanced only
```

### Server endpoints (when `wall.server: true`)

| Method | Path | Body | Returns |
|---|---|---|---|
| `GET` | `/api/_presence/wall` | — | `{ signatures: Signature[] }` (aged-out list) |
| `POST` | `/api/_presence/wall` | `Signature` (no id/timestamps) | `{ ok: true, signature: Signature }` |
| `POST` | `/api/_presence/verify` | `{ payload, signature }` | `{ valid: true, payload: DecodedPayload }` or `{ valid: false }` |

```ts
type Signature = {
  id: string
  text: string
  x: number          // 0-100 (percentage)
  y: number          // 0-100
  rotation: number   // degrees
  color: string      // hsl/rgb
  createdAt: number  // epoch ms
  expiresAt: number  // epoch ms
}

type MarkPayload = {
  handle: string
  siteUrl: string
  buildSha: string
  timestamp: number
}
```

### Verification flow

1. Page loads. Client plugin reads `<meta name="presence-mark" content="…">` or `<!-- presence-mark: … -->`.
2. Decodes base64 `payload.signature` locally using the public key shipped via `runtimeConfig.public`.
3. If `wall.server` is on, visitor can hit `POST /api/_presence/verify` for an authoritative check.
4. Result rendered as a tiny, unobtrusive toast on demand (`window.$presence.verify()`).

### API surface progression across the series

| Article | API surface exposed |
|---|---|
| Beginner | `<PresenceWall>`, `usePresenceWall`, `$presence.open/close/sign`, defaults only |
| Intermediate | Adds `POST/GET /api/_presence/wall`, `wall.server`, `wall.ttlSeconds`, `wall.renderStyle` |
| Advanced | Adds `mark.*` options, keypair bootstrap, `POST /api/_presence/verify`, public-key runtime config |

## Learn series structure

### Location

```
apps/web/content/learn/nuxt-modules/
  index.md
  01-the-module-anatomy.md
  02-scaffold-the-presence-package.md
  03-first-wall-client-only.md
  04-server-persistence-and-ttl.md
  05-real-options-surface.md
  06-testing-the-module.md
  07-the-signed-mark.md
  08-deploy-to-the-blog.md
```

Each step ~60–80 lines, follows the existing section template: **What's new / Why you'd care / Before / After / Do it yourself / Gotchas / Recap**. Frontmatter conforms to the `tutorials` collection schema in `apps/web/content.config.ts`.

### Series index.md

```yaml
---
title: "Building @vantol/presence — a Nuxt module from scratch"
description: "We build a hidden scratch-board module and a cryptographic build mark together, one step at a time. By step 8 it ships on the live blog."
series: "nuxt-modules"
nuxtVersion: "4.x"
releaseDate: "2026-XX-XX"  # set when the first tutorial in the series publishes
sourceUrl: "https://nuxt.com/docs/4.x/guide/modules/getting-started"
img: "/nuxt_learn.png"
difficulty: "Beginner"
estMinutes: 90
---
```

### The 8 steps

| # | Title | Tier | What it teaches | What ships |
|---|---|---|---|---|
| 01 | The module anatomy | Beginner | `defineNuxtModule`, runtime boundary, module kinds | None — read-only |
| 02 | Scaffold the presence package | Beginner | `packages/presence/` setup, `@nuxt/kit`, `vp pack`, monorepo wiring | Empty module that installs |
| 03 | First wall — client-only | Beginner | `addComponent`, `addImports`, client plugin, combo listener | Drawing wall + combo, in-memory |
| 04 | Server persistence & TTL | Intermediate | `addServerHandler`, Nitro route, in-memory TTL store | Wall persists across reloads |
| 05 | Real options surface | Intermediate | `ModuleOptions` typing, `runtimeConfig` split, defaults | Typed options, `wall.*` knobs |
| 06 | Testing the module | Intermediate | `@nuxt/test-utils`, vitest, store + route tests | Green test suite |
| 07 | The signed mark | Advanced | ed25519 keypair, build hook, payload signing, HTML injection | Mark renders in HTML |
| 08 | Deploy to the blog | Advanced | Install in `apps/web`, set handle, screenshot the live site | Module live on vantolbennett.com |

### Tier rollout

- **Beginner** (steps 01–03): "I know Nuxt, I've never written a module." Three steps to a working, installable client-only wall.
- **Intermediate** (04–06): "Now make it real." Three steps to a typed, tested, server-backed module.
- **Advanced** (07–08): "Now prove it." Two steps to a cryptographic build mark, deployed on the live blog.

### Code in `packages/presence/` at each tier

| After step… | Code in package |
|---|---|
| 03 | `module.ts`, `runtime/plugins/presence.client.ts`, `runtime/components/PresenceWall.vue`, `runtime/composables/usePresenceWall.ts` |
| 06 | + `server/api/wall.{post,get}.ts`, `server/utils/wallStore.ts`, typed options, `test/` |
| 08 | + `runtime/utils/crypto.ts`, `server/api/verify.post.ts`, keypair bootstrap in build hook, deployed to `apps/web` |

### Reading order & dependencies

- Step 01 stands alone (no code, just concepts).
- Steps 02–08 form a strict chain. Each builds on the previous step's working code.
- A reader can stop after 03 and have something working. Same after 06 and after 08.

## Testing

### Test stack

- Runner: `vp test` from `packages/presence/` (Vitest, wired via Vite+).
- Module testing: `@nuxt/test-utils` (`$fetch`, `setup`, `mountSuspended` for components).
- No direct `vitest` install — Vite+ owns it.

### Test progression

| After step | Test files | What they cover |
|---|---|---|
| 03 | `module.test.ts` | Module installs, options resolve, `<PresenceWall>` auto-imports, client plugin attaches combo listener |
| 06 | `module.test.ts`, `wall.test.ts` | Defaults respected, `runtimeConfig` split, `POST/GET /api/_presence/wall` shape, TTL eviction, max-signature cap, render-style switching |
| 08 | `module.test.ts`, `wall.test.ts`, `crypto.test.ts` | Keypair bootstrap is idempotent, payload signing is deterministic + validatable, verify endpoint accepts/rejects, `runtimeConfig.public` exposes only public key |

### Test layout

```
test/
  module.test.ts        # module install + options resolution
  wall.test.ts          # composable + server routes + TTL
  crypto.test.ts        # sign/verify roundtrip, tamper rejection
  fixtures/             # sample payloads, fake signatures
```

### Error handling — explicit behavior

| Surface | Failure mode | Behavior |
|---|---|---|
| Wall: `POST /api/_presence/wall` with malformed body | Bad shape | `400 { error: 'invalid_signature' }`; nothing stored |
| Wall: store at capacity | New POST when full | `429 { error: 'wall_full' }`; oldest aged-out first |
| Wall: clock skew | `expiresAt` in past on arrival | Discard silently, log in dev |
| Mark: `.presence/` present but unreadable | Permission error | Throw at build time with clear message — never silently skip signing |
| Mark: signing key missing at runtime | Public key not found during verify | Return `{ valid: false, reason: 'no_public_key' }`; never crash the page |
| Client: combo listener on a non-Nuxt page | Module loaded outside Nuxt app | `defineNuxtPlugin` no-ops via `nuxtApp` guard |
| Module: `enabled: false` | Dev opts out entirely | No plugin, no component, no server routes registered |

### Things explicitly *not* tested

- Visual rendering of canvas paths (manual checks + screenshots in articles).
- Crypto algorithm correctness (Node's `crypto` module is the system under test).
- Animation timing (manual).

## Deployment & integration

### Where the module lands

```
packages/presence/         # the module — built, versioned, publishable
apps/web/                  # the consuming app
  nuxt.config.ts           # adds '@vantol/presence' to modules
  .env (gitignored)        # optional: NUXT_PRESENCE_HANDLE if not in package.json
```

### Build & publish path

- Local development: `pnpm dev` in `apps/web` picks up `packages/presence` via workspace symlink.
- Library build: `cd packages/presence && vp pack` (Vite+/tsdown). Output to `dist/`.
- Publishing: optional. The blog installs it via workspace path — no npm publish needed for the series itself, but the package.json is set up so it *could* publish.

### Step 08 deployment checklist

1. `pnpm --filter @vantol/presence build` (or `vp pack`)
2. Add `'@vantol/presence'` to `apps/web/nuxt.config.ts` `modules`
3. Set `presence: { mark: { handle: 'vantolbennett' } }`
4. Set `NUXT_PUBLIC_SITE_URL=https://vantolbennett.com` in env
5. Push to deploy (Vercel, based on existing setup)
6. View source on `https://vantolbennett.com` — confirm `<meta name="presence-mark">` and `<!-- presence-mark: ... -->` present
7. Screenshot the source for the article
8. Hit `$presence.verify()` in devtools on the live site → screenshot the result

### What "deployed" means here

- Module installed in `apps/web`, not a standalone product.
- Site loads, existing UI untouched, no console errors.
- Mark verifiable by anyone who reads the source.
- Wall still functional (combo + hash route).
- Article 08 ends with those screenshots and a "what we just shipped" recap.

### Rollback strategy

- Module is opt-in by namespace. Removing it from `modules` array = clean uninstall.
- No migrations, no DBs, no state to drain.
- `.presence/` dir on the consuming app's filesystem can be deleted to regenerate keys (invalidates old marks, but those are tied to past builds).

## Open questions & risks

### Things still ambiguous (resolved during implementation)

- **Build-hook location**: Nitro's `build:before` vs `nitro:config` vs `app:resolve`. Need to confirm in step 07 which fires before HTML generation.
- **Static-site behavior**: If `apps/web` is fully prerendered, will the runtime plugin still hydrate the wall? Should be fine, but step 08 verifies.
- **SSG/ISR interaction with the mark**: The mark signs the *build*, not the request. Confirm step 08 that this is the intended semantic.
- **Multiple Nuxt apps**: If user later adds another Nuxt app in the monorepo, does each get its own `.presence/`? Yes — per-project. Documented in README, not a step.

### Biggest risks, in priority order

1. **Crypto payload shape vs what users expect to verify.** Risk: people try to verify against GitHub SSH keys and it doesn't work because we generate fresh. Mitigation: README documents "we use project-scoped keys; here's how to swap for your own."
2. **Server route key collision.** Risk: another module already uses `/api/_presence/*`. Mitigation: `_` prefix + documented namespace; articles tell devs to set their own prefix in options if needed.
3. **CSS leakage.** Risk: `<PresenceWall>` styles bleed into consuming app. Mitigation: scoped styles + CSS variables only, no global selectors.
4. **TTL semantics across restarts.** Risk: dev restarts the server, all signatures vanish. Mitigation: explicitly document (and the article calls this out as "intentional — the wall is ephemeral").

### Out of scope (explicit)

- Multi-tenant wall (signatures per-site/per-visitor).
- WebSocket live updates (polling on a 5s tick is enough for v1).
- Mark verification via a hosted service (verification is local + optional endpoint).
- Module install analytics / telemetry.
- npm publish step (the package.json supports it; we don't run it).
- Any modification to the existing `apps/web` UI/background/layout.