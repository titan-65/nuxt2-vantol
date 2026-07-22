# Code Context

## Files Retrieved
1. `apps/web/package.json` (lines 1-36) - confirms Nuxt `^4.5.0`; Nuxt 4 uses `app/` as the application source directory.
2. `apps/web/nuxt.config.ts` (lines 9-28, 75-88, 106-126) - no `srcDir`, `pages`, or router override; enables `nuxt-presence`; Nitro only explicitly prerenders `/` and crawls links.
3. `apps/web/app/pages/presence-demo.vue` (lines 1-29, 31-127) - the concrete file-based `/presence-demo` page and its Better Auth/GitHub UI.
4. `apps/web/app/pages/[...slug].vue` (lines 1-48) - catch-all content route; throws a production 404 when no content exists.
5. `apps/web/app/app.vue` (lines 1-27) - root renders every page through `NuxtLayout`/`NuxtPage`.
6. `apps/web/app/layouts/default.vue` (lines 47-59) - default shell mounts `HeaderNav`, page slot, and footer.
7. `apps/web/app/components/HeaderNav.vue` (lines 5-33, 55-154, 156-302) - global desktop/mobile navigation; currently has no session/login controls. Presence link is at line 21.
8. `apps/web/app/pages/login.vue` (lines 1-35, 37-78) - current main/admin login page using Firebase Google auth.
9. `apps/web/app/composables/useFirebaseAuth.ts` (lines 1-18, 24-123) - shared Firebase session state, admin-email authorization, Google sign-in, and sign-out.
10. `apps/web/app/middleware/admin-auth.ts` (lines 1-24) - protects `/admin` client-side and redirects to `/login`.
11. `apps/web/app/pages/admin.vue` (lines 1-9) - declares the `admin-auth` middleware.
12. `apps/web/app/composables/usePresenceDemoIdentity.ts` (lines 1-40) - separate Better Auth/GitHub session adapter used only by the presence demo.
13. `apps/web/utils/auth-client.ts` (lines 1-4) - Better Auth Vue client singleton.
14. `apps/web/server/api/auth/[...all].ts` (lines 1-6) - Better Auth HTTP handler.
15. `apps/web/server/api/presence-demo/identity.get.ts` (full file) - identity endpoint consumed by the demo composable.
16. `apps/web/server/utils/auth.ts` (lines 1-38) - Better Auth GitHub provider and SQLite session configuration.
17. `apps/web/server/plugins/presence-identity.ts` (lines 1-27) - maps the Better Auth session into a presence identity.

## Key Code

### Route finding and 404 cause

Nuxt 4's correct pages location here is `apps/web/app/pages/`. With no source/router override in `nuxt.config.ts`, this file should generate the static route:

```text
apps/web/app/pages/presence-demo.vue -> /presence-demo
```

The concrete, high-severity deployment problem is repository state: `git status --short -- apps/web` reports `app/pages/presence-demo.vue` as **untracked**. `HeaderNav.vue` is modified but unstaged. Therefore a deployment/build from the committed revision does not contain the page; navigation to `/presence-demo` falls through to `app/pages/[...slug].vue`, whose production branch throws `404 Page not found` when content lookup returns null (lines 20-22).

**Severity: blocker/high.** The route implementation exists only in the working tree. The associated Better Auth server/composable files are also untracked, so committing only the page would produce an incomplete feature.

A second Nuxt-4-specific risk is placing a page at legacy/root `apps/web/pages/`; this project has no `srcDir` override, so that location would not be the active Nuxt 4 app directory. The current file is already in the correct `app/pages` location.

Static `presence-demo.vue` should outrank `[...slug].vue`; the catch-all is not itself the cause while the concrete page is included in the build. Nitro prerender configuration only names `/`, but `crawlLinks: true` can discover `/presence-demo` from `HeaderNav`; SSR deployments also do not require an explicit prerender entry.

### Authentication split

There are currently two independent auth systems:

