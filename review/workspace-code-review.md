# ZhyJen Interactive Coding Workspace — Code Review

**Scope:** `apps/zhyjen` workspace implementation (Convex backend + React frontend).  
**Files inspected:** `convex/schema.ts`, `convex/activities.ts`, `convex/progress.ts`, `convex/onboarding.ts`, `src/workspace/ActivityWorkspace.tsx`, `src/workspace/CodeEditor.tsx`, `src/workspace/PreviewFrame.tsx`, `src/workspace/workspace.css`, `src/pages/ActivityPage.tsx`, `src/api.ts`, `src/main.tsx` (plus supporting files `src/App.tsx`, `src/types.ts`, `src/data/activities.ts`, `convex/profiles.helpers.ts`).

---

## 1. Correctness / Security Issues

### Blocker — Activity catalog is split between two conflicting data sources
- **Location:** `src/pages/ActivitiesPage.tsx` (uses `src/data/activities.ts`) vs. `src/pages/ActivityPage.tsx` / `convex/activities.ts`.
- **Evidence:**
  - Hardcoded catalog lists 4 activities (`profile-card`, `event-page`, `kindness-tracker`, `verse-display`) and links to `/activities/${slug}`.
  - Convex seed only creates 3 activities (`profile-card`, `verse-display`, `kindness-tracker`). `event-page` is missing.
  - When a user clicks **Youth Group Event Page**, `ActivityPage` queries Convex, gets `null`, and renders the "Activity not found" state.
- **Impact:** A marketed activity is unreachable after navigation.

### Blocker — Runtime type mismatch between Convex records and `ActivityDetail`
- **Location:** `src/types.ts:15` (`overview: string`), `src/workspace/ActivityWorkspace.tsx:153` (`activity.overview`), `convex/schema.ts:58` (`description: v.string()`).
- **Evidence:** The Convex `activities` table stores `description`, not `overview`. The workspace component renders `activity.overview`, which is `undefined` for Convex-backed activities. `src/pages/ActivityPage.tsx:10` hides this with an `as ActivityDetail & { _id: ... }` cast.
- **Impact:** The Overview section in the workspace is blank for all DB-loaded activities. TypeScript also does not protect against future field drift.

### Blocker — Autosave can leave the database out of sync with the editor
- **Location:** `src/workspace/ActivityWorkspace.tsx:42-68`.
- **Evidence:** `autosave` skips the network call when `nextCode === (progress?.code ?? starterCode)`. `progress` is a prop that does not update during the session; it represents the code at page load, not the last saved value.
- **Scenario:**
  1. Student loads activity (DB code = starter).
  2. Student edits to custom code → autosave writes custom code to DB.
  3. Student clicks **Reset** → editor returns to starter code.
  4. Autosave compares starter code with `progress?.code` (still starter from page load) and skips saving.
  5. DB still contains the custom code; on next load the student sees the reset code but the saved state is wrong.
- **Impact:** Data integrity bug for the primary user artifact (student code).

### High — Duplicate reflections are created on every save
- **Location:** `convex/progress.ts:111-120` (`saveReflection`).
- **Evidence:** The mutation always `ctx.db.insert("reflections", ...)` and never checks for an existing reflection. The schema has no unique index on `(profileId, activityId)` for `reflections`.
- **Impact:** Students can accidentally (or maliciously) create unlimited reflection rows by clicking the button repeatedly.

### High — `activityProgress` uniqueness is assumed but not enforced
- **Location:** `convex/schema.ts:89`, `convex/progress.ts:37-39`, `convex/progress.ts:85-87`.
- **Evidence:** `by_profile_activity` is a regular index, not unique. Both `markActivity` and `saveCode` call `.unique()`. If duplicate rows ever exist, `.unique()` throws and the mutation fails.
- **Impact:** Hard failure for core save/completion flows.

