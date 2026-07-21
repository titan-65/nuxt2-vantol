---
title: "A Real Options Surface"
description: "Typed module options, deep-merged defaults, and declaration merging so users get autocomplete on your config key — plus the rule for deciding what belongs in public runtime config."
series: "nuxt-modules-advanced"
order: 2
feature: "ModuleOptions, deep-merged defaults, runtimeConfig split"
sourceUrl: "https://nuxt.com/docs/4.x/guide/going-further/modules"
difficulty: "Intermediate"
estMinutes: 11
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

The options a user writes under `presence:` in `nuxt.config.ts`, the defaults they merge into, and the runtime config that carries a subset of them across the build/runtime boundary.

## Why you'd care

Options are your module's public API. Once someone's config depends on a shape, changing it is a breaking change. Also: the split between public and private runtime config is a security decision, not a style one.

## Before

```ts
presence: { wall: { renderStyle: "cursive" } }
```

`presence` is untyped — no autocomplete, no error when you typo `renderStlye`. And setting `wall.renderStyle` wipes out every other `wall.*` default, because shallow merge replaces the whole object.

## After

Full autocomplete on the config key, and setting one nested option leaves its siblings alone.

## Do it yourself

### 1. Describe the shape

```ts
export type RenderStyle = "cursive" | "block" | "monogram";

export interface PresenceWallOptions {
  enabled: boolean;
  server: boolean;
  ttlSeconds: number;
  maxSignatures: number;
  combo: string[];
  mobilePath: string;
  renderStyle: RenderStyle;
}

export interface ModuleOptions {
  enabled: boolean;
  wall: PresenceWallOptions;
  mark: PresenceMarkOptions;
}
```

Internally every field is required. Users get a `DeepPartial` of it — required internally, optional externally, is what lets `setup()` stop null-checking.

### 2. Merge deeply, not shallowly

```ts
function deepMerge<T extends object>(base: T, override: DeepPartial<T> | undefined): T {
  if (!override) return base;
  const out: Record<string, unknown> = { ...base };

  for (const key of Object.keys(override)) {
    const value = (override as Record<string, unknown>)[key];
    const baseValue = (base as Record<string, unknown>)[key];

    if (isRecord(value) && isRecord(baseValue)) {
      out[key] = deepMerge(baseValue, value);
    } else {
      out[key] = value;
    }
  }

  return out as T;
}
```

`isRecord` deliberately rejects arrays. A user setting `combo: ["KeyK"]` means *replace the combo*, not merge index-wise into the default.

### 3. Give the config key types

```ts
declare module "@nuxt/schema" {
  interface NuxtConfig {
    presence?: DeepPartial<ModuleOptions>;
  }
  interface NuxtOptions {
    presence?: DeepPartial<ModuleOptions>;
  }
}
```

Declaration merging is the step most first modules skip. It's what turns your config key from `any` into something the editor can complete and typecheck.

### 4. Split runtime config by audience

```ts
// Ships to the browser. Anyone can read it in the page source.
nuxt.options.runtimeConfig.public.presence = {
  combo: resolved.wall.combo,
  mobilePath: resolved.wall.mobilePath,
  renderStyle: resolved.wall.renderStyle,
};

// Server-only. The routes need the limits; the browser has no use for them.
nuxt.options.runtimeConfig.presence = {
  ttlSeconds: resolved.wall.ttlSeconds,
  maxSignatures: resolved.wall.maxSignatures,
};
```

The rule: **public runtime config is published**. Put something there and you've shipped it to every visitor, permanently, in a file search engines can index. Ask "would I paste this in a public issue?" before adding a key.

### 5. Options that reach a component

The wall's `renderStyle` has to get from build-time options into a component. The obvious move is calling `useRuntimeConfig()` inside the component — but that drags a Nuxt-only import into a component you'd like to mount in a plain unit test. The alternative:

```ts
// src/runtime/utils/renderStyle.ts
let defaultStyle: RenderStyle = "cursive";

export function setDefaultRenderStyle(style: RenderStyle): void {
  if (style in STYLES) defaultStyle = style;
}

export function signatureStyle(sig: { text: string }, style?: RenderStyle): SignatureStyle {
  return (STYLES[style!] ?? STYLES[defaultStyle])(sig.text);
}
```

The client plugin — which already has `nuxtApp.$config` — pushes the configured value in at startup. The component takes an optional prop and otherwise follows that default. It stays free of Nuxt imports, and bad config can't break rendering because `setDefaultRenderStyle` ignores unknown styles.

## Gotchas

- **`defaults` in `defineNuxtModule` and your `defaults` object must agree.** Two sources of truth drift; keep one and reference it.
- **Arrays replace, objects merge.** Decide this deliberately and document it.
- **Public runtime config is not a secret store.** No keys, no tokens, no internal URLs.
- **Validate enum-ish options at the boundary.** A typo'd `renderStyle` should fall back, not throw at render.

## Recap

Required internally, `DeepPartial` externally, deep-merged defaults, declaration merging for autocomplete, and a public/private split you decide on purpose. Next: tests worth having.
