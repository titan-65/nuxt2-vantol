---
title: "Testing the Module"
description: "Three tiers of test — plain unit, mounted component, and a real Nuxt server — and a rule for deciding which tier a given behaviour belongs in."
series: "nuxt-modules-advanced"
order: 3
feature: "@nuxt/test-utils, unit vs e2e boundaries"
sourceUrl: "https://nuxt.com/docs/4.x/getting-started/testing"
difficulty: "Intermediate"
estMinutes: 12
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

Three tiers, cheapest first:

| Tier | Boots | Use it for |
|---|---|---|
| Plain unit | nothing | stores, pure logic, crypto, option merging |
| Component | happy-dom + `@vue/test-utils` | rendering, props, emits |
| e2e | a real Nuxt build | registration, routes, runtime config, head output |

## Why you'd care

The e2e tier is slow — it builds a Nuxt app. Push everything you can down a tier and your suite stays fast enough to run on every save. But some things *only* exist in a real build, and testing those anywhere else proves nothing.

## Before

One e2e test proving the module installs.

## After

Fifty-odd tests across the three tiers, running in under ten seconds.

## Do it yourself

### 1. Unit — the store

The store took a factory rather than a singleton export precisely so it could be tested like this:

```ts
it("evicts expired signatures on list", () => {
  const store = createWallStore({ ttlSeconds: 60, maxSignatures: 10 });
  store.add(input("old"));
  vi.advanceTimersByTime(61_000);

  expect(store.list()).toEqual([]);
});

it("caps at maxSignatures and evicts oldest", () => {
  const store = createWallStore({ ttlSeconds: 3600, maxSignatures: 2 });
  store.add(input("a"));
  store.add(input("b"));
  store.add(input("c"));

  expect(store.list().map((s) => s.text)).toEqual(["b", "c"]);
});
```

Fake timers make TTL testing exact instead of flaky. Never `await sleep(61000)` in a test suite.

### 2. Component — mount it directly

```ts
// @vitest-environment happy-dom
it("renders signatures through the requested renderStyle", async () => {
  const wrapper = mount(PresenceWall, {
    props: { open: true, renderStyle: "monogram" as const },
  });
  (wrapper.vm.$.exposed as WallHandle).add({ text: "hello", x: 50, y: 50 });
  await wrapper.vm.$nextTick();

  const sig = wrapper.find(".presence-wall__signature");
  expect(sig.text()).toBe("H");
});
```

This test is only possible because the component avoids Nuxt-only imports. That constraint from the previous step pays off here — the whole component tier stays available.

### 3. e2e — a real server, with config

`setup()` takes a `nuxtConfig`, which is how you exercise option-dependent behaviour:

```ts
await setup({
  rootDir: fileURLToPath(new URL("../playground", import.meta.url)),
  server: true,
  nuxtConfig: {
    presence: {
      wall: { server: true, maxSignatures: MAX, ttlSeconds: 60 },
    },
  },
});

it("stores a signature and returns it from GET", async () => {
  expect(await post(sig("hello"))).toMatchObject({ ok: true });

  const { signatures } = await $fetch<{ signatures: StoredSignature[] }>("/api/_presence/wall");
  expect(signatures.map((s) => s.text)).toContain("hello");
});
```

A `POST` followed by a `GET` in one test is the assertion that catches the two-stores bug from the first step of this series. Either route tested alone passes happily while the feature is broken.

### 4. What's worth asserting

Test the seams, not the framework:

- ✅ options resolve, including partial overrides
- ✅ routes exist when the flag is on, and respond with the documented error shapes
- ✅ what lands in `runtimeConfig.public` — this is published output
- ✅ the rendered `<head>`, when your module writes to it
- ❌ that Nuxt auto-imports components, that `ref` is reactive, that Node's crypto works

## Gotchas

- **One `setup()` per file.** It's module-scoped, so a file can only run one Nuxt config. Two configs, two files.
- **State persists between tests in a file.** One server, one store. Either order your tests deliberately or reset between them — silently depending on order is how a suite starts failing on a different machine.
- **`ignoreResponseError: true`** when asserting error bodies, otherwise `$fetch` throws before you can inspect the payload.
- **Import test helpers from your toolchain's entry**, not `vitest` directly, if you're on Vite+.

## Recap

Push logic down to the cheapest tier that can prove it, keep the component tier available by keeping components Nuxt-free, and reserve e2e for what only exists in a real build. Next: **[Nuxt Modules Capstone: The Signed Build](/learn/nuxt-modules-capstone)** — the half of the module that runs while Nuxt builds.