### Note — Sandboxed iframe is acceptable but could be hardened
- **Location:** `src/workspace/PreviewFrame.tsx:9-10`.
- **Evidence:** Uses `srcDoc={code}` with `sandbox="allow-scripts"`. The resulting document has an opaque origin, so it cannot access `parent` or same-origin storage. Scripts are still allowed to make network requests (`fetch`, `XMLHttpRequest`, `<script src>`, `<img src>`, etc.) and could render arbitrary external content or phishing UI inside the preview pane.
- **Assessment:** This is a reasonable baseline for a live-code playground, but there is no parent CSP, no `Content-Security-Policy` on the iframe, and no origin-isolation upgrade. For a youth-facing product, consider:
  - Serving previews from a separate static origin or `blob:` with a stricter CSP.
  - Adding `referrerpolicy="no-referrer"` to the iframe.
  - Capturing `console` errors and network failures so students get feedback instead of a broken preview.

### Note — Monaco editor loads from a CDN with no loading or error state
- **Location:** `src/workspace/CodeEditor.tsx:1`, `src/workspace/CodeEditor.tsx:11`.
- **Evidence:** `@monaco-editor/react` defaults to loading Monaco from jsDelivr. `CodeEditor` does not pass `loading` or `onMount`/`onValidate` handlers and does not surface loader failures.
- **Impact:** On slow, offline, or CSP-locked networks the editor area can appear blank or fail silently. Also leaks request metadata to the CDN.

### Note — No Content Security Policy or iframe sandbox documentation
- **Location:** `index.html` (not inspected in detail), `src/main.tsx`.
- **Evidence:** No `Content-Security-Policy` meta tag or headers are visible in the reviewed files. The iframe relies entirely on the `sandbox` attribute.

---

## 2. Schema / Data Model Issues

### Blocker — Missing unique constraints on business keys
- **Location:** `convex/schema.ts`.
- **Evidence:**
  - `workspaces.slug` has `.index("by_slug", ["slug"])` but no unique index.
  - `activities.slug` has `.index("by_area", ["area"])` and `.index("by_order", ["order"])` but no index or unique constraint on `slug`.
  - `profiles.clerkUserId` has `.index("by_clerk_user_id", ["clerkUserId"])` but no unique constraint.
  - `activityProgress` lacks a unique index on `(profileId, activityId)`.
  - `reflections` lacks a unique index on `(profileId, activityId)`.
- **Impact:** Duplicate slugs can break routing; duplicate progress/reflection rows break `.unique()` lookups; duplicate Clerk IDs can create multiple profiles per user.

### High — `lessons` table is defined but unused
- **Location:** `convex/schema.ts:32-43`.
- **Evidence:** `lessons` has a schema and indexes, but no queries/mutations reference it. `activities.lessonId` is optional and also unused.
- **Impact:** Dead schema adds maintenance burden and hints at incomplete feature work.

### High — `activityProgress.notes` is orphaned
- **Location:** `convex/schema.ts:84`, `convex/progress.ts:29`, `convex/progress.ts:47`, `convex/progress.ts:61`.
- **Evidence:** The table has a `notes` field and `markActivity` accepts it, but the UI never writes to it; reflections are stored in a separate `reflections` table.
- **Impact:** Two places for the same concept. Decide whether reflections belong on `activityProgress` (single row per activity) or in the `reflections` table (history/append-only).

### Note — `invitations` lacks a workspace+email lookup index
- **Location:** `convex/schema.ts:102-110`.
- **Evidence:** Indexes are `by_workspace` and `by_email`, but there is no composite `(workspaceId, email)` index.
- **Impact:** Cannot efficiently check whether an invitation already exists before inserting, which will matter once duplicate-prevention logic is added.

### Note — `onboarding.ts` does not validate slug or email shape
- **Location:** `convex/onboarding.ts:14-48`.
- **Evidence:** `args.workspace.slug` and `args.invites[]` are accepted as plain strings. There is no normalization, no empty-string guard, and no slug-format validation.
- **Impact:** Workspaces can be created with empty or malformed slugs that later break routing or invitation lookups.

