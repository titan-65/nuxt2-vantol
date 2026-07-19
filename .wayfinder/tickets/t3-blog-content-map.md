---
kind: ticket
title: "Blog content structure & deploy→post mapping"
type: research
hitl: false
status: 0
blockedBy: []
---

## Question

Pin down the exact input the local model will receive. From recon we know posts live in
`apps/web/content/blog/*.md` with frontmatter `title, description, date, tag, keywords,
readTime, author, ...` and URLs `/blog/[slug]` + `/posts/[slug]`. Confirm and close gaps:

- Exact frontmatter schema per post (which fields exist, which are reliable).
- Slug derivation: is the filename the slug? Do `/blog` and `/posts` share content?
- The **public URL** form for a given slug (needed as the link in the promo).
- What constitutes "a new/updated post" from a deploy delta (added file vs changed frontmatter
  vs body edit) — and whether tutorials live under a different content dir.
- Any existing RSS/sitemap the worker could use instead of reading markdown.

Deliver a concise **content-contract** doc: the precise fields + URL pattern the draft step
consumes. This is the input spec for both the local-model prototype (t4) and the worker (t5).
