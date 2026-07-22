# Code Context

## Files Retrieved
1. `packages/presence/src/runtime/plugins/presence.client.ts` (lines 75-108, 154-176) - buffers the configured key combo, opens the shared wall, mounts it, and configures transport/polling.
2. `packages/presence/src/runtime/components/PresenceWall.vue` (lines 43-61, 204-220) - form submission calls `wall.add`.
3. `packages/presence/src/runtime/composables/usePresenceWall.ts` (lines 47-83) - shared client wall delegates `add` to the configured transport.
4. `packages/presence/src/runtime/utils/wallSync.ts` (lines 24-34) - POSTs JSON to `/api/_presence/wall`; same-origin fetch sends same-origin cookies by default.
5. `packages/presence/src/runtime/server/api/wall.post.ts` (lines 35-87) - validates, rate-limits, resolves identity, and stores the signature; null identity becomes anonymous.
6. `packages/presence/src/runtime/server/rate-limit.ts` (lines 20-47) - resolves identity once during user rate limiting, before the route resolves it again.
7. `packages/presence/src/runtime/server/identity.ts` (lines 14-35) - process/module-local resolver registration and silent null fallback on missing/throwing resolver.
8. `apps/web/server/plugins/presence-identity.ts` (lines 9-30) - registers the host adapter and calls Better Auth `getSession` with request headers.
9. `apps/web/server/utils/auth.ts` (lines 14-36) - the Better Auth instance, GitHub provider/profile mapping, secret/base URL, and SQLite database.
10. `apps/web/server/api/auth/[...all].ts` (lines 1-6) - routes Better Auth requests through that same `auth` instance.
11. `apps/web/utils/auth-client.ts` (lines 1-4) - browser Better Auth client uses the default same-origin auth base path.
12. `apps/web/nuxt.config.ts` (lines 9-27) - enables the presence server and auto-mounted wall.
13. `packages/presence/src/module.ts` (lines 23-80) - publishes combo config, installs the client plugin, and registers wall handlers.

## Key Code

```ts
// packages/presence/src/runtime/plugins/presence.client.ts:83-95
buffer.push({ key: e.key, code: e.code });
if (buffer.length > opts.combo.length) buffer = buffer.slice(-opts.combo.length);
if (buffer.length === opts.combo.length &&
    buffer.every((k, i) => k.key === opts.combo[i] || k.code === opts.combo[i])) {
  opts.wall.open();
  buffer = [];
}
```

The effective default combo is `ArrowUp, ArrowUp, ArrowDown, ArrowDown` (`presence.client.ts:160`; supplied from module defaults/config). Keys must complete with no gap over 1.5 seconds or the buffer resets.

```ts
// apps/web/server/plugins/presence-identity.ts:14-27
setPresenceIdentityResolver(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session?.user) return null;
  return {
    id: session.user.id,
    handle: u.login ?? u.email ?? u.name ?? u.id,
    avatarUrl: u.image,
    provider: "github",
  };
});
```

```ts
// packages/presence/src/runtime/server/api/wall.post.ts:67-85
const author = await resolveIdentity(event);
// ...
await storage.append({
  author: author ?? { id: "anon", handle: "anonymous" },
  // ...
});
```

## Architecture

1. Nuxt module installs a client-only plugin and auto-mounts `PresenceWall`.
2. Global `keydown` buffering recognizes the combo and sets the shared wall's `isOpen` ref.
3. The form calls `wall.add`; the HTTP transport sends a same-origin POST to `/api/_presence/wall`.
4. The browser includes the Better Auth session cookie automatically because the request is same-origin (no explicit `credentials` is required for this case).
5. The wall handler calls the registered resolver. The app Nitro plugin passes the incoming headers to `auth.api.getSession`, using the exact same `auth` export/database as the `/api/auth/**` handler.
6. A valid session is mapped to a presence author; missing/invalid/errored resolution silently stores `anonymous`.

### Recognition conclusion

**Expected behavior: recognized.** An already logged-in user is recognized when their login was created by this app's `apps/web/server/utils/auth.ts` Better Auth instance, the wall request remains same-origin, and the deployed process uses the same `BETTER_AUTH_SECRET` and `.data/better-auth.db`. The GitHub `login` field is not required for recognition: older rows without it fall back to email/name/id. Avatar comes from Better Auth's standard `user.image`.

**High severity:** identity failures silently become anonymous (`identity.ts:28-35`, `wall.post.ts:78-80`). A resolver registration/bundling/startup error, DB/session error, changed/missing production secret, missing session DB on ephemeral deployment, or cookie domain/origin mismatch is indistinguishable to the user from being logged out. The wall still accepts and permanently writes an anonymous signature.

