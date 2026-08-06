# nuxt-presence

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A hidden scratch board visitors can sign, and an ed25519 mark that proves who built the page — for any Nuxt 4 site.

- [📖 &nbsp;Options reference](#options)
- [🔑 &nbsp;Signing keys](#the-signing-keys)
- [🚀 &nbsp;Deployment](#deployment)
- [🎓 &nbsp;Tutorial series](#the-tutorial-series)

## Features

- 🖊️ &nbsp;**The Wall** — a hidden communal scratch board. Click a spot, type your mark, watch it age out and dissolve.
- ⌨️ &nbsp;**Four ways in** — a key combo, a console API, a click, or a dedicated mobile route. No template markup required.
- 🔏 &nbsp;**The Mark** — an ed25519 signature stamped into every page's `<head>`, proving who built this exact deploy.
- 🌐 &nbsp;**Shared or solo** — the wall works client-only, or opt into a server-persisted, polled, multi-visitor board.
- 🔓 &nbsp;**Zero setup** — install, add one line, done. Keys generate themselves; a stable identity is one env var away.

## Quick Setup

1. Add `nuxt-presence` to your project:

```bash
# pnpm
pnpm add nuxt-presence

# npm
npm install nuxt-presence

# yarn
yarn add nuxt-presence
```

2. Add it to the `modules` section of `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ["nuxt-presence"],
  presence: {
    wall: { server: true },
    mark: { handle: "your-handle" },
  },
});
```

That's it! Press <kbd>↑</kbd> <kbd>↑</kbd> <kbd>↓</kbd> <kbd>↓</kbd> on any page ✨

Requires **Nuxt 4.x** and Node 18+.

## Opening the wall

Nothing to place in your templates — the module mounts the wall itself. Four ways in:

- **The combo:** press `↑ ↑ ↓ ↓` on any page (configurable via `wall.combo`).
- **Click anywhere** on the overlay, type, press Enter. Esc cancels the caret, Esc again closes the wall.
- **The console:** `$presence.open()`, `$presence.sign("was here")`, `$presence.close()`.
- **The route:** visit `/presence` (configurable via `wall.mobilePath`) — for touch devices with no keyboard.

## Options

| Option               | Default                      | What it does                                                                           |
| -------------------- | ---------------------------- | -------------------------------------------------------------------------------------- |
| `enabled`            | `true`                       | Turns the whole module off — no plugin, no component, no routes.                       |
| `wall.enabled`       | `true`                       | Registers `<PresenceWall>`, the client plugin, and `window.$presence`.                 |
| `wall.server`        | `false`                      | Shares signatures between visitors: the client POSTs on sign and polls while open.     |
| `wall.pollMs`        | `5000`                       | How often the open wall re-reads the shared list.                                      |
| `wall.ttlSeconds`    | `3600`                       | How long a signature survives before it ages out.                                      |
| `wall.maxSignatures` | `50`                         | Cap on stored signatures. A full wall answers `429 wall_full`.                         |
| `wall.combo`         | `↑ ↑ ↓ ↓`                    | Key sequence that opens the wall. Matches either `key` or `code`.                      |
| `wall.mobilePath`    | `/presence`                  | Route that auto-opens the wall, for devices with no keyboard.                          |
| `wall.autoMount`     | `true`                       | Mounts the wall onto `<body>` for you. Set `false` to place `<PresenceWall>` yourself. |
| `wall.renderStyle`   | `cursive`                    | `cursive`, `block`, or `monogram`.                                                     |
| `mark.enabled`       | `true`                       | Signs each build and stamps the mark into every page's head.                           |
| `mark.handle`        | `""`                         | Who the mark names. Empty falls back to the app's `package.json` author.               |
| `mark.keyDir`        | `.presence/`                 | Where the keypair lives, relative to the app root.                                     |
| `mark.privateKey`    | `$NUXT_PRESENCE_PRIVATE_KEY` | PEM key for an identity that survives deploys. Empty generates one per build.          |

## Endpoints

Registered only when the matching feature is on.

| Method | Path                    | Notes                                                                  |
| ------ | ----------------------- | ---------------------------------------------------------------------- |
| `POST` | `/api/_presence/wall`   | `wall.server` only. `400 invalid_signature`, `429 wall_full`.          |
| `GET`  | `/api/_presence/wall`   | `wall.server` only. Returns the unexpired signatures.                  |
| `POST` | `/api/_presence/verify` | `mark` only. Body `{ token? }`; omit it to check the build's own mark. |

## The signing keys

**You don't have to set anything up.** On the first build the module generates an
ed25519 keypair into `mark.keyDir` (`.presence/` by default) and signs with it. No
env var, no secret, nothing to create by hand.

What that costs: a host with no persistent disk — Vercel, Netlify, most CI — builds
from a clean checkout every time, so it generates a **new keypair per deploy**. The
mark still verifies, but the public key changes and nobody can pin "this is my key"
across builds.

### For an identity that survives deploys

Generate a key once:

```bash
node -e "const {generateKeyPairSync}=require('crypto');const {privateKey}=generateKeyPairSync('ed25519');console.log(privateKey.export({type:'pkcs8',format:'pem'}).toString())"
```

Store it in your host's environment as `NUXT_PRESENCE_PRIVATE_KEY` (Vercel: Project
→ Settings → Environment Variables). Every deploy then signs with the same key, the
public half is derived from it, and nothing is written to disk. Escaped `\n`
newlines are handled, since env vars mangle multi-line values.

### Rules

- **Never commit `private.pem` or the env value.** Add `**/.presence/` to
  `.gitignore` and verify with `git check-ignore -v <path>` — a pattern like
  `.presence/private.pem` contains a slash, so git anchors it to the repo root and
  silently misses nested apps.
- If a private key ever lands in a commit, **rotate it**. Deleting it later does not
  remove it from history.
- Only the public half reaches the browser, via `runtimeConfig.public`. That's all a
  visitor needs to check the mark.
- Rotating invalidates marks from earlier builds — those builds are gone anyway.

## Deployment

1. Add the module to `modules` and set `presence.mark.handle`.
2. Set `NUXT_PUBLIC_SITE_URL` — it is signed into the payload.
3. _(Optional)_ Set `NUXT_PRESENCE_PRIVATE_KEY` for a stable identity. Skip it and
   each deploy signs with its own generated key.
4. Deploy. Nothing else to provision: the wall is in-memory, the keys sort themselves out.
5. Confirm it shipped: view source and look for `<meta name="presence-mark">`, then
   run `await $presence.verify()` in devtools. It should answer `{ valid: true }`.

Removing the module from `modules` is a clean uninstall — no migrations, no state to drain.

## Caveats

- **One signature per visitor per page load.** Reloading grants another turn; the
  server cap is what actually bounds a determined visitor.
- **Polling runs only while the wall is open**, on `wall.pollMs`. A signature you
  make appears instantly and is replaced by the server copy on the next tick.
- The wall is deliberately ephemeral. A server restart empties it.
- Verification is server-side. Browser ed25519 via WebCrypto is still uneven,
  and the endpoint answers authoritatively anyway.

## The tutorial series

This module is built step by step in a three-part series:
[The Basics](https://vantolbennett.com/learn/nuxt-modules-core) ·
[Going Further](https://vantolbennett.com/learn/nuxt-modules-advanced) ·
[The Signed Build](https://vantolbennett.com/learn/nuxt-modules-capstone).

## Contributing

<details>
  <summary>Local development</summary>

```bash
# Install dependencies
vp install

# Generate type stubs
vp run build

# Develop with the playground
cd playground && vp dev

# Lint
vp lint

# Run the test suite (84 tests, three tiers)
vp test
vp run test:watch

# Publish (prepack rebuilds dist first)
npm publish
```

</details>

The build compiles `src/runtime/` file-by-file and bundles `src/module.ts`. Anything
the module resolves at runtime — components, plugins, composables, **server routes** —
must live under `src/runtime/`, or it will not be in the published tarball.

## License

[MIT](./LICENSE) — © [Vantol Bennett](https://vantolbennett.com)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nuxt-presence/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-presence
[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-presence.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npmjs.com/package/nuxt-presence
[license-src]: https://img.shields.io/npm/l/nuxt-presence.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-presence
[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
