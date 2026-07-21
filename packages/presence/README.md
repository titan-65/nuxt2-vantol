# @vantol/presence

A Nuxt module that gives any Nuxt site two ways to express the developer's presence:

- **The Wall** — a hidden communal scratch board. Visitors draw signatures that float, age, and dissolve.
- **The Mark** — a cryptographic token stamped invisibly into the page, proving the dev authored this build.

## Install

```bash
pnpm add @vantol/presence
```

## Usage

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@vantol/presence"],
  presence: {
    wall: { server: true },
    mark: { handle: "your-handle" },
  },
});
```

## Options

| Option | Default | What it does |
|---|---|---|
| `enabled` | `true` | Turns the whole module off — no plugin, no component, no routes. |
| `wall.enabled` | `true` | Registers `<PresenceWall>`, the client plugin, and `window.$presence`. |
| `wall.server` | `false` | Persists signatures server-side. Only then are the wall routes registered. |
| `wall.ttlSeconds` | `3600` | How long a signature survives before it ages out. |
| `wall.maxSignatures` | `50` | Cap on stored signatures. A full wall answers `429 wall_full`. |
| `wall.combo` | `↑ ↑ ↓ ↓` | Key sequence that opens the wall. Matches either `key` or `code`. |
| `wall.mobilePath` | `/presence` | Route that auto-opens the wall, for devices with no keyboard. |
| `wall.renderStyle` | `cursive` | `cursive`, `block`, or `monogram`. |
| `mark.enabled` | `true` | Signs each build and stamps the mark into every page's head. |
| `mark.handle` | `""` | Who the mark names. Empty falls back to the app's `package.json` author. |
| `mark.keyDir` | `.presence/` | Where the keypair lives, relative to the app root. |

## Endpoints

Registered only when the matching feature is on.

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/_presence/wall` | `wall.server` only. `400 invalid_signature`, `429 wall_full`. |
| `GET` | `/api/_presence/wall` | `wall.server` only. Returns the unexpired signatures. |
| `POST` | `/api/_presence/verify` | `mark` only. Body `{ token? }`; omit it to check the build's own mark. |

## The signing keys

On the first build, the module writes an ed25519 keypair to `mark.keyDir`.

- **`private.pem` must never be committed.** Add `**/.presence/` to `.gitignore`.
- A build host with no keypair generates a fresh one, so the mark identifies
  *that build*. This is the intended semantic: the mark signs a build, not a request.
- Only the public half reaches the browser, via `runtimeConfig.public`. That is
  all a visitor needs to check the mark against the endpoint.

## Deployment

1. Add the module to `modules` and set `presence.mark.handle`.
2. Set `NUXT_PUBLIC_SITE_URL` — it is signed into the payload.
3. Deploy. Nothing else to provision: the wall is in-memory and the keys are generated on build.
4. Confirm it shipped: view source and look for `<meta name="presence-mark">`, then
   run `await $presence.verify()` in devtools. It should answer `{ valid: true }`.

Removing the module from `modules` is a clean uninstall — no migrations, no state to drain.

## Caveats

- The wall is deliberately ephemeral. A server restart empties it.
- Verification is server-side. Browser ed25519 via WebCrypto is still uneven,
  and the endpoint answers authoritatively anyway.

See `apps/web/content/learn/nuxt-modules/` for the tutorial series.
