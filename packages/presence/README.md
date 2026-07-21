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

## Opening the wall

Nothing to place in your templates — the module mounts the wall itself. Three ways in:

- **The combo:** press `↑ ↑ ↓ ↓` on any page (configurable via `wall.combo`).
- **Click anywhere** on the overlay, type, press Enter. Esc cancels the caret, Esc again closes the wall.
- **The console:** `$presence.open()`, `$presence.sign("was here")`, `$presence.close()`.
- **The route:** visit `/presence` (configurable via `wall.mobilePath`) — for touch devices with no keyboard.

## Options

| Option | Default | What it does |
|---|---|---|
| `enabled` | `true` | Turns the whole module off — no plugin, no component, no routes. |
| `wall.enabled` | `true` | Registers `<PresenceWall>`, the client plugin, and `window.$presence`. |
| `wall.server` | `false` | Shares signatures between visitors: the client POSTs on sign and polls while open. |
| `wall.pollMs` | `5000` | How often the open wall re-reads the shared list. |
| `wall.ttlSeconds` | `3600` | How long a signature survives before it ages out. |
| `wall.maxSignatures` | `50` | Cap on stored signatures. A full wall answers `429 wall_full`. |
| `wall.combo` | `↑ ↑ ↓ ↓` | Key sequence that opens the wall. Matches either `key` or `code`. |
| `wall.mobilePath` | `/presence` | Route that auto-opens the wall, for devices with no keyboard. |
| `wall.autoMount` | `true` | Mounts the wall onto `<body>` for you. Set `false` to place `<PresenceWall>` yourself. |
| `wall.renderStyle` | `cursive` | `cursive`, `block`, or `monogram`. |
| `mark.enabled` | `true` | Signs each build and stamps the mark into every page's head. |
| `mark.handle` | `""` | Who the mark names. Empty falls back to the app's `package.json` author. |
| `mark.keyDir` | `.presence/` | Where the keypair lives, relative to the app root. |
| `mark.privateKey` | `$NUXT_PRESENCE_PRIVATE_KEY` | PEM key for an identity that survives deploys. Empty generates one per build. |

## Endpoints

Registered only when the matching feature is on.

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/_presence/wall` | `wall.server` only. `400 invalid_signature`, `429 wall_full`. |
| `GET` | `/api/_presence/wall` | `wall.server` only. Returns the unexpired signatures. |
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
3. *(Optional)* Set `NUXT_PRESENCE_PRIVATE_KEY` for a stable identity. Skip it and
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

See `apps/web/content/learn/nuxt-modules-core/`, `-advanced/` and `-capstone/` for the tutorial series.
