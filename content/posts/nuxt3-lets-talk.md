---
title: Nuxt3-RC 10 Lets Talk
description: Nuxt3 RC is now 10 releases old but how does it stack up with past releases.
keywords: [developer, jamaican, vue.js, supabase, Nuxt3, vite]
language: Javascript - Vue.js
tag: Nuxt3
rating: 4
readTime: 10
img: 'https://res.cloudinary.com/ddszyeplg/image/upload/v1642350413/vantol/black-text_emxagi.png'
author:
name: Vantol Bennett
website: www.teammps.com
img: 'https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg'
---

# Nuxt3 RC 

Since its release last year October, Nuxt 3 Beta to RC10; Nuxt developers and maintainers have place a lot of 
emphasis on the performance first to be blazing fast with impressive features suchas auto imports (the best feature to date)
and not coming to nearly a year the stable version should see the long await Hybrid Generation which will allow developers to 
develop web application to exisit on both a static and server side rendered environment. So lets look at RC10 and see if we can make heads or tails of this release.


# Features at a Glance

```
Nuxt 3 Release Candidate 10 is out ✨

🚀 Full Static Generation
⚡️ Link Prefetching
💨 Inlined Critical Styles
0️⃣ Experimental Zero-Client-JS Mode
🪡 55+ enhancements and bug fixes
```

## Full Static Generation

Static rendering is basically files being pre-rendered using ```nuxt generate``` which allows for Nuxt to be deployed to any static 
hosting without a server API, but Nuxt3 takes it to whole other level based on the update changes in RC10 - however it does not give 
us the long await hybrid or incremental generated pages so its a start (hopefully RC12).

## Link Prefetching

This feature ported from Nuxt 2, is automatically prefetching the next pages when a <NuxtLink> is in the viewport.

This feature is integrated with vue-router to prefetch components of the next route and also payload extraction to prefetch the payload of the next pages ahead of time! You can also hook into link:prefetch to do more prefetches.


### so much more have [read here](https://github.com/nuxt/framework/discussions/7513)

## What's Next?

Your guess is as good as mine the stable version was promised from Summer and summer is well summer. It seems the best bet
would be for Nuxt 3 to come out in October the same time the beta was announced but I am just guessing. 

## How to get started

Well the Nuxt3 RC documentation is your best bet for all your nuxt goodness. I will be starting a deep in Nuxt soon be update.

Peace......