**Medium severity:** the request resolves the Better Auth session twice: `checkRateLimit` calls `resolveIdentity` (`rate-limit.ts:35-41`), then `wall.post.ts:67` calls it again. This adds duplicate DB work and creates a consistency window; an intermittent first/second lookup failure can rate-limit as a user but store anonymously (or vice versa).

**Medium deployment risk:** SQLite is `resolve(".data/better-auth.db")` (`auth.ts:14,36`). On serverless/ephemeral or multi-instance hosting, an earlier login can disappear or exist only on another instance. That user will not resolve even with a valid-looking browser cookie. This is deployment-dependent, not a client-flow defect.

**Low severity:** `createHttpTransport.push` ignores HTTP status/error payload and always reports `presence: push returned no signature` (`wallSync.ts:26-34`), hiding whether failure was auth-adapter-related, rate limiting, or validation. This does not itself cause anonymous recognition.

## Minimal Fixes

1. **Prevent silent identity loss (smallest safety fix):** in `wall.post.ts`, distinguish “no session” from resolver failure. Stop swallowing resolver exceptions in `identity.ts` for signing, and return a 5xx rather than persisting anonymous when the configured resolver throws. Keep `null` as intentionally signed out. If anonymous signing is not desired for this blog, return `401` when `author === null` instead of using the anonymous fallback.
2. **Resolve once:** resolve `author` before rate limiting and pass its id/identity into `checkRateLimit`, rather than having `checkRateLimit` call the resolver again. Files: `wall.post.ts`, `rate-limit.ts` and their focused tests.
3. **Deployment fix if applicable:** move Better Auth sessions to the app's durable shared database (or guarantee a persistent single-instance `.data` volume). Do not attempt to fix this in presence client code.
4. **Diagnostics only:** make `wallSync.ts` check `response.ok` and surface the server error code. This makes auth/session failures actionable but is not the root recognition fix.

No new auth bridge or explicit fetch credential option is needed for the current same-origin flow.

## Start Here

Open `apps/web/server/plugins/presence-identity.ts` first: it is the single bridge deciding whether the Better Auth session becomes a wall identity. Then inspect `packages/presence/src/runtime/server/identity.ts` for the silent failure behavior.

## Acceptance

Read-only trace; no files were edited in the project. The output artifact is the only file written. No tests were added or run. Existing working tree changes predated this trace; `git diff --cached --name-only` was empty, so there were no staged files.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Traced keypress through POST and Better Auth resolution with exact paths/ranges; identified high/medium/low findings and minimal fixes."
    }
  ],
  "changedFiles": [
    ".pi-subagents/artifacts/outputs/02588681/presence-flow.md"
  ],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "targeted find/grep/read inspection across packages/presence and apps/web",
      "result": "passed",
      "summary": "Located and traced client trigger, transport, wall handler, resolver, Better Auth instance, and auth route."
    },
    {
      "command": "git status --short && git diff --cached --name-only",
      "result": "passed",
      "summary": "Working tree already had many unstaged/untracked changes; staged file list was empty."
    }
  ],
  "validationOutput": [
    "Confirmed same-origin wall POST carries Better Auth cookie by browser default.",
    "Confirmed auth route and presence resolver import the same apps/web/server/utils/auth.ts instance.",
    "Confirmed null or thrown identity resolution is stored as anonymous."
  ],
  "residualRisks": [
    "Runtime bundling/plugin initialization was not exercised; module-local resolver sharing should be validated in a built Nitro app.",
    "Deployment persistence and production cookie/secret configuration cannot be established from source alone."
  ],
  "noStagedFiles": true,
  "diffSummary": "Read-only investigation; only the requested findings artifact was created.",
  "reviewFindings": [
    "high: packages/presence/src/runtime/server/identity.ts:28-35 and wall.post.ts:78-80 - resolver failures silently persist logged-in users as anonymous",
    "medium: packages/presence/src/runtime/server/rate-limit.ts:35-41 and wall.post.ts:67 - session identity is resolved twice",
    "medium: apps/web/server/utils/auth.ts:14,36 - local SQLite session storage may not survive or share across production instances",
    "low: packages/presence/src/runtime/utils/wallSync.ts:26-34 - HTTP errors lose their actionable server reason"
  ],
  "manualNotes": "An existing same-origin session from this exact Better Auth instance should be recognized; no client credential fix is required."
}
```
