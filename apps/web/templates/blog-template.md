---
title: "Blog Post Title"
description: "A brief description of the blog post for SEO and previews."
date: 2024-01-01
tag: "Technology"
img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
readTime: 5
keywords: [nuxt, vue, tailwind]
language: "TypeScript"
rating: 5
---

# Introduction

Write your introduction here. This text will appear before the excerpt divider.

<!--more-->

# Main Content

After the divider, you can continue your post. You can use various MDC components we've set up:

::BlogAlert{type="info"}
This is an information alert using the BlogAlert component.
::

::BlogAlert{type="warning"}
This is a warning alert.
::

## Code Example

```ts [example.ts]
const greeting = "Hello, Monochrome World!";
console.log(greeting);
```

## Using a Card

::BlogCard
### Important Note
You can even use Markdown inside this card!
::

## Callout

::Callout{icon="🚀" title="Pro Tip"}
Use Callouts for highlighted tips or takeaways.
::

---

Conclusion goes here.
