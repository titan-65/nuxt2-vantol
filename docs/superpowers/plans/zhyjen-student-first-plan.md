# ZhyJen Student-First Plan

Status: accepted. Produced 2026-06-13 after a `grill-with-docs` session against `apps/zhyjen/CONTEXT.md`, the existing revival plan (`docs/superpowers/plans/zhyjen-revival-plan.md`), the visual-feedback learning plan (`docs/superpowers/plans/zhyjen-visual-feedback-learning-plan.md`), and the current Convex schema in `apps/zhyjen/convex/schema.ts`.

Companion file: `apps/zhyjen/CONTEXT.md` — the resolved glossary this plan binds to. If a term in this plan disagrees with `CONTEXT.md`, `CONTEXT.md` wins.

---

## 0. North star

A brand-new student signs up, answers **one** question about their coding experience, and is greeted inside their workspace with a short, ordered list of "things to accomplish" — beginning with one Activity they can open and finish in under five minutes. When they finish it, the list grows and unlocks the next Track.

---

## 1. Decisions resolved in `CONTEXT.md`

| Question                                 | Decision                                                                                                                                                                                  |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What is a "Track"?                       | Frontend label for the existing `phase` field. **No new table.** Four Tracks: **Web Foundations → Make It Interactive → Real Projects → Share Your Work**.                                |
| How does a student get into a workspace? | **Two paths**, both first-class: (a) mentor creates a workspace and invites students by email; (b) self-learner signs up cold and creates their own workspace.                            |
| What does a brand-new student see?       | A **Start here** view: their current Track's first three Activities in `order`, with a pinned "Start" CTA. No tabs. After they open the first Activity, the regular dashboard takes over. |
| Placement question                       | A single radio: "Have you written any code before?" → `none` / `a_little` / `comfortable` → starting Track.                                                                               |

---

## 2. What already exists — do **not** rebuild

Verified in `apps/zhyjen/`:

- **Schema** (`convex/schema.ts`): `workspaces`, `profiles`, `workspaceMembers`, `lessons`, `activities`, `activityProgress`, `invitations`, `notifications`, all of the Forge tables.
- **Auth**: Clerk via `@clerk/react` and `convex/auth.config.ts`. `convex/profiles.helpers.ts#getCurrentProfile` resolves the current user.
- **Mentor onboarding** (`src/onboarding/OnboardingPage.tsx`): 3 steps, calls `api.onboarding.completeOnboarding`, persists draft to `localStorage` under `zhyjen-onboarding`.
- **Dashboard** (`src/dashboard/DashboardPage.tsx`): tabs, phase-locking via `api.progress.hasCompletedPhase`, live `useQuery` reads.
- **Activity workspace** (`src/workspace/ActivityWorkspace.tsx`): editor + preview, Run, save code, mark complete, reflect, share, celebration.
- **Routing** (`src/router.ts`): `/`, `/learn`, `/activities`, `/dashboard`, `/forge`, `/mentor`, `/reflect`, `/share`, `/login`, `/signup`, `/activities/:slug`. Just need to add `/invitations/:token` in Slice 5.
- **Seeding** (`README.md`): `lessons:seedStarterLessons` and `activities:seedStarterActivities` already run.

---

## 3. The two allowed schema changes

Calling these out explicitly so we don't slide into more:

1. **`profiles.experience`** — optional union `none | a_little | comfortable`. Reason: the placement answer has to survive across devices, and `localStorage` is per-device.
2. **`invitations.token`** — string field for shareable accept links. Reason: a token-based link is more secure and durable than a `?email=` URL.

Everything else stays.

---

## 4. The plan — tracer-bullet MVP first, then layers

### Slice 0 — Names + shared language _(½ day)_

- `src/tracks.ts` — single source of truth:
  ```ts
  export const TRACKS = [
    {
      phase: "html-css",
      name: "Web Foundations",
      tagline: "Build your first pages with HTML and CSS.",
    },
    {
      phase: "javascript",
      name: "Make It Interactive",
      tagline: "Add behavior, events, and state.",
    },
    {
      phase: "multi-skill",
      name: "Real Projects",
      tagline: "Combine skills into finished projects.",
    },
    { phase: "publish", name: "Share Your Work", tagline: "Publish, present, and reflect." },
  ] as const;
  ```
- `trackNameForPhase(phase)`, `trackForExperience(experience)`, `currentTrackForProfile(profile, progress)` — all pure, all unit-testable, the **only** functions that decide "what Track is this student on?"
- Replace every user-facing "phase" word with the Track name in `DashboardPage.tsx` and `ActivityWorkspace.tsx`.

**Done when:** the existing dashboard reads "Web Foundations" and "Make It Interactive" instead of `html-css` / `javascript`. No behavior change.

### Slice 1 — Store the experience answer _(½ day)_

- Add `experience` to `profiles` in `convex/schema.ts`.
- Add `convex/profiles.ts#setExperience` mutation (requires Clerk auth via `getCurrentProfile`).
- `vp exec convex codegen`.
- Unit tests for `currentTrackForProfile`: 0 progress + `experience: "none"` → Track 0; 0 progress + no experience → Track 0 (default); any completed `html-css` activity → Track 1; etc.

**Done when:** `setExperience` is callable and the unit test passes.

### Slice 2 — Self-learner placement step _(1 day, tracer-bullet MVP)_

- Add a 4th step to `OnboardingPage.tsx`: single radio "Have you written any code before?" with the three options. Skip defaults to `none`.
- On submit, call `api.profiles.setExperience` _before_ `api.onboarding.completeOnboarding` (the profile must exist first).
- Extend the `localStorage` `zhyjen-onboarding` state with `experience`.
- Update the stepper to show 4 dots (Workspace / Profile / Invite / Start) or fold the question into the existing Invite step.
- After the step, route to `/dashboard` (existing destination).

