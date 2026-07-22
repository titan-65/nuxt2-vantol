# Nuxt Assistant Module — Implementation Plan

> **Goal:** Build `nuxt-assistant` — a Nuxt 4 module providing an intelligent, interactive personal portfolio & developer assistant for Nuxt sites (deployed into `apps/web`), with complete options surface, client widget, composable, console helper, server handlers, and Vitest test coverage.

## Architecture

- **Package**: `packages/assistant/` (npm package `nuxt-assistant`).
- **Module Registration (`src/module.ts`)**: Registers runtime plugin, auto-imported `<NuxtAssistant>` component, `useNuxtAssistant` composable, and Nitro server endpoints `/api/_assistant/chat`, `/api/_assistant/knowledge`, `/api/_assistant/search`.
- **Options & Augmentation (`src/options.ts`)**: Extends `@nuxt/schema` with `assistant?: DeepPartial<ModuleOptions>` for type-safe config in `nuxt.config.ts`.
- **Pure Testable Client (`src/runtime/plugins/assistant.client.ts`)**: Decoupled from Nuxt `#app` virtual imports for direct Vitest unit testing.
- **Server Knowledge Engine (`src/runtime/server/api/chat.post.ts`)**: Smart intent engine matching visitor questions against portfolio content, bio, projects, tutorials, and site navigation actions.

---

## File Structure

```
packages/assistant/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── shims-vue.d.ts
├── README.md
├── src/
│   ├── module.ts
│   ├── options.ts
│   └── runtime/
│       ├── components/
│       │   ├── NuxtAssistant.vue
│       │   └── AssistantChat.vue
│       ├── composables/
│       │   └── useNuxtAssistant.ts
│       ├── plugins/
│       │   ├── assistant.client.plugin.ts
│       │   └── assistant.client.ts
│       ├── server/
│       │   └── api/
│       │       ├── chat.post.ts
│       │       ├── knowledge.get.ts
│       │       └── search.get.ts
│       └── utils/
│           ├── engine.ts
│           └── sitemap.ts
└── test/
    ├── options.test.ts
    ├── plugin.test.ts
    ├── engine.test.ts
    ├── composable.test.ts
    └── module.test.ts
```

---

## Tasks

1. **Scaffold `packages/assistant/` Skeleton** (`package.json`, `tsconfig.json`, `vitest.config.ts`, `README.md`).
2. **Implement Options Surface & Nuxt Schema Augmentation (`src/options.ts`)**.
3. **Implement Query Engine & Knowledge Base (`src/runtime/utils/engine.ts`, `src/runtime/utils/sitemap.ts`)**.
4. **Implement Nitro Server Handlers (`chat.post.ts`, `knowledge.get.ts`, `search.get.ts`)**.
5. **Implement Composable (`useNuxtAssistant.ts`) & Pure Client Plugin (`assistant.client.ts`)**.
6. **Implement Vue Assistant UI Component (`NuxtAssistant.vue`, `AssistantChat.vue`)**.
7. **Implement Nuxt Kit Module Definition (`src/module.ts`)**.
8. **Add Vitest Unit & Integration Tests in `packages/assistant/test/`**.
9. **Integrate into `apps/web` (`package.json`, `nuxt.config.ts`) and verify build & tests pass.**
