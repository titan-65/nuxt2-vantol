# Nuxt Assistant (`nuxt-assistant`)

An intelligent, interactive personal portfolio and developer assistant module for Nuxt 4 applications.

## Features

- 💬 **Interactive Assistant UI**: Floating widget + Command Palette drawer with dark-mode aesthetic.
- ⚡ **Global Shortcuts**: Trigger with `Cmd+K` or `Ctrl+K` from anywhere in your site.
- 🧠 **Smart Knowledge Engine**: Built-in intent query engine powered by site sitemap, bio, projects, tutorials, and blog articles.
- 🔌 **Composable & Console API**: Access via `useNuxtAssistant()` composable or `window.$assistant` console helper.
- 🛠️ **Nitro Server Integration**: Server endpoints `/api/_assistant/chat`, `/api/_assistant/knowledge`, `/api/_assistant/search`.

## Installation & Setup

Add `nuxt-assistant` to `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ["nuxt-assistant"],
  assistant: {
    enabled: true,
    autoMount: true,
    shortcut: ["Cmd+K", "Ctrl+K"],
    position: "bottom-right",
    persona: {
      name: "Nox",
      avatar: "/eve.png",
      title: "Personal Assistant",
      greeting: "Hi! Ask me anything about projects, articles, or site navigation!",
    },
  },
});
```
