---
title: "Learning Nuxt 4.5"
description: "Nuxt 4.5 is the biggest release in a while — experimental SSR streaming, a useLayout composable, named views, an enabled option for data fetching, and lots of Nuxt 5 groundwork. Let's learn the features I'd actually reach for, one step at a time."
series: "nuxt-4-5"
nuxtVersion: "4.5"
releaseDate: 2026-07-18
sourceUrl: "https://nuxt.com/blog/v4-5"
difficulty: "Intermediate"
estMinutes: 40
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

The biggest one in a while — and a lot of it is plumbing for Nuxt 5. But there are real, usable features here too. Same approach as the earlier series: I use Nuxt every day, but 4.5 shipped things I hadn't put my hands on. Let's fix that together.

::BlogAlert{type="info"}
Based on the official [Nuxt 4.5 release notes](https://nuxt.com/blog/v4-5). We're learning to *use* what they shipped, not restating the docs. This release also announces Nuxt 3's upcoming end-of-life (July 31, 2026) — a good nudge to be on v4.
::

## How this series works

Each step takes one feature through the same path: **What's new → Why you'd care → Before → After → Do it yourself → Gotchas → Recap.**

Mark steps complete as you go — progress is saved in your browser. Start with step one.