---

## 3. UI / UX Problems

### High — Core mutations have no loading or error feedback
- **Location:** `src/workspace/ActivityWorkspace.tsx:74-104`.
- **Evidence:** `handleStart`, `handleComplete`, `handleSaveReflection`, and `autosave` call Convex mutations but do not track pending/error state. Buttons remain clickable during the async call, and failures are silent.
- **Impact:** Students may click **Mark complete** multiple times, see no confirmation, and not know if their work was saved.

### High — Reflection save button gives no success feedback
- **Location:** `src/workspace/ActivityWorkspace.tsx:180-192`.
- **Evidence:** After `saveReflection` resolves, there is no confirmation, no timestamp, and the textarea is not cleared or disabled.
- **Impact:** Students cannot tell whether their reflection was recorded.

### Note — Preview does not capture runtime errors
- **Location:** `src/workspace/PreviewFrame.tsx`, `src/workspace/ActivityWorkspace.tsx:69-71`.
- **Evidence:** The preview is a plain iframe. JavaScript errors, missing resources, or `console.log` output are not surfaced to the student.
- **Impact:** Beginners cannot debug why their page "doesn't work."

### Note — Editor loading state is not handled
- **Location:** `src/workspace/CodeEditor.tsx:9-26`.
- **Evidence:** No `loading` prop, no spinner, no fallback if Monaco fails to initialize.

### Note — Responsive layout trades preview visibility
- **Location:** `src/workspace/workspace.css:188-230`.
- **Evidence:** Below `1120px` the preview drops below the editor, which is good. Below `760px` the instructions, editor, and preview stack vertically. On a phone this is usable but requires a lot of vertical scrolling.
- **Suggestion:** Consider a tabbed mobile view (Instructions | Code | Preview) so the editor and preview are not competing for limited vertical space.

### Note — "Back to activities" uses a plain `<a>` tag
- **Location:** `src/workspace/ActivityWorkspace.tsx:115-118`.
- **Evidence:** Although `App.tsx` intercepts clicks for in-app routes, relying on global click interception is fragile. A router-aware link component would be more robust.

---

## 4. Code Quality / Maintainability Concerns

### High — `api = anyApi` disables Convex type safety
- **Location:** `src/api.ts:1-3`.
- **Evidence:** `export const api = anyApi;` instead of the generated typed API.
- **Impact:** No compile-time verification of argument shapes or return types for mutations/queries. This directly contributed to the `overview`/`description` mismatch going unnoticed.

### High — Frontend types do not match the database schema
- **Location:** `src/types.ts:14-19`, `src/pages/ActivityPage.tsx:10`, `src/workspace/ActivityWorkspace.tsx:21-25`.
- **Evidence:**
  - `ActivityDetail` requires `overview` and `buildGoal`.
  - Convex `activities` table has `description` but not `overview` or `buildGoal`.
  - The mismatch is papered over with `as` casts.
- **Impact:** TypeScript cannot catch data-shape bugs; runtime behavior diverges from types.

### High — No automated tests
- **Location:** Entire `apps/zhyjen` workspace.
- **Evidence:** `find **/*.test.{ts,tsx}` returned no results.
- **Impact:** Core flows (autosave, progress mutation, reflection saving, preview rendering) are unprotected against regressions.

### Note — `ActivityWorkspace` mixes data fetching, state management, and UI
- **Location:** `src/workspace/ActivityWorkspace.tsx`.
- **Evidence:** The component is ~250 lines and owns autosave logic, progress mutations, reflection mutations, and layout. Splitting into smaller hooks/components (`useAutosave`, `ReflectionForm`, `WorkspaceToolbar`) would improve readability and testability.

### Note — `seedStarterActivities` does an upsert but mutates `createdAt`
- **Location:** `convex/activities.ts:168-186`.
- **Evidence:** On existing records, the code spreads `...activity` (which includes `createdAt: now`) and then overrides with `createdAt: existing.createdAt`. It works, but it is fragile: adding a new field to the spread could accidentally overwrite the original creation time.
- **Suggestion:** Build the update object explicitly instead of spreading the full seed record.

