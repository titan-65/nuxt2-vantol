---
kind: ticket
title: "Draft format & publish adapter (Blue Sky-first, X-ready)"
type: grilling
hitl: true
status: 0
blockedBy: [t1, t5]
---

## Question

Spec the **draft artifact** and the **publish step** the human later triggers. Grill:

- `social/drafts/<slug>.md` shape: frontmatter (platform, status: draft, post-url, char count)
  + body (the post text, split markers if a thread). Machine- and human-readable.
- The **publish adapter**: a command (e.g. `pnpm social:publish <slug>`) that reads the draft
  and posts to Blue Sky using t1's API. Human runs it after reviewing the committed draft.
- **Extensibility**: structure so an X adapter drops in later (different body/char rules)
  without redesign — honored as out-of-scope for *this* effort but designed-for.
- Where the adapter code lives and what creds it needs (Blue Sky app password in env).

Deliver the draft schema + publish flow as a linked asset. Feeds the final verdict (t7).
