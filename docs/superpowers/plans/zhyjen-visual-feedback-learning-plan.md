# ZhyJen Visual Feedback Learning Plan

## Purpose

This plan defines how ZhyJen teaches young people to code through **instant visual feedback**. The goal is to lower the barrier for beginners — especially young Christians, youths, mentors, and coding clubs who may have never written code before — by letting them edit real code on the left and immediately see the result on the right.

The plan aligns with the ZhyJen revival mission:

> **Learn to code. Build with purpose.**

## Core learning loop

Every activity follows the same simple loop:

```
Read instructions  →  Edit code  →  Run  →  See result  →  Reflect  →  Share
```

Why this works for beginners:

- They are not asked to memorise syntax first.
- They change one small thing and see it respond.
- They build something real, not abstract exercises.
- Reflection connects the technical work to purpose and character.

## Why visual feedback first

| Approach | Risk for beginners | Visual feedback approach |
|---|---|---|
| Console-first coding | Output is text-only and abstract | Immediate visual change on the page |
| Heavy setup | Installation, terminals, build tools | Browser-only editor + preview |
| Theory-first lessons | Feels disconnected from real work | Learn by editing a real project |
| Complex frameworks | Too many concepts at once | Plain HTML, CSS, then JavaScript |

ZhyJen should feel like a warm, guided sandbox — not a professional IDE.

## Learning phases

### Phase 1: See your code change the page (HTML + CSS)

**Goal:** Students believe they can code because they see instant results.

**Topics:**

- HTML structure: headings, paragraphs, images, links, divs
- CSS styling: colour, spacing, borders, fonts, layout
- The box model and simple flexbox/grid
- Accessibility basics: alt text, contrast, semantic tags

**Example activities:**

- Personal Profile Card
- Bible Verse Display Page
- Church Announcement Card
- Gratitude Journal Entry

**Feedback features:**

- Starter code with a working page
- Editor highlights HTML tags and CSS properties
- Preview updates when the student clicks **Run**
- Mini challenges that change one visible thing at a time

### Phase 2: Make the page respond (JavaScript basics)

**Goal:** Students understand that code can react to people.

**Topics:**

- Events: click, input, submit
- Variables and simple state
- DOM selection and updates
- Conditionals and loops in context

**Example activities:**

- Kindness Challenge Tracker
- Scripture Memory Flip Cards
- Habit Tracker
- Prayer Request Form Mockup

**Feedback features:**

- Console inside the preview for simple logs
- Step hints for JavaScript logic
- Visual state changes when buttons are clicked

### Phase 3: Build small projects with purpose

**Goal:** Students combine skills and finish something they can show.

**Topics:**

- Multi-section pages
- Navigation and simple routing
- Forms and validation
- Storing small amounts of data in localStorage

**Example activities:**

- Youth Group Event Page
- Personal Portfolio Page
- Church Media Showcase
- Kindness Campaign Landing Page

**Feedback features:**

- Project checklist visible in the workspace
- Preview works across different screen sizes
- "Share" button with export or GitHub Pages guidance

### Phase 4: Share and reflect

**Goal:** Students publish their work and reflect on what they learned.

**Topics:**

- Publishing with GitHub Pages
- Taking screenshots
- Presenting to a group
- Giving and receiving feedback

**Feedback features:**

- Reflection prompts inside the workspace
- Celebration when an activity is marked complete
- Share link or screenshot suggestion

## Activity template

Every activity in the database should include:

| Field | Purpose |
|---|---|
| `title` | Friendly, beginner-oriented name |
| `slug` | URL-friendly identifier |
| `description` | One-sentence summary |
| `area` | Learn / Build / Reflect / Share |
| `skillLevel` | Beginner / Intermediate / Advanced |
| `timeNeeded` | Estimated time |
| `order` | Sequence in the learning path |
| `tools` | What the student needs |
| `outcomes` | What they will learn |
| `steps` | Step-by-step instructions |
| `challenges` | Optional stretch tasks |
| `reflectionQuestions` | Prompts for reflection |
| `sharePrompt` | How to share the work |
| `starterCode` | Working starter HTML/CSS/JS |
| `solutionCode` | Reference solution for hints |

## Workspace UX principles

1. **Minimal chrome:** Only the instructions, editor, and preview are visible by default.
2. **Clear verbs:** buttons say "Run", "Reset", "Mark complete", "Save reflection".
3. **Instant Run:** Preview updates only when the student chooses, so they feel in control.
4. **Safe sandbox:** The preview runs in a sandboxed iframe.
5. **Progress is visible:** Status badges show "Not started", "In progress", "Completed".
6. **Encouraging tone:** Hints and error messages should sound like a mentor, not a compiler.
7. **Reflection is part of the work:** The reflection box is visible but optional.

## Feedback mechanisms to build next

### Must-have

- [ ] Preview refreshes when **Run** is clicked.
- [ ] Code auto-saves to Convex.
- [ ] Progress status updates to `in_progress` and `completed`.
- [ ] Starter code loads automatically.
- [ ] Reflection answers are saved.

### Should-have

- [ ] Error overlay in the preview when HTML/JS is broken.
- [ ] Step-by-step checklist with checkboxes.
- [ ] "Show hint" button that reveals the next small step.
- [ ] "Compare with starter" button.
- [ ] Celebration animation on completion.

### Nice-to-have

- [ ] Live preview as the student types (optional toggle).
- [ ] Console inside the workspace for JavaScript logs.
- [ ] Multi-file support for CSS and JS as separate tabs.
- [ ] Embedded screen-size toggle for responsive testing.

## Technical direction

- **Editor:** Monaco via `@monaco-editor/react`
- **Preview:** Sandboxed `<iframe>` with `srcDoc`
- **Persistence:** Convex `activityProgress` table with `code`, `status`, `notes`
- **Content:** Convex `activities` table with `starterCode` and `solutionCode`
- **Routing:** `/activities/:slug` opens the workspace
- **Responsive:** Workspace stacks into a single column on small screens

## Faith-informed framing

The feedback loop itself can reflect Christian values without preaching:

| Coding moment | Value connection |
|---|---|
| Seeing a small change help someone | Service |
| Revising code patiently | Perseverance |
| Writing clear, clean code | Excellence |
| Sharing work with a mentor | Humility and community |
| Building something that encourages others | Encouragement |

Reflection prompts should occasionally invite students to consider how their project could help or encourage someone else.

## Success metrics

- A first-time user can open an activity, edit starter code, run it, and see a change within 2 minutes.
- Students complete at least one Build activity before moving to JavaScript.
- Reflection answers are saved alongside progress.
- Mentor notes and showcases grow over time.

## Next implementation steps

1. Push the current schema and seed activities with starter code.
2. Test the workspace end-to-end with one activity.
3. Add error overlay and hint support.
4. Build a checklist component tied to activity steps.
5. Add a celebration/completion state.
6. Create the next set of HTML/CSS activities.
7. Add a mentor view to see student progress.

## Summary

ZhyJen’s teaching engine should be built around **visible, immediate, purpose-driven feedback**. Students learn by editing real code, running it, and reflecting on what they built. The workspace already provides the shell; the next work is to refine the feedback layer and expand the activity library.
