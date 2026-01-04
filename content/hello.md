---
title: Getting Started
description: Learn how to empower your Nuxt application with the Nuxt Content module.
tag: Documentation
img: 'https://res.cloudinary.com/ddszyeplg/image/upload/v1642350413/vantol/black-text_emxagi.png'
author:
  name: Vantol Bennett
  img: 'https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg'
---

Empower your Nuxt application with `@nuxt/content` module: write in a `content/` directory and fetch your Markdown, JSON, YAML and CSV files through a MongoDB-like API, acting as a **Git-based Headless CMS**.

<!--more-->

::note
This page is a quick overview of how to use the updated Content v3 features in this blog.
::

## Writing Content

Learn how to write your `content/`, supporting Markdown, YAML, CSV and JSON.

::tip
Use the MDC syntax to integrate Vue components directly into your Markdown files.
::

## Fetching Content

In Nuxt Content v3, use the `queryCollection` API to fetch your data.

```ts
const { data: posts } = await useAsyncData('blog', () => {
  return queryCollection('blog').all()
})
```

## Displaying Content

Display your Markdown content with the `<ContentRenderer>` component directly in your template.

::callout{icon="🚀" title="Pro Tip"}
We have added custom Prose overrides for images, code blocks, and inline code to match the monochrome aesthetic of this site.
::