- **Main/admin blog auth:** `/login` -> `useFirebaseAuth()` -> Firebase Google popup/redirect. `isAdmin` compares the Firebase email to `runtimeConfig.public.adminEmails`. `/admin` uses `admin-auth` middleware.
- **Presence demo auth:** `usePresenceDemoIdentity()` -> Better Auth Vue client -> GitHub OAuth -> `/api/auth/**`; it refreshes identity from `/api/presence-demo/identity` and the server plugin exposes that identity to `nuxt-presence`.

They do not share cookies, users, state, sign-in, or sign-out. The global header currently displays navigation/search/social/dark-mode only; it does not initialize `useFirebaseAuth`, show a user, or link to `/login`.

## Architecture

`app.vue` wraps routes in the default layout. The layout owns `HeaderNav`, so header authentication belongs in `app/components/HeaderNav.vue` if it must be site-wide. File routes and the content catch-all coexist under `app/pages`; concrete page routes take precedence.

Minimal integration points:

1. **Make `/presence-demo` deployable:** include `app/pages/presence-demo.vue` plus its referenced composable and required Better Auth server/client files in the committed change. No router config is needed.
2. **Expose existing main login in the header:** add a `/login` link in `HeaderNav.vue`. This is the smallest integration and needs no auth initialization.
3. **Show authenticated state/sign-out in the header:** reuse `useFirebaseAuth()` in `HeaderNav.vue`, call `init()` client-side, and render `user`/`signOut`. Do not create another auth wrapper.
4. **If presence must use main blog authentication:** this is not a header-only change. Replace the Better Auth identity bridge with Firebase session verification server-side; client Firebase state alone is not a trusted server identity. Product/provider choice is required before merging the two systems.

## Start Here

Open `apps/web/app/pages/presence-demo.vue` first, then verify it and every dependency it imports are tracked. The immediate 404 is a source-control/deployment inclusion issue, not a missing Nuxt router declaration.

## Residual Risks

- No fresh Nuxt build/route manifest was generated during this read-only trace; the existing `.nuxt` directory had no inspectable page route manifest.
- The working tree already contains unrelated modified/untracked files. Nothing was staged by this trace.
- A static-only host must publish Nuxt's generated fallback/routes correctly; the repository config alone cannot prove host rewrite behavior.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Concrete blocker identified: apps/web/app/pages/presence-demo.vue is untracked, so committed builds omit /presence-demo and the production catch-all at apps/web/app/pages/[...slug].vue returns 404; exact routing and auth integration files are listed above."
    }
  ],
  "changedFiles": [],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "targeted find/grep/read inspection under apps/web",
      "result": "passed",
      "summary": "Mapped Nuxt pages, layouts, header, and both authentication flows."
    },
    {
      "command": "git status --short -- apps/web; git diff --cached --name-only",
      "result": "passed",
      "summary": "Confirmed presence-demo.vue and supporting auth files are untracked; no staged files were reported."
    }
  ],
  "validationOutput": [
    "Nuxt dependency is ^4.5.0.",
    "Page is correctly located at app/pages/presence-demo.vue but is untracked.",
    "Global header has no authentication UI; /login uses Firebase Google auth, while presence uses separate Better Auth GitHub auth."
  ],
  "residualRisks": [
    "No build was run because the task was read-only.",
    "Static host rewrite behavior was not available for inspection.",
    "Existing working-tree changes belong to another actor and remain unstaged."
  ],
  "noStagedFiles": true,
  "diffSummary": "No source files edited; only the requested scouting artifact was written outside the inspected repository.",
  "reviewFindings": [
    "blocker: apps/web/app/pages/presence-demo.vue - untracked page will not exist in a deployment from the committed revision.",
    "high: apps/web/app/composables/usePresenceDemoIdentity.ts and apps/web/server auth/presence files - untracked dependencies must accompany the page.",
    "medium: apps/web/app/components/HeaderNav.vue - presence navigation is only an unstaged modification and header has no main login/session control."
  ],
  "manualNotes": "Read-only trace; no application files changed or staged."
}
```
