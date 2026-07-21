# @vantol/presence

A Nuxt module that gives any Nuxt site two ways to express the developer's presence:

- **The Wall** — a hidden communal scratch board. Visitors draw signatures that float, age, and dissolve.
- **The Mark** — a cryptographic token stamped invisibly into the page, proving the dev authored this build.

## Install

```bash
pnpm add @vantol/presence
```

## Usage

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@vantol/presence"],
  presence: {
    wall: { server: true },
    mark: { handle: "your-handle" },
  },
});
```

See `apps/web/content/learn/nuxt-modules/` for the tutorial series.