**Done when:** a self-learner signs up at `/signup` → onboarding → dashboard, with their experience persisted on the profile.

### Slice 3 — Start-here dashboard view _(1 day, core deliverable)_

- In `DashboardPage.tsx`, branch on the student's state:
  - `profile.experience` set **and** `progress.length === 0` → render the **Start here** view.
  - Otherwise → render the existing dashboard, unchanged.
- Start-here view shows: Track name + tagline, the first 3 Activities in the current Track in `order`, a pinned first Activity with a "Start" CTA → `/activities/:slug`, and a small "Show all activities in this Track" link → `/activities`.
- The "graduate to the regular dashboard" check is `progress.length > 0`.

**Done when:** a brand-new self-learner lands on Start here, sees three activities, clicks Start on the first, opens the activity workspace, and on return the regular dashboard renders.

### Slice 4 — Track-filtered activities list _(½ day)_

- `src/pages/ActivitiesPage.tsx` (already exists) gets a Track segmented control. Default: the student's current Track. Locked Tracks show greyed, read-only.
- Reuse `TRACKS` and the phase-gate from `api.progress.hasCompletedPhase`.

**Done when:** a Web-Foundations student sees Web Foundations by default; other Tracks are visible but locked; completing one activity unlocks the next.

### Slice 5 — Invitation acceptance _(1 day)_

- New route `/invitations/:token`. `parseRoute` in `src/router.ts` learns the new branch.
- `convex/invitations.ts#accept` mutation: looks up by `token`, creates a `workspaceMember` with the role from the invitation, marks the invitation `accepted`, returns the `workspaceId`.
- The page renders Clerk sign-in/sign-up, then reuses Slice 2's experience component, then calls `accept` + `setExperience`, then routes to `/dashboard`.
- Add `token: v.string()` to `invitations` schema (the **second** allowed change).
- Mentors' Invite step generates a 32-char random token and an `/invitations/:token` URL.

**Done when:** a mentor sends an invite; a student clicks the link, signs up, answers the experience question, and lands inside the mentor's workspace.

### Slice 6 — Mentor sees students' progress _(1 day, high-value)_

- `src/pages/MentorPage.tsx` (already exists) gets a query: every `workspaceMember` with `role: "student"` in the current workspace, joined with their latest `activityProgress` per Activity.
- Render a simple table: student name, current Track, last Activity, status, last updated.
- No grading, no messaging. Visibility only.

**Done when:** a mentor opening `/mentor` sees a list of their students and a status per student.

### Slice 7 — Progress strip + advance toast _(½ day)_

- Regular dashboard gets a slim "You're on **Web Foundations** — 2 of 6 activities completed" progress strip at the top while the student is in their first Track.
- When a new Track unlocks, a one-time toast: "Nice — **Make It Interactive** is now unlocked."

**Done when:** the student always knows which Track they're on and when they've leveled up.

---

## 5. Acceptance criteria

- A brand-new self-learner goes from `/signup` to a "Start" CTA on an Activity in **3 minutes or less**.
- After editing the starter code, the preview updates on **Run** in under 2 seconds (existing behavior).
- After marking the Activity complete, the dashboard's "In progress" tab shows it; the next Track's Activities unlock.
- An invited student reaches the same state after accepting an invite link, **without** seeing a workspace-creation step.
- A mentor signing up the same way goes through the original 3-step flow and is **not** asked the experience question.
- The four Track names appear consistently everywhere a student looks. "Phase" is never seen by a student.
- Every existing screen — dashboard, activity workspace, forge, mentor, share, reflect — keeps working; only Track-name copy changes.
- `vp check` and `vp test` pass at every slice boundary.

---

## 6. Out of scope for this round (deferred, not dropped)

- **Parallel curricula** (e.g., "Game Dev" alongside "Web Dev"). Single linear `phase` progression only. If parallel paths become a need, a real `tracks` table is added then.
- **Video / live classes.** The revival plan explicitly says: "this is not a video-watching application."
- **Payments, subscriptions, monetization.** Free app, by direction.
- **i18n.** En-US copy.
- **Mentor grading / feedback flow.** Slice 6 is visibility only.
- **Lessons table UI.** Schema exists, no UI yet — leave for the next round.
- **Forge changes.** Forge is post-graduation; the dashboard's "Forge" entry stays as is.
- **Notifications, invitations UI for accept-by-email (no link).** The existing `invitations` table keeps the email field for the address book; the new `token` is the share mechanism.

---

## 7. What "full-fledged" means here

"Full-fledged" = the entire happy path — sign up → placed on a Track → first Activity → reflect → share — works end-to-end for a brand-new student, **with persistence across devices, an invite-based path for club/mentor scenarios, and a mentor visibility surface.** It does not mean every feature in the revival plan ships in one go. The deferred items above are the next round.

---

## 8. Recommended execution order

1. Slice 0 (Track names) — the lowest-risk, highest-clarity change.
2. Slice 1 (experience field) — small, additive, unblocks Slice 2.
3. Slice 2 (placement step) — the tracer bullet.
4. Slice 3 (Start here) — the **core deliverable**.
5. Slice 4 (Track-filtered list).
6. Slice 5 (invitations).
7. Slice 6 (mentor visibility).
8. Slice 7 (progress strip + toast).

Total estimate: ~5.5 working days of focused work, sliced so that after Slice 3 the north-star sentence is true end-to-end for a self-learner.