### Note — Magic numbers and one-off colors in CSS
- **Location:** `src/workspace/workspace.css`.
- **Evidence:** Many hardcoded values (`#8b5cf6`, `#0f1117`, `rgba(255,255,255,0.08)`, breakpoints `1120px`/`760px`) that are not derived from the global CSS variable system.
- **Impact:** Inconsistent theming and harder future re-skinning.

---

## 5. Smallest Safe Fixes Worth Applying Now

These are the minimal, low-risk changes that would fix the most severe issues without a large refactor.

1. **Unify the activity catalog.**
   - Either add `event-page` to `convex/activities.ts` or remove it from `src/data/activities.ts`.
   - Prefer making `ActivitiesPage.tsx` query Convex as well so the listing and detail views share one source of truth.

2. **Align the schema with the frontend or the frontend with the schema.**
   - Option A (recommended): Add `overview: v.string()` and `buildGoal: v.optional(v.string())` to the `activities` table in `convex/schema.ts`, update the seed data in `convex/activities.ts`, and regenerate data types.
   - Option B: Change `src/workspace/ActivityWorkspace.tsx:153` to use `activity.description` and remove the unused `buildGoal` from `ActivityDetail`.

3. **Add unique indexes in `convex/schema.ts`.**
   - `workspaces`: `.index("by_slug", ["slug"]).unique()` if slugs are meant to be unique.
   - `activities`: add `.index("by_slug", ["slug"]).unique()`.
   - `profiles`: `.index("by_clerk_user_id", ["clerkUserId"]).unique()`.
   - `activityProgress`: replace `by_profile_activity` with a unique index.
   - `reflections`: add a unique index on `(profileId, activityId)` if reflections are meant to be one-per-activity, or change `saveReflection` to upsert.

4. **Fix autosave staleness.**
   - Track the last successfully saved code in a `useRef` or local state, and compare against that instead of `progress?.code`.
   - Example:
     ```tsx
     const [lastSavedCode, setLastSavedCode] = useState(progress?.code ?? starterCode);
     // in autosave:
     if (nextCode === lastSavedCode) return;
     await saveCode(...);
     setLastSavedCode(nextCode);
     ```

5. **Make reflection saving idempotent.**
   - In `convex/progress.ts:saveReflection`, query for an existing `(profileId, activityId)` reflection and `patch` it instead of always inserting, **or** add a unique index and handle the duplicate case in the UI by disabling the button after save.

6. **Add pending/error state to the primary actions.**
   - `handleComplete`, `handleStart`, and `handleSaveReflection` should disable buttons while the mutation is in flight and surface a toast/inline error on failure.

7. **Replace `anyApi` with the generated typed Convex API.**
   - Run `convex:codegen` and import the generated `api` in `src/api.ts`. Remove the `as` casts in `ActivityPage.tsx` and let the types reveal remaining mismatches.

8. **Improve the iframe preview experience.**
   - Add `referrerpolicy="no-referrer"` to the iframe.
   - Add a basic `console` message listener or error boundary so students see runtime feedback.
   - Document the sandbox policy in a comment above `PreviewFrame`.

9. **Add Monaco loading feedback.**
   - Pass a `loading` component to the `Editor` and an `onMount` handler to report initialization errors.

10. **Add a minimal test for the autosave + reset flow.**
    - A single test that simulates typing, resetting, and verifying the saved code would prevent the data-integrity regression described above.

---

## Summary

The workspace is visually well-structured and the sandboxed preview + Monaco editor form a solid foundation. However, the **activity catalog is currently broken** because the listing and detail pages read from different data sources, and the **Overview section is blank** due to a schema/type mismatch. Data-integrity bugs in autosave and reflection saving, plus the absence of type-safe Convex API usage, make this code risky to ship without the fixes listed in section 5.
