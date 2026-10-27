# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Working developers and educators who want practical, field-tested Vue, Nuxt, TypeScript, and Nitro material. They arrive from search, social, or the Nuxt ecosystem looking for a specific answer, and stay when the writing is honest about what broke and why.

## Product Purpose

A personal publication by Vantol Bennett: essays, tutorials, and build notes that turn real shipped work into teachable material. Success means a reader finishes an article, trusts the author, and comes back or subscribes.

## Positioning

A Jamaican educator turned full-stack developer teaches by showing the work: the release notes, the production failure, the tradeoff, and the code that survived. The site is not a news feed or a course marketplace; it is one practitioner's field record.

## Operating Context

The site is built with Nuxt 4, Nuxt Content, Tailwind, and a set of first-party Nuxt layers. Essays live in `content/blog`, tutorials in the learn layer, and projects/publications/gallery in their own collections. The author writes long-form (35 essays, roughly 1,200 words on average) and uses code, diagrams, and screenshots inside posts.

## Capabilities and Constraints

- Public reading surfaces: home, blog index, blog article.
- Existing collections: `blog`, `tutorials`, `projects`, `publications`, `gallery`, `about`, `uses`.
- Existing interactive features: search, bookmarks, reactions, view counts, presence, comments, newsletter, dark mode.
- Current visual implementation is a dark SaaS-template shell; the redesign treats it as evidence, not authority.
- Scope for this pass: home, blog index, and article template. Remaining pages inherit the new tokens and chrome.
- Open decision: the existing `docs/superpowers/specs/2026-08-06-shipwalk-product-revamp-design.md` proposes a separate Shipwalk product identity. It is not used in this pass; this pass treats the site as Vantol Bennett's personal publication.

## Brand Commitments

- Name: Vantol Bennett.
- Voice: direct, practical, reflective, occasionally wry; no hype, no thought-leader register.
- Existing assets: Cloudinary portrait and cover images, `about-loop.mp4`, the `VantolBennett` domain and RSS feed.
- The author's Jamaican identity and teaching background are material, not decoration.

## Evidence on Hand

- 35 published essays in `apps/web/content/blog`.
- 15 project/publication/gallery documents across their collections.
- Real author portrait and article cover images hosted on Cloudinary.
- No customer logos, benchmark claims, or testimonials were supplied; future work must not invent them.

## Product Principles

- Writing first: the newest essay is the most important thing on the page.
- Show the work: code, failure, and tradeoff beat summary and opinion.
- Teach without condescending: assume a capable developer, explain the non-obvious.
- Quiet craft: the interface should disappear into the reading.
- One practitioner, not a content brand.

## Accessibility & Inclusion

WCAG AA contrast for body and controls, visible keyboard focus, reduced-motion support, semantic landmarks, and a reading measure that holds at 200% zoom.
