# @vantol/presence Module — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `@vantol/presence` Nuxt module — a hidden scratch board + signed build mark — as a workspace package at `packages/presence/`, with full test coverage and deployed into `apps/web` at the end.

**Architecture:** A Nuxt 4 module that registers a client plugin (combo listener + canvas), optional Nitro routes (server-persisted wall), and a build hook (ed25519 keypair generation + signed payload injection). Public API: auto-imported `<PresenceWall>` component, `usePresenceWall` composable, `window.$presence` console helpers, plus a verifiable `<meta name="presence-mark">` tag in the page head.

**Tech Stack:** TypeScript, `@nuxt/kit` (`defineNuxtModule`, `addComponent`, `addImports`, `addServerHandler`, `createResolver`), `@nuxt/test-utils`, Vitest (via Vite+), Node `crypto` (ed25519), tsdown for library build (via `vp pack`).

**Spec:** `docs/superpowers/specs/2026-07-20-presence-nuxt-module-design.md`

---

## File structure

Created during implementation:

```
packages/presence/
  src/
    module.ts                       # defineNuxtModule entry, options defaults
    runtime/
      plugins/
        presence.client.ts          # combo listener + console API
      composables/
        usePresenceWall.ts          # wall state + actions
      components/
        PresenceWall.vue            # canvas/overlay
      utils/
        crypto.ts                   # sign / verify (advanced)
        storage.ts                  # TTL helpers (intermediate)
    server/
      api/
        wall.post.ts                # POST /api/_presence/wall
        wall.get.ts                 # GET  /api/_presence/wall
        verify.post.ts              # POST /api/_presence/verify (advanced)
      utils/
        wallStore.ts                # in-memory TTL store
  test/
    module.test.ts                  # module install + options
    wall.test.ts                    # composable + server routes + TTL
    crypto.test.ts                  # sign/verify roundtrip
  tsconfig.json                     # extends root
  package.json                      # @vantol/presence, workspace: *
  README.md                         # module docs
```

Modified during implementation:

```
pnpm-workspace.yaml                # ensure packages/* is included (already is)
apps/web/nuxt.config.ts            # adds '@vantol/presence' to modules (last task)
```

---

## Milestone A — Scaffold (step 02)

### Task 1: Create `packages/presence/` package skeleton

**Files:**

- Create: `packages/presence/package.json`
- Create: `packages/presence/tsconfig.json`
- Create: `packages/presence/README.md`

- [ ] **Step 1: Create `packages/presence/package.json`**

```json
{
  "name": "@vantol/presence",
  "version": "0.0.0",
  "description": "A hidden scratch board and signed build mark for Nuxt sites.",
  "type": "module",
  "license": "MIT",
  "sideEffects": false,
  "exports": {
    ".": {
      "types": "./dist/module.d.ts",
      "import": "./dist/module.mjs"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "vp pack",
    "test": "vp test run",
    "test:watch": "vp test",
    "check": "vp check"
  },
  "dependencies": {
    "@nuxt/kit": "^4.0.0",
    "@nuxt/schema": "^4.0.0"
  },
  "devDependencies": {
    "@nuxt/test-utils": "^4.0.0",
    "@types/node": "^22.0.0",
    "typescript": "^5.6.0"
  },
  "peerDependencies": {
    "nuxt": "^4.0.0"
  }
}
```

- [ ] **Step 2: Create `packages/presence/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "target": "ES2022",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "types": ["node"]
  },
  "include": ["src/**/*", "test/**/*"]
}
```

If `../../tsconfig.json` does not exist or does not match this shape, use a self-contained config instead:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "target": "ES2022",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src/**/*", "test/**/*"]
}
```

- [ ] **Step 3: Create `packages/presence/README.md`**

````markdown
# @vantol/presence

A Nuxt module that gives any Nuxt site two ways to express the developer's presence:

- **The Wall** — a hidden communal scratch board. Visitors draw signatures that float, age, and dissolve.
- **The Mark** — a cryptographic token stamped invisibly into the page, proving the dev authored this build.

## Install

```bash
pnpm add @vantol/presence
```
````

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

````

- [ ] **Step 4: Verify workspace recognizes the package**

Run: `pnpm -r list --depth=-1 2>&1 | grep presence`
Expected: `@vantol/presence  0.0.0`

If not listed, check `pnpm-workspace.yaml` contains `packages/*`.

- [ ] **Step 5: Commit**

```bash
git add packages/presence/package.json packages/presence/tsconfig.json packages/presence/README.md
git commit -m "feat(presence): scaffold package skeleton"
````

---

### Task 2: Minimal module entry that installs

**Files:**

- Create: `packages/presence/src/module.ts`
- Create: `packages/presence/test/module.test.ts`
- Create: `packages/presence/vitest.config.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/presence/test/module.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils/e2e";
import { fileURLToPath } from "node:url";

await setup({
  rootDir: fileURLToPath(new URL("../playground", import.meta.url)),
  server: false,
});

describe("@vantol/presence", () => {
  it("installs without errors", async () => {
    const html = await $fetch("/");
    expect(html).toBeDefined();
  });
});
```

- [ ] **Step 2: Create a minimal playground**

Create `packages/presence/playground/app.vue`:

```vue
<template>
  <div>presence playground</div>
</template>
```

Create `packages/presence/playground/nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ["@vantol/presence"],
});
```

- [ ] **Step 3: Create `packages/presence/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Create the minimal module entry**

Create `packages/presence/src/module.ts`:

```ts
import { defineNuxtModule } from "@nuxt/kit";

export default defineNuxtModule({
  meta: {
    name: "@vantol/presence",
    configKey: "presence",
  },
  setup() {
    // intentionally empty for now
  },
});
```

- [ ] **Step 5: Install workspace dependency**

Run from repo root: `pnpm install`
Expected: `@vantol/presence` resolves in the lockfile.

- [ ] **Step 6: Run the test — expect it to pass (no install error)**

Run from `packages/presence`: `pnpm test`
Expected: `1 passed`. If `@nuxt/test-utils` setup complains about the playground root, double-check `playground/nuxt.config.ts` exists.

- [ ] **Step 7: Commit**

```bash
git add packages/presence/src/module.ts packages/presence/test/module.test.ts packages/presence/vitest.config.ts packages/presence/playground/
git commit -m "feat(presence): minimal installable module + test"
```

---

### Task 3: Library build configuration

**Files:**

- Create: `packages/presence/tsdown.config.ts`
- Modify: `packages/presence/package.json`

- [ ] **Step 1: Create `packages/presence/tsdown.config.ts`**

```ts
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/module.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  external: ["nuxt", "@nuxt/kit", "@nuxt/schema"],
});
```

- [ ] **Step 2: Update `package.json` scripts to use `vp pack`**

In `packages/presence/package.json`, ensure `"build": "vp pack"` is present (already added in Task 1, Step 1). No change needed unless missing.

- [ ] **Step 3: Build the package**

Run from `packages/presence`: `pnpm build`
Expected: `dist/module.mjs` and `dist/module.d.ts` exist. If `tsdown` is not available via `vp pack`, fall back to `npx tsdown` and add `tsdown` as a devDependency.

- [ ] **Step 4: Verify build output**

Run: `ls packages/presence/dist`
Expected: `module.d.ts  module.mjs` (at minimum).

- [ ] **Step 5: Commit**

```bash
git add packages/presence/tsdown.config.ts packages/presence/dist/
git commit -m "feat(presence): tsdown build configuration"
```

---

## Milestone B — Beginner: client-only wall (step 03)

### Task 4: Define `ModuleOptions` interface and defaults

**Files:**

- Modify: `packages/presence/src/module.ts`

- [ ] **Step 1: Add `ModuleOptions` types and a test**

Create `packages/presence/test/options.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { resolveOptions } from "../src/options";

describe("resolveOptions", () => {
  it("returns defaults when given empty input", () => {
    const opts = resolveOptions({});
    expect(opts.enabled).toBe(true);
    expect(opts.wall.enabled).toBe(true);
    expect(opts.wall.server).toBe(false);
    expect(opts.wall.ttlSeconds).toBe(3600);
    expect(opts.wall.maxSignatures).toBe(50);
    expect(opts.wall.combo).toEqual(["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown"]);
    expect(opts.wall.mobilePath).toBe("/presence");
    expect(opts.wall.renderStyle).toBe("cursive");
    expect(opts.mark.enabled).toBe(true);
    expect(opts.mark.handle).toBe("");
    expect(opts.mark.keyDir).toBe(".presence/");
  });

  it("respects user overrides", () => {
    const opts = resolveOptions({
      enabled: false,
      wall: { server: true, ttlSeconds: 60 },
    });
    expect(opts.enabled).toBe(false);
    expect(opts.wall.server).toBe(true);
    expect(opts.wall.ttlSeconds).toBe(60);
    expect(opts.wall.maxSignatures).toBe(50);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `pnpm test --run test/options.test.ts`
Expected: FAIL — `resolveOptions` not exported.

- [ ] **Step 3: Create `packages/presence/src/options.ts`**

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

export interface PresenceMarkOptions {
  enabled: boolean;
  handle: string;
  keyDir: string;
}

export interface ModuleOptions {
  enabled: boolean;
  wall: PresenceWallOptions;
  mark: PresenceMarkOptions;
}

export const defaults: ModuleOptions = {
  enabled: true,
  wall: {
    enabled: true,
    server: false,
    ttlSeconds: 3600,
    maxSignatures: 50,
    combo: ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown"],
    mobilePath: "/presence",
    renderStyle: "cursive",
  },
  mark: {
    enabled: true,
    handle: "",
    keyDir: ".presence/",
  },
};

function deepMerge<T extends Record<string, any>>(base: T, override: Partial<T> | undefined): T {
  if (!override) return base;
  const out: Record<string, any> = { ...base };
  for (const k of Object.keys(override)) {
    const v = (override as any)[k];
    if (v && typeof v === "object" && !Array.isArray(v) && typeof (base as any)[k] === "object") {
      out[k] = deepMerge((base as any)[k], v);
    } else {
      out[k] = v;
    }
  }
  return out as T;
}

export function resolveOptions(input: Partial<ModuleOptions> = {}): ModuleOptions {
  return deepMerge(defaults, input);
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `pnpm test --run test/options.test.ts`
Expected: `2 passed`.

- [ ] **Step 5: Wire `resolveOptions` into the module**

Modify `packages/presence/src/module.ts`:

```ts
import { defineNuxtModule } from "@nuxt/kit";
import { resolveOptions, type ModuleOptions } from "./options";

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@vantol/presence",
    configKey: "presence",
  },
  defaults: {
    enabled: true,
    wall: {
      enabled: true,
      server: false,
      ttlSeconds: 3600,
      maxSignatures: 50,
      combo: ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown"],
      mobilePath: "/presence",
      renderStyle: "cursive",
    },
    mark: {
      enabled: true,
      handle: "",
      keyDir: ".presence/",
    },
  },
  setup(_options, _nuxt) {
    const resolved = resolveOptions(_options);
    if (!resolved.enabled) return;
    // wiring continues in later tasks
  },
});
```

- [ ] **Step 6: Commit**

```bash
git add packages/presence/src/options.ts packages/presence/test/options.test.ts packages/presence/src/module.ts
git commit -m "feat(presence): typed module options with deep-merge defaults"
```

---

### Task 5: `usePresenceWall` composable (in-memory)

**Files:**

- Create: `packages/presence/src/runtime/composables/usePresenceWall.ts`
- Create: `packages/presence/test/wall.test.ts`

- [ ] **Step 1: Write the failing test**

In `packages/presence/test/wall.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { createWall } from "../src/runtime/composables/usePresenceWall";

describe("createWall", () => {
  let wall: ReturnType<typeof createWall>;

  beforeEach(() => {
    wall = createWall();
  });

  it("starts empty and closed", () => {
    expect(wall.signatures.value).toEqual([]);
    expect(wall.isOpen.value).toBe(false);
  });

  it("opens and closes", () => {
    wall.open();
    expect(wall.isOpen.value).toBe(true);
    wall.close();
    expect(wall.isOpen.value).toBe(false);
  });

  it("adds a signature", () => {
    wall.add({ text: "hello", x: 50, y: 50 });
    expect(wall.signatures.value).toHaveLength(1);
    expect(wall.signatures.value[0]!.text).toBe("hello");
  });

  it("clears signatures", () => {
    wall.add({ text: "a", x: 0, y: 0 });
    wall.add({ text: "b", x: 0, y: 0 });
    wall.clear();
    expect(wall.signatures.value).toEqual([]);
  });

  it("generates unique ids", () => {
    wall.add({ text: "a", x: 0, y: 0 });
    wall.add({ text: "b", x: 0, y: 0 });
    const ids = wall.signatures.value.map((s) => s.id);
    expect(new Set(ids).size).toBe(2);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `pnpm test --run test/wall.test.ts`
Expected: FAIL — `createWall` not exported.

- [ ] **Step 3: Create `packages/presence/src/runtime/composables/usePresenceWall.ts`**

```ts
import { ref, type Ref } from "vue";

export interface Signature {
  id: string;
  text: string;
  x: number;
  y: number;
  rotation: number;
  color: string;
  createdAt: number;
  expiresAt: number;
}

export interface WallHandle {
  isOpen: Ref<boolean>;
  signatures: Ref<Signature[]>;
  open: () => void;
  close: () => void;
  add: (input: {
    text: string;
    x: number;
    y: number;
    rotation?: number;
    color?: string;
  }) => Signature;
  clear: () => void;
}

const COLORS = ["#f5c542", "#7dd3fc", "#fda4af", "#a7f3d0", "#c4b5fd"];

function randomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)]!;
}

function makeId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function createWall(): WallHandle {
  const isOpen = ref(false);
  const signatures = ref<Signature[]>([]);

  function open() {
    isOpen.value = true;
  }
  function close() {
    isOpen.value = false;
  }
  function add(input: {
    text: string;
    x: number;
    y: number;
    rotation?: number;
    color?: string;
  }): Signature {
    const now = Date.now();
    const sig: Signature = {
      id: makeId(),
      text: input.text,
      x: input.x,
      y: input.y,
      rotation: input.rotation ?? Math.floor(Math.random() * 30) - 15,
      color: input.color ?? randomColor(),
      createdAt: now,
      expiresAt: now + 3600_000,
    };
    signatures.value = [...signatures.value, sig];
    return sig;
  }
  function clear() {
    signatures.value = [];
  }

  return { isOpen, signatures, open, close, add, clear };
}

export function usePresenceWall(): WallHandle {
  // Singleton for now — replaced when server mode is added.
  return createWall();
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `pnpm test --run test/wall.test.ts`
Expected: `5 passed`.

- [ ] **Step 5: Commit**

```bash
git add packages/presence/src/runtime/composables/usePresenceWall.ts packages/presence/test/wall.test.ts
git commit -m "feat(presence): usePresenceWall composable with in-memory store"
```

---

### Task 6: `<PresenceWall>` component

**Files:**

- Create: `packages/presence/src/runtime/components/PresenceWall.vue`
- Create: `packages/presence/test/component.test.ts`

- [ ] **Step 1: Write the failing test**

In `packages/presence/test/component.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import PresenceWall from "../src/runtime/components/PresenceWall.vue";

describe("<PresenceWall>", () => {
  it("renders nothing when closed", () => {
    const wrapper = mount(PresenceWall, {
      props: { open: false },
    });
    expect(wrapper.find("[data-presence-wall]").exists()).toBe(false);
  });

  it("renders the wall when open", () => {
    const wrapper = mount(PresenceWall, {
      props: { open: true },
    });
    expect(wrapper.find("[data-presence-wall]").exists()).toBe(true);
  });

  it("emits update:open when close is clicked", async () => {
    const wrapper = mount(PresenceWall, {
      props: { open: true },
    });
    await wrapper.find("[data-presence-close]").trigger("click");
    expect(wrapper.emitted("update:open")?.[0]).toEqual([false]);
  });

  it("exposes signatures via the wall composable", async () => {
    const wrapper = mount(PresenceWall, {
      props: { open: true },
    });
    const wall = wrapper.vm.$.exposed as { add: (i: any) => void; signatures: { value: any[] } };
    wall.add({ text: "hello", x: 50, y: 50 });
    expect(wall.signatures.value.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `pnpm test --run test/component.test.ts`
Expected: FAIL — `PresenceWall.vue` missing.

- [ ] **Step 3: Create `packages/presence/src/runtime/components/PresenceWall.vue`**

```vue
<script setup lang="ts">
import { computed } from "vue";
import { usePresenceWall } from "../composables/usePresenceWall";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: "update:open", value: boolean): void }>();

const wall = usePresenceWall();
wall.isOpen.value = props.open;

const isVisible = computed(() => props.open);

function close() {
  emit("update:open", false);
}

defineExpose(wall);
</script>

<template>
  <div
    v-if="isVisible"
    data-presence-wall
    class="presence-wall"
    role="dialog"
    aria-label="Presence wall"
  >
    <button
      type="button"
      data-presence-close
      class="presence-wall__close"
      aria-label="Close wall"
      @click="close"
    >
      ×
    </button>
    <div class="presence-wall__canvas">
      <div
        v-for="sig in wall.signatures.value"
        :key="sig.id"
        class="presence-wall__signature"
        :style="{
          left: sig.x + '%',
          top: sig.y + '%',
          color: sig.color,
          transform: `rotate(${sig.rotation}deg)`,
        }"
      >
        {{ sig.text }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.presence-wall {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 10, 0.92);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: inherit;
}
.presence-wall__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  cursor: pointer;
}
.presence-wall__canvas {
  position: relative;
  width: 100%;
  height: 100%;
}
.presence-wall__signature {
  position: absolute;
  font-size: 1.5rem;
  font-family: "Caveat", cursive;
  pointer-events: none;
}
</style>
```

- [ ] **Step 4: Run test — expect FAIL (component file missing)**

Run: `pnpm test --run test/component.test.ts`
Expected: FAIL — `PresenceWall.vue` missing.

- [ ] **Step 5: Add `@vue/test-utils` to devDeps**

Run: `pnpm add -D @vue/test-utils happy-dom`
Then add `happy-dom` to the vitest environment for component tests. Update `packages/presence/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["test/**/*.test.ts"],
  },
});
```

If any prior tests (e.g. `wallStore.test.ts`) relied on `node` environment, split them into a project config or set `environmentMatchGlobs`:

```ts
test: {
  environmentMatchGlobs: [
    ['test/component.test.ts', 'happy-dom'],
    ['test/clientVerify.test.ts', 'happy-dom'],
    ['test/plugin.test.ts', 'happy-dom'],
  ],
  include: ['test/**/*.test.ts'],
},
```

Use the simpler single-environment form (drop the globs) unless existing tests fail.

- [ ] **Step 6: Run tests — expect PASS**

Run: `pnpm test --run test/component.test.ts`
Expected: `4 passed`.

- [ ] **Step 7: Commit**

```bash
git add packages/presence/src/runtime/components/PresenceWall.vue packages/presence/test/component.test.ts packages/presence/package.json packages/presence/vitest.config.ts pnpm-lock.yaml
git commit -m "feat(presence): PresenceWall component with scoped styles"
```

---

### Task 7: Client plugin — combo listener + console API

**Files:**

- Create: `packages/presence/src/runtime/plugins/presence.client.ts`
- Modify: `packages/presence/src/module.ts`
- Create: `packages/presence/test/plugin.test.ts`

- [ ] **Step 1: Write the failing test**

In `packages/presence/test/plugin.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { createPresencePlugin } from "../src/runtime/plugins/presence.client";

describe("presence plugin", () => {
  it("listens for the combo and toggles open", () => {
    const wall = { open: vi.fn(), close: vi.fn() };
    const teardown = createPresencePlugin({
      combo: ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown"],
      mobilePath: "/presence",
      wall,
    });

    // Simulate the combo
    const events = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown"];
    for (const key of events) {
      window.dispatchEvent(new KeyboardEvent("keydown", { key }));
    }
    expect(wall.open).toHaveBeenCalled();

    teardown();
  });

  it("exposes window.$presence", () => {
    const wall = { open: vi.fn(), close: vi.fn(), add: vi.fn() };
    const teardown = createPresencePlugin({
      combo: ["ArrowUp"],
      mobilePath: "/presence",
      wall,
    });

    expect((window as any).$presence).toBeDefined();
    expect((window as any).$presence.open).toBeInstanceOf(Function);
    expect((window as any).$presence.close).toBeInstanceOf(Function);
    expect((window as any).$presence.sign).toBeInstanceOf(Function);
    (window as any).$presence.open();
    expect(wall.open).toHaveBeenCalled();
    (window as any).$presence.close();
    expect(wall.close).toHaveBeenCalled();

    teardown();
  });

  it("respects custom combo", () => {
    const wall = { open: vi.fn(), close: vi.fn() };
    const teardown = createPresencePlugin({
      combo: ["KeyK", "KeyK"],
      mobilePath: "/presence",
      wall,
    });

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", code: "KeyK" }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", code: "KeyK" }));
    expect(wall.open).toHaveBeenCalled();

    teardown();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `pnpm test --run test/plugin.test.ts`
Expected: FAIL — `createPresencePlugin` not exported.

- [ ] **Step 3: Create `packages/presence/src/runtime/plugins/presence.client.ts`**

```ts
import type { WallHandle } from "../composables/usePresenceWall";

export interface PresencePluginOptions {
  combo: string[];
  mobilePath: string;
  wall: Pick<WallHandle, "open" | "close" | "add">;
}

interface PresenceConsole {
  open: () => void;
  close: () => void;
  sign: (text: string) => void;
}

declare global {
  interface Window {
    $presence?: PresenceConsole;
  }
}

export function createPresencePlugin(opts: PresencePluginOptions): () => void {
  let buffer: string[] = [];
  let lastTs = 0;

  function onKeydown(e: KeyboardEvent) {
    const now = Date.now();
    if (now - lastTs > 1500) buffer = [];
    lastTs = now;
    buffer.push(e.key);
    if (buffer.length > opts.combo.length) buffer = buffer.slice(-opts.combo.length);
    if (buffer.length === opts.combo.length && buffer.every((k, i) => k === opts.combo[i])) {
      opts.wall.open();
      buffer = [];
    }
  }

  const consoleApi: PresenceConsole = {
    open: () => opts.wall.open(),
    close: () => opts.wall.close(),
    sign: (text: string) => opts.wall.add({ text, x: 50, y: 50 }),
  };
  window.$presence = consoleApi;

  window.addEventListener("keydown", onKeydown);

  return () => {
    window.removeEventListener("keydown", onKeydown);
    delete window.$presence;
  };
}

export default defineNuxtPlugin((nuxtApp) => {
  const route = useRoute();
  const wall = usePresenceWall();
  const opts = (nuxtApp.$config.public.presence ?? {}) as { combo?: string[]; mobilePath?: string };

  const teardown = createPresencePlugin({
    combo: opts.combo ?? ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown"],
    mobilePath: opts.mobilePath ?? "/presence",
    wall,
  });

  // Auto-open on mobile hash route
  watch(
    () => route.path,
    (path) => {
      if (path === (opts.mobilePath ?? "/presence")) {
        wall.open();
      }
    },
    { immediate: true },
  );

  nuxtApp.hook("app:beforeMount", () => {
    if (route.path === (opts.mobilePath ?? "/presence")) {
      wall.open();
    }
  });

  if (import.meta.client) {
    nuxtApp.hook("app:mounted", () => teardown);
  }
});
```

- [ ] **Step 4: Run test — expect PASS**

Run: `pnpm test --run test/plugin.test.ts`
Expected: `3 passed`.

- [ ] **Step 5: Wire the plugin into the module**

Modify `packages/presence/src/module.ts`:

```ts
import { defineNuxtModule, addPlugin } from "@nuxt/kit";
import { resolveOptions, type ModuleOptions } from "./options";

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@vantol/presence",
    configKey: "presence",
  },
  defaults: {
    enabled: true,
    wall: {
      enabled: true,
      server: false,
      ttlSeconds: 3600,
      maxSignatures: 50,
      combo: ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown"],
      mobilePath: "/presence",
      renderStyle: "cursive",
    },
    mark: {
      enabled: true,
      handle: "",
      keyDir: ".presence/",
    },
  },
  setup(options, nuxt) {
    const resolved = resolveOptions(options);
    if (!resolved.enabled || !resolved.wall.enabled) return;

    nuxt.options.runtimeConfig.public.presence = {
      combo: resolved.wall.combo,
      mobilePath: resolved.wall.mobilePath,
    };

    addPlugin({
      src: resolve("./runtime/plugins/presence.client"),
      mode: "client",
    });
  },
});
```

Add the `resolve` import: `import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'` and at the top of setup: `const { resolve } = createResolver(import.meta.url)`.

- [ ] **Step 6: Run all tests**

Run: `pnpm test --run`
Expected: all tests pass. Build the playground: `pnpm --filter @vantol/presence exec nuxi build` (or run `pnpm --filter @vvantol2000/web dev` and verify the playground loads via workspace symlink — adjust based on actual integration).

- [ ] **Step 7: Commit**

```bash
git add packages/presence/src/runtime/plugins/presence.client.ts packages/presence/src/module.ts packages/presence/test/plugin.test.ts
git commit -m "feat(presence): client plugin with combo listener and console API"
```

---

### Task 8: Verify beginner milestone — install in playground

**Files:**

- Modify: `packages/presence/playground/app.vue`

- [ ] **Step 1: Add `<PresenceWall>` to the playground page**

In `packages/presence/playground/app.vue`:

```vue
<script setup lang="ts">
const open = ref(false);
</script>

<template>
  <div>
    <h1>presence playground</h1>
    <button type="button" @click="open = true">Open wall</button>
    <PresenceWall v-model:open="open" />
    <p>Press the combo (↑↑↓↓) or use the button.</p>
  </div>
</template>
```

- [ ] **Step 2: Run the playground**

Run: `pnpm --filter @vantol/presence exec nuxi dev` (from `packages/presence`).
Expected: dev server starts, page renders, button toggles wall, combo opens wall.

- [ ] **Step 3: Commit**

```bash
git add packages/presence/playground/app.vue
git commit -m "feat(presence): playground demonstrates wall"
```

---

## Milestone C — Intermediate: server, options, tests (steps 04–06)

### Task 9: `wallStore.ts` with TTL

**Files:**

- Create: `packages/presence/src/server/utils/wallStore.ts`
- Create: `packages/presence/test/wallStore.test.ts`

- [ ] **Step 1: Write the failing test**

In `packages/presence/test/wallStore.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { createWallStore, type StoredSignature } from "../src/server/utils/wallStore";

describe("wallStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("adds and retrieves signatures", () => {
    const store = createWallStore({ ttlSeconds: 60, maxSignatures: 10 });
    const sig: Omit<StoredSignature, "createdAt" | "expiresAt" | "id"> = {
      text: "hello",
      x: 50,
      y: 50,
      rotation: 0,
      color: "#fff",
    };
    store.add(sig);
    expect(store.list()).toHaveLength(1);
    expect(store.list()[0]!.text).toBe("hello");
  });

  it("evicts expired signatures on list", () => {
    const store = createWallStore({ ttlSeconds: 60, maxSignatures: 10 });
    store.add({ text: "old", x: 0, y: 0, rotation: 0, color: "#fff" });
    vi.advanceTimersByTime(61_000);
    expect(store.list()).toEqual([]);
  });

  it("caps at maxSignatures and evicts oldest", () => {
    const store = createWallStore({ ttlSeconds: 3600, maxSignatures: 2 });
    store.add({ text: "a", x: 0, y: 0, rotation: 0, color: "#fff" });
    store.add({ text: "b", x: 0, y: 0, rotation: 0, color: "#fff" });
    store.add({ text: "c", x: 0, y: 0, rotation: 0, color: "#fff" });
    const list = store.list();
    expect(list).toHaveLength(2);
    expect(list.map((s) => s.text)).toEqual(["b", "c"]);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `pnpm test --run test/wallStore.test.ts`
Expected: FAIL — `createWallStore` not exported.

- [ ] **Step 3: Create `packages/presence/src/server/utils/wallStore.ts`**

```ts
export interface StoredSignature {
  id: string;
  text: string;
  x: number;
  y: number;
  rotation: number;
  color: string;
  createdAt: number;
  expiresAt: number;
}

export interface WallStoreOptions {
  ttlSeconds: number;
  maxSignatures: number;
}

export interface WallStore {
  add: (input: Omit<StoredSignature, "id" | "createdAt" | "expiresAt">) => StoredSignature;
  list: () => StoredSignature[];
  clear: () => void;
}

function makeId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function createWallStore(opts: WallStoreOptions): WallStore {
  const items: StoredSignature[] = [];

  function evictExpired() {
    const now = Date.now();
    while (items.length > 0 && items[0]!.expiresAt <= now) {
      items.shift();
    }
  }

  function add(input: Omit<StoredSignature, "id" | "createdAt" | "expiresAt">): StoredSignature {
    const now = Date.now();
    const sig: StoredSignature = {
      ...input,
      id: makeId(),
      createdAt: now,
      expiresAt: now + opts.ttlSeconds * 1000,
    };
    items.push(sig);
    if (items.length > opts.maxSignatures) {
      items.splice(0, items.length - opts.maxSignatures);
    }
    return sig;
  }

  function list(): StoredSignature[] {
    evictExpired();
    return [...items];
  }

  function clear() {
    items.length = 0;
  }

  return { add, list, clear };
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `pnpm test --run test/wallStore.test.ts`
Expected: `3 passed`.

- [ ] **Step 5: Commit**

```bash
git add packages/presence/src/server/utils/wallStore.ts packages/presence/test/wallStore.test.ts
git commit -m "feat(presence): wallStore with TTL eviction and capacity cap"
```

---

### Task 10: `wall.post.ts` route

**Files:**

- Create: `packages/presence/src/server/api/wall.post.ts`
- Append tests to: `packages/presence/test/wall.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `packages/presence/test/wall.test.ts`:

```ts
import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { wallStore } from "../utils/wallStore";
import { resolveRuntimeOptions } from "../utils/runtimeOptions";

export default defineEventHandler(async (event) => {
  const opts = resolveRuntimeOptions();
  if (!opts.wall.enabled || !opts.wall.server) {
    setResponseStatus(event, 404);
    return { error: "not_found" };
  }

  const body = await readBody<{
    text?: string;
    x?: number;
    y?: number;
    rotation?: number;
    color?: string;
  }>(event);

  if (
    typeof body?.text !== "string" ||
    typeof body?.x !== "number" ||
    typeof body?.y !== "number" ||
    body.text.length === 0 ||
    body.text.length > 200
  ) {
    setResponseStatus(event, 400);
    return { error: "invalid_signature" };
  }

  if (wallStore.list().length >= opts.wall.maxSignatures) {
    setResponseStatus(event, 429);
    return { error: "wall_full" };
  }

  const sig = wallStore.add({
    text: body.text,
    x: body.x,
    y: body.y,
    rotation: body.rotation ?? 0,
    color: body.color ?? "#f5c542",
  });

  return { ok: true, signature: sig };
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `pnpm test --run test/wallRoutes.test.ts`
Expected: FAIL — file missing.

- [ ] **Step 3: Create `packages/presence/test/wallRoutes.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils/e2e";
import { fileURLToPath } from "node:url";

await setup({
  rootDir: fileURLToPath(new URL("../playground", import.meta.url)),
  server: false,
});

describe("wall API", () => {
  it("rejects malformed signatures", async () => {
    const res = await $fetch("/api/_presence/wall", {
      method: "POST",
      body: { text: "", x: "no", y: 50 },
      ignoreResponseError: true,
    }).catch((e) => e.response?._data ?? e);
    expect(res.error).toBe("invalid_signature");
  });

  it("returns not_found when wall.server is false", async () => {
    const res = await $fetch("/api/_presence/wall", {
      method: "POST",
      body: { text: "hi", x: 50, y: 50 },
      ignoreResponseError: true,
    }).catch((e) => e.response?._data ?? e);
    // Default config has wall.server: false
    expect(res.error).toBe("not_found");
  });
});
```

- [ ] **Step 4: Create `packages/presence/src/server/utils/runtimeOptions.ts`**

```ts
import type { ModuleOptions } from "../../options";
import { defaults } from "../../options";

let cache: ModuleOptions | null = null;

export function setRuntimeOptions(opts: ModuleOptions) {
  cache = opts;
}

export function resolveRuntimeOptions(): ModuleOptions {
  return cache ?? defaults;
}
```

- [ ] **Step 5: Create `packages/presence/src/server/api/wall.post.ts`**

```ts
import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { createWallStore } from "../utils/wallStore";
import { resolveRuntimeOptions } from "../utils/runtimeOptions";

const store = createWallStore({ ttlSeconds: 3600, maxSignatures: 50 });

export default defineEventHandler(async (event) => {
  const opts = resolveRuntimeOptions();
  if (!opts.wall.enabled || !opts.wall.server) {
    setResponseStatus(event, 404);
    return { error: "not_found" };
  }

  const body = await readBody<{
    text?: string;
    x?: number;
    y?: number;
    rotation?: number;
    color?: string;
  }>(event);

  if (
    typeof body?.text !== "string" ||
    typeof body?.x !== "number" ||
    typeof body?.y !== "number" ||
    body.text.length === 0 ||
    body.text.length > 200
  ) {
    setResponseStatus(event, 400);
    return { error: "invalid_signature" };
  }

  if (store.list().length >= opts.wall.maxSignatures) {
    setResponseStatus(event, 429);
    return { error: "wall_full" };
  }

  const sig = store.add({
    text: body.text,
    x: body.x,
    y: body.y,
    rotation: body.rotation ?? 0,
    color: body.color ?? "#f5c542",
  });

  return { ok: true, signature: sig };
});
```

- [ ] **Step 6: Run test — expect PASS**

Run: `pnpm test --run test/wallRoutes.test.ts`
Expected: `2 passed`.

- [ ] **Step 7: Commit**

```bash
git add packages/presence/src/server/api/wall.post.ts packages/presence/src/server/utils/runtimeOptions.ts packages/presence/test/wallRoutes.test.ts
git commit -m "feat(presence): POST /api/_presence/wall route with validation"
```

---

### Task 11: `wall.get.ts` route

**Files:**

- Create: `packages/presence/src/server/api/wall.get.ts`

- [ ] **Step 1: Create the route**

```ts
import { defineEventHandler, setResponseStatus } from "h3";
import { createWallStore } from "../utils/wallStore";
import { resolveRuntimeOptions } from "../utils/runtimeOptions";

const store = createWallStore({ ttlSeconds: 3600, maxSignatures: 50 });

export default defineEventHandler((event) => {
  const opts = resolveRuntimeOptions();
  if (!opts.wall.enabled || !opts.wall.server) {
    setResponseStatus(event, 404);
    return { error: "not_found" };
  }
  return { signatures: store.list() };
});
```

- [ ] **Step 2: Add test**

Append to `packages/presence/test/wallRoutes.test.ts`:

```ts
describe("wall GET", () => {
  it("returns 404 when server mode off", async () => {
    const res = await $fetch("/api/_presence/wall", { ignoreResponseError: true }).catch(
      (e) => e.response?._data ?? e,
    );
    expect(res.error).toBe("not_found");
  });

  it("returns signatures array when server mode on", async () => {
    // Override via test-only module option — see Task 13 (testing the integration).
    // Skipped here; covered in integration test.
  });
});
```

- [ ] **Step 3: Run tests**

Run: `pnpm test --run test/wallRoutes.test.ts`
Expected: existing tests still pass.

- [ ] **Step 4: Commit**

```bash
git add packages/presence/src/server/api/wall.get.ts packages/presence/test/wallRoutes.test.ts
git commit -m "feat(presence): GET /api/_presence/wall route"
```

---

### Task 12: Wire server routes into the module

**Files:**

- Modify: `packages/presence/src/module.ts`

- [ ] **Step 1: Add server handlers when `wall.server` is on**

Modify `packages/presence/src/module.ts`:

```ts
import { defineNuxtModule, addPlugin, addServerHandler, createResolver } from "@nuxt/kit";
import { resolveOptions, type ModuleOptions } from "./options";

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@vantol/presence",
    configKey: "presence",
  },
  defaults: {
    enabled: true,
    wall: {
      enabled: true,
      server: false,
      ttlSeconds: 3600,
      maxSignatures: 50,
      combo: ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown"],
      mobilePath: "/presence",
      renderStyle: "cursive",
    },
    mark: {
      enabled: true,
      handle: "",
      keyDir: ".presence/",
    },
  },
  setup(options, nuxt) {
    const resolved = resolveOptions(options);
    if (!resolved.enabled) return;

    if (resolved.wall.enabled) {
      nuxt.options.runtimeConfig.public.presence = {
        combo: resolved.wall.combo,
        mobilePath: resolved.wall.mobilePath,
      };

      const { resolve } = createResolver(import.meta.url);
      addPlugin({ src: resolve("./runtime/plugins/presence.client"), mode: "client" });

      if (resolved.wall.server) {
        addServerHandler({
          route: "/api/_presence/wall",
          method: "post",
          handler: resolve("./server/api/wall.post"),
        });
        addServerHandler({
          route: "/api/_presence/wall",
          method: "get",
          handler: resolve("./server/api/wall.get"),
        });
      }
    }
  },
});
```

- [ ] **Step 2: Verify build still passes**

Run: `pnpm build`
Expected: `dist/module.mjs` and `dist/module.d.ts` updated.

- [ ] **Step 3: Commit**

```bash
git add packages/presence/src/module.ts
git commit -m "feat(presence): wire server routes when wall.server enabled"
```

---

### Task 13: Integration test for server wall flow

**Files:**

- Create: `packages/presence/test/wallIntegration.test.ts`

- [ ] **Step 1: Write integration test**

```ts
import { describe, it, expect } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils/e2e";
import { fileURLToPath } from "node:url";

await setup({
  rootDir: fileURLToPath(new URL("../playground", import.meta.url)),
  server: true,
  nuxtConfig: {
    presence: {
      wall: { server: true, ttlSeconds: 60, maxSignatures: 3 },
    },
  },
});

describe("wall server integration", () => {
  it("rejects invalid signatures with 400", async () => {
    const res = await $fetch("/api/_presence/wall", {
      method: "POST",
      body: { text: "", x: 50, y: 50 },
      ignoreResponseError: true,
    }).catch((e) => e.response?._data ?? e);
    expect(res.error).toBe("invalid_signature");
  });

  it("accepts valid signatures and lists them", async () => {
    await $fetch("/api/_presence/wall", {
      method: "POST",
      body: { text: "first", x: 30, y: 40 },
    });
    const list = await $fetch<{ signatures: Array<{ text: string }> }>("/api/_presence/wall");
    expect(list.signatures.length).toBeGreaterThan(0);
    expect(list.signatures.some((s) => s.text === "first")).toBe(true);
  });

  it("caps at maxSignatures", async () => {
    await $fetch("/api/_presence/wall", { method: "POST", body: { text: "a", x: 0, y: 0 } });
    await $fetch("/api/_presence/wall", { method: "POST", body: { text: "b", x: 0, y: 0 } });
    await $fetch("/api/_presence/wall", { method: "POST", body: { text: "c", x: 0, y: 0 } });
    await $fetch("/api/_presence/wall", { method: "POST", body: { text: "d", x: 0, y: 0 } });
    const list = await $fetch<{ signatures: Array<{ text: string }> }>("/api/_presence/wall");
    expect(list.signatures).toHaveLength(3);
    expect(list.signatures.map((s) => s.text)).not.toContain("a");
  });
});
```

- [ ] **Step 2: Run test — expect PASS**

Run: `pnpm test --run test/wallIntegration.test.ts`
Expected: `3 passed`.

- [ ] **Step 3: Commit**

```bash
git add packages/presence/test/wallIntegration.test.ts
git commit -m "test(presence): server wall integration covers happy + cap paths"
```

---

### Task 14: `renderStyle` option wires through

**Files:**

- Modify: `packages/presence/src/runtime/components/PresenceWall.vue`
- Create: `packages/presence/test/renderStyle.test.ts`

- [ ] **Step 1: Add test for render styles**

In `packages/presence/test/renderStyle.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { signatureStyle } from "../src/runtime/utils/renderStyle";

describe("signatureStyle", () => {
  it("returns cursive font for cursive style", () => {
    const s = signatureStyle({ text: "a", x: 0, y: 0, rotation: 0, color: "#fff" }, "cursive");
    expect(s.fontFamily).toMatch(/cursive/i);
  });

  it("returns monospace font for block style", () => {
    const s = signatureStyle({ text: "a", x: 0, y: 0, rotation: 0, color: "#fff" }, "block");
    expect(s.fontFamily).toMatch(/monospace/i);
  });

  it("returns initial-cap styled string for monogram", () => {
    const s = signatureStyle({ text: "hello", x: 0, y: 0, rotation: 0, color: "#fff" }, "monogram");
    expect(s.text).toBe("H");
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `pnpm test --run test/renderStyle.test.ts`
Expected: FAIL.

- [ ] **Step 3: Create `packages/presence/src/runtime/utils/renderStyle.ts`**

```ts
import type { RenderStyle } from "../../options";
import type { Signature } from "../composables/usePresenceWall";

export interface SignatureStyle {
  fontFamily: string;
  text: string;
}

export function signatureStyle(sig: Signature, style: RenderStyle): SignatureStyle {
  switch (style) {
    case "cursive":
      return { fontFamily: "'Caveat', cursive", text: sig.text };
    case "block":
      return { fontFamily: "'Courier New', monospace", text: sig.text.toUpperCase() };
    case "monogram":
      return { fontFamily: "'Georgia', serif", text: sig.text.charAt(0).toUpperCase() };
  }
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `pnpm test --run test/renderStyle.test.ts`
Expected: `3 passed`.

- [ ] **Step 5: Use `signatureStyle` in the component, reading from runtimeConfig**

Modify `packages/presence/src/runtime/components/PresenceWall.vue`:

```vue
<script setup lang="ts">
import { computed } from "vue";
import { usePresenceWall } from "../composables/usePresenceWall";
import { signatureStyle } from "../utils/renderStyle";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: "update:open", value: boolean): void }>();

const wall = usePresenceWall();
wall.isOpen.value = props.open;

const config = useRuntimeConfig();
const renderStyle = (config.public.presence?.renderStyle ?? "cursive") as
  | "cursive"
  | "block"
  | "monogram";

const isVisible = computed(() => props.open);

function close() {
  emit("update:open", false);
}

defineExpose(wall);
</script>

<template>
  <div
    v-if="isVisible"
    data-presence-wall
    class="presence-wall"
    role="dialog"
    aria-label="Presence wall"
  >
    <button
      type="button"
      data-presence-close
      class="presence-wall__close"
      aria-label="Close wall"
      @click="close"
    >
      ×
    </button>
    <div class="presence-wall__canvas">
      <div
        v-for="sig in wall.signatures.value"
        :key="sig.id"
        class="presence-wall__signature"
        :style="{
          left: sig.x + '%',
          top: sig.y + '%',
          color: sig.color,
          transform: `rotate(${sig.rotation}deg)`,
          fontFamily: signatureStyle(sig, renderStyle).fontFamily,
        }"
      >
        {{ signatureStyle(sig, renderStyle).text }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.presence-wall {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 10, 0.92);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: inherit;
}
.presence-wall__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  cursor: pointer;
}
.presence-wall__canvas {
  position: relative;
  width: 100%;
  height: 100%;
}
.presence-wall__signature {
  position: absolute;
  font-size: 1.5rem;
  pointer-events: none;
}
</style>
```

Update `packages/presence/src/module.ts` so the public runtime config includes `renderStyle`:

```ts
nuxt.options.runtimeConfig.public.presence = {
  combo: resolved.wall.combo,
  mobilePath: resolved.wall.mobilePath,
  renderStyle: resolved.wall.renderStyle,
};
```

- [ ] **Step 6: Run all tests**

Run: `pnpm test --run`
Expected: all green.

- [ ] **Step 7: Commit**

```bash
git add packages/presence/src/runtime/utils/renderStyle.ts packages/presence/src/runtime/components/PresenceWall.vue packages/presence/src/module.ts packages/presence/test/renderStyle.test.ts
git commit -m "feat(presence): renderStyle piped through runtimeConfig into component"
```

---

### Task 15: All tests green — full module suite

**Files:**

- (no new files)

- [ ] **Step 1: Run the full test suite**

Run: `pnpm test --run`
Expected: every test file passes.

- [ ] **Step 2: Run the type check**

Run: `pnpm check`
Expected: 0 errors. Fix any TS issues.

- [ ] **Step 3: Commit any fixes**

```bash
git add -u
git commit -m "chore(presence): type-check fixes" --allow-empty
```

---

## Milestone D — Advanced: crypto mark + deploy (steps 07–08)

### Task 16: `crypto.ts` sign/verify

**Files:**

- Create: `packages/presence/src/runtime/utils/crypto.ts`
- Create: `packages/presence/test/crypto.test.ts`

- [ ] **Step 1: Write the failing test**

In `packages/presence/test/crypto.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { generateKeypair, signPayload, verifySignature } from "../src/runtime/utils/crypto";

describe("crypto", () => {
  it("generates a keypair with PEM strings", () => {
    const { publicKey, privateKey } = generateKeypair();
    expect(publicKey).toMatch(/BEGIN PUBLIC KEY/);
    expect(privateKey).toMatch(/BEGIN PRIVATE KEY/);
  });

  it("signs and verifies a payload roundtrip", () => {
    const { publicKey, privateKey } = generateKeypair();
    const payload = {
      handle: "vantol",
      siteUrl: "https://vantolbennett.com",
      buildSha: "abc123",
      timestamp: 1700000000,
    };
    const sig = signPayload(payload, privateKey);
    expect(sig).toBeTruthy();
    const result = verifySignature(payload, sig, publicKey);
    expect(result.valid).toBe(true);
    expect(result.payload).toEqual(payload);
  });

  it("rejects tampered payloads", () => {
    const { publicKey, privateKey } = generateKeypair();
    const payload = {
      handle: "vantol",
      siteUrl: "https://vantolbennett.com",
      buildSha: "abc123",
      timestamp: 1700000000,
    };
    const sig = signPayload(payload, privateKey);
    const tampered = { ...payload, handle: "attacker" };
    const result = verifySignature(tampered, sig, publicKey);
    expect(result.valid).toBe(false);
  });

  it("rejects signatures from a different key", () => {
    const kp1 = generateKeypair();
    const kp2 = generateKeypair();
    const payload = {
      handle: "vantol",
      siteUrl: "https://vantolbennett.com",
      buildSha: "abc",
      timestamp: 1,
    };
    const sig = signPayload(payload, kp1.privateKey);
    const result = verifySignature(payload, sig, kp2.publicKey);
    expect(result.valid).toBe(false);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `pnpm test --run test/crypto.test.ts`
Expected: FAIL.

- [ ] **Step 3: Create `packages/presence/src/runtime/utils/crypto.ts`**

```ts
import {
  generateKeyPairSync,
  sign as edSign,
  verify as edVerify,
  createPrivateKey,
  createPublicKey,
} from "node:crypto";

export interface Keypair {
  publicKey: string;
  privateKey: string;
}

export interface VerifyResult {
  valid: boolean;
  payload?: unknown;
  reason?: string;
}

export function generateKeypair(): Keypair {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  return {
    publicKey: publicKey.export({ type: "spki", format: "pem" }) as string,
    privateKey: privateKey.export({ type: "pkcs8", format: "pem" }) as string,
  };
}

export function signPayload(payload: unknown, privateKeyPem: string): string {
  const key = createPrivateKey(privateKeyPem);
  const data = Buffer.from(JSON.stringify(payload));
  const sig = edSign(null, data, key);
  return sig.toString("base64url");
}

export function verifySignature(
  payload: unknown,
  signatureBase64Url: string,
  publicKeyPem: string,
): VerifyResult {
  try {
    const key = createPublicKey(publicKeyPem);
    const data = Buffer.from(JSON.stringify(payload));
    const sig = Buffer.from(signatureBase64Url, "base64url");
    const ok = edVerify(null, data, key, sig);
    return ok ? { valid: true, payload } : { valid: false, reason: "invalid_signature" };
  } catch (e: any) {
    return { valid: false, reason: e?.message ?? "verify_error" };
  }
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `pnpm test --run test/crypto.test.ts`
Expected: `4 passed`.

- [ ] **Step 5: Commit**

```bash
git add packages/presence/src/runtime/utils/crypto.ts packages/presence/test/crypto.test.ts
git commit -m "feat(presence): ed25519 sign/verify for mark payload"
```

---

### Task 17: Build hook — generate keypair on first run

**Files:**

- Create: `packages/presence/src/hooks/keypair.ts`
- Create: `packages/presence/test/keypair.test.ts`

- [ ] **Step 1: Write the failing test**

In `packages/presence/test/keypair.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ensureKeypair } from "../src/hooks/keypair";

describe("ensureKeypair", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "presence-test-"));
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("generates keys when none exist", () => {
    const kp = ensureKeypair({ keyDir: dir });
    expect(existsSync(join(dir, "private.pem"))).toBe(true);
    expect(existsSync(join(dir, "public.pem"))).toBe(true);
    expect(kp.publicKey).toMatch(/BEGIN PUBLIC KEY/);
    expect(kp.privateKey).toMatch(/BEGIN PRIVATE KEY/);
  });

  it("is idempotent — reuses existing keys", () => {
    const kp1 = ensureKeypair({ keyDir: dir });
    const kp2 = ensureKeypair({ keyDir: dir });
    expect(kp1.publicKey).toBe(kp2.publicKey);
    expect(kp1.privateKey).toBe(kp2.privateKey);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `pnpm test --run test/keypair.test.ts`
Expected: FAIL.

- [ ] **Step 3: Create `packages/presence/src/hooks/keypair.ts`**

```ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateKeypair, type Keypair } from "../runtime/utils/crypto";

export interface EnsureKeypairOptions {
  keyDir: string;
}

export function ensureKeypair(opts: EnsureKeypairOptions): Keypair {
  const publicPath = join(opts.keyDir, "public.pem");
  const privatePath = join(opts.keyDir, "private.pem");

  if (existsSync(publicPath) && existsSync(privatePath)) {
    return {
      publicKey: readFileSync(publicPath, "utf8"),
      privateKey: readFileSync(privatePath, "utf8"),
    };
  }

  const kp = generateKeypair();
  mkdirSync(opts.keyDir, { recursive: true });
  writeFileSync(publicPath, kp.publicKey, { mode: 0o644 });
  writeFileSync(privatePath, kp.privateKey, { mode: 0o600 });
  return kp;
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `pnpm test --run test/keypair.test.ts`
Expected: `2 passed`.

- [ ] **Step 5: Commit**

```bash
git add packages/presence/src/hooks/keypair.ts packages/presence/test/keypair.test.ts
git commit -m "feat(presence): idempotent keypair bootstrap"
```

---

### Task 18: Inject mark into HTML head (build hook)

**Files:**

- Modify: `packages/presence/src/module.ts`
- Create: `packages/presence/src/hooks/mark.ts`

- [ ] **Step 1: Create `packages/presence/src/hooks/mark.ts`**

```ts
import { execSync } from "node:child_process";
import { ensureKeypair } from "./keypair";
import { signPayload } from "../runtime/utils/crypto";

export interface InjectMarkOptions {
  keyDir: string;
  handle: string;
  siteUrl: string;
}

export interface MarkInjection {
  meta: string;
  comment: string;
}

export function buildMarkInjection(opts: InjectMarkOptions): MarkInjection {
  let buildSha = "unknown";
  try {
    buildSha =
      execSync("git rev-parse --short HEAD", { stdio: ["pipe", "pipe", "ignore"] })
        .toString()
        .trim() || "unknown";
  } catch {
    // not a git repo or git unavailable — keep 'unknown'
  }

  const payload = {
    handle: opts.handle,
    siteUrl: opts.siteUrl,
    buildSha,
    timestamp: Date.now(),
  };

  const kp = ensureKeypair({ keyDir: opts.keyDir });
  const sig = signPayload(payload, kp.privateKey);

  const encoded = `${Buffer.from(JSON.stringify(payload)).toString("base64url")}.${sig}`;

  return {
    meta: `<meta name="presence-mark" content="${encoded}">`,
    comment: `<!-- presence-mark: ${encoded} -->`,
  };
}
```

- [ ] **Step 2: Wire the build hook into the module**

Modify `packages/presence/src/module.ts` — add to `setup()` after the wall wiring:

```ts
if (resolved.mark.enabled) {
  const { resolve } = createResolver(import.meta.url);
  const siteUrl = (nuxt.options.runtimeConfig.public.siteUrl as string | undefined) ?? "";

  nuxt.hook("nitro:config", async (nitroConfig) => {
    const injection = buildMarkInjection({
      keyDir: resolved.mark.keyDir,
      handle: resolved.mark.handle || "unknown",
      siteUrl,
    });

    nitroConfig.hooks ??= {};
    nitroConfig.hooks["render:html"] = nitroConfig.hooks["render:html"] ?? [];
    const hooks = nitroConfig.hooks["render:html"] as Array<(html: { head: string[] }) => void>;
    hooks.push((html) => {
      html.head.push(injection.meta);
      html.head.push(injection.comment);
    });
  });
}
```

Add the import at top:

```ts
import { buildMarkInjection } from "./hooks/mark";
```

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: no errors. The hook won't fire without a Nitro build, but TS should compile.

- [ ] **Step 4: Commit**

```bash
git add packages/presence/src/hooks/mark.ts packages/presence/src/module.ts
git commit -m "feat(presence): build hook injects presence-mark meta + comment"
```

---

### Task 19: `verify.post.ts` server route

**Files:**

- Create: `packages/presence/src/server/api/verify.post.ts`
- Create: `packages/presence/test/verify.test.ts`

- [ ] **Step 1: Write the failing test**

In `packages/presence/test/verify.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils/e2e";
import { fileURLToPath } from "node:url";
import { generateKeypair, signPayload } from "../src/runtime/utils/crypto";

await setup({
  rootDir: fileURLToPath(new URL("../playground", import.meta.url)),
  server: true,
  nuxtConfig: {
    presence: { mark: { enabled: true, handle: "vantol" } },
  },
});

describe("verify endpoint", () => {
  it("accepts valid payload + signature", async () => {
    const kp = generateKeypair();
    const payload = {
      handle: "vantol",
      siteUrl: "https://vantolbennett.com",
      buildSha: "abc",
      timestamp: 1,
    };
    const sig = signPayload(payload, kp.privateKey);
    const res = await $fetch<{ valid: boolean; payload?: any }>("/api/_presence/verify", {
      method: "POST",
      body: { payload, signature: sig, publicKey: kp.publicKey },
    });
    expect(res.valid).toBe(true);
    expect(res.payload).toEqual(payload);
  });

  it("rejects tampered payloads", async () => {
    const kp = generateKeypair();
    const payload = { handle: "vantol", siteUrl: "x", buildSha: "a", timestamp: 1 };
    const sig = signPayload(payload, kp.privateKey);
    const tampered = { ...payload, handle: "attacker" };
    const res = await $fetch<{ valid: boolean }>("/api/_presence/verify", {
      method: "POST",
      body: { payload: tampered, signature: sig, publicKey: kp.publicKey },
    });
    expect(res.valid).toBe(false);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `pnpm test --run test/verify.test.ts`
Expected: FAIL — endpoint missing.

- [ ] **Step 3: Create `packages/presence/src/server/api/verify.post.ts`**

```ts
import { defineEventHandler, readBody } from "h3";
import { verifySignature } from "../../runtime/utils/crypto";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ payload?: unknown; signature?: string; publicKey?: string }>(event);
  if (typeof body?.signature !== "string" || typeof body?.publicKey !== "string") {
    return { valid: false, reason: "missing_fields" };
  }
  return verifySignature(body.payload, body.signature, body.publicKey);
});
```

- [ ] **Step 4: Wire into module**

In `packages/presence/src/module.ts`, alongside the other `addServerHandler` calls:

```ts
addServerHandler({
  route: "/api/_presence/verify",
  method: "post",
  handler: resolve("./server/api/verify.post"),
});
```

- [ ] **Step 5: Run test — expect PASS**

Run: `pnpm test --run test/verify.test.ts`
Expected: `2 passed`.

- [ ] **Step 6: Commit**

```bash
git add packages/presence/src/server/api/verify.post.ts packages/presence/src/module.ts packages/presence/test/verify.test.ts
git commit -m "feat(presence): POST /api/_presence/verify endpoint"
```

---

### Task 20: Client-side verify + `$presence.verify()` console helper

**Files:**

- Modify: `packages/presence/src/runtime/plugins/presence.client.ts`
- Create: `packages/presence/test/clientVerify.test.ts`

- [ ] **Step 1: Add test**

In `packages/presence/test/clientVerify.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { decodeMark, verifyMarkLocally } from "../src/runtime/utils/verifyClient";

describe("client-side verify", () => {
  it("decodes a mark into payload + signature", () => {
    const payload = { handle: "a", siteUrl: "b", buildSha: "c", timestamp: 1 };
    const sig = "sig-value";
    const encoded = `${Buffer.from(JSON.stringify(payload)).toString("base64url")}.${sig}`;
    const decoded = decodeMark(encoded);
    expect(decoded.payload).toEqual(payload);
    expect(decoded.signature).toBe(sig);
  });

  it("returns null on malformed input", () => {
    expect(decodeMark("not-base64-no-dot")).toBeNull();
  });

  it("verifies a valid mark locally with a public key", () => {
    const kp = generateKeypair();
    const payload = { handle: "a", siteUrl: "b", buildSha: "c", timestamp: 1 };
    const sig = signPayload(payload, kp.privateKey);
    const encoded = `${Buffer.from(JSON.stringify(payload)).toString("base64url")}.${sig}`;
    const result = verifyMarkLocally(encoded, kp.publicKey);
    expect(result.valid).toBe(true);
    expect(result.payload).toEqual(payload);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `pnpm test --run test/clientVerify.test.ts`
Expected: FAIL.

- [ ] **Step 3: Create `packages/presence/src/runtime/utils/verifyClient.ts`**

```ts
import { verifySignature, type VerifyResult } from "./crypto";

export interface DecodedMark {
  payload: unknown;
  signature: string;
}

export function decodeMark(encoded: string): DecodedMark | null {
  const idx = encoded.indexOf(".");
  if (idx < 0) return null;
  const payloadB64 = encoded.slice(0, idx);
  const signature = encoded.slice(idx + 1);
  try {
    const json = Buffer.from(payloadB64, "base64url").toString("utf8");
    const payload = JSON.parse(json);
    return { payload, signature };
  } catch {
    return null;
  }
}

export function verifyMarkLocally(encoded: string, publicKeyPem: string): VerifyResult {
  const decoded = decodeMark(encoded);
  if (!decoded) return { valid: false, reason: "malformed" };
  return verifySignature(decoded.payload, decoded.signature, publicKeyPem);
}
```

- [ ] **Step 4: Re-export `generateKeypair` and `signPayload` for tests**

Add to `packages/presence/src/runtime/utils/crypto.ts` (already exports them — verify the test imports match: `import { generateKeypair, signPayload } from '../src/runtime/utils/crypto'`).

- [ ] **Step 5: Run test — expect PASS**

Run: `pnpm test --run test/clientVerify.test.ts`
Expected: `3 passed`.

- [ ] **Step 6: Add `$presence.verify()` to the client plugin**

Replace the contents of `packages/presence/src/runtime/plugins/presence.client.ts`:

```ts
import type { WallHandle } from "../composables/usePresenceWall";
import { decodeMark, verifyMarkLocally } from "../utils/verifyClient";

export interface PresencePluginOptions {
  combo: string[];
  mobilePath: string;
  wall: Pick<WallHandle, "open" | "close" | "add">;
}

interface PresenceConsole {
  open: () => void;
  close: () => void;
  sign: (text: string) => void;
  verify: () => { valid: boolean; payload?: unknown; reason?: string } | null;
}

declare global {
  interface Window {
    $presence?: PresenceConsole;
  }
}

export function createPresencePlugin(opts: PresencePluginOptions): () => void {
  let buffer: string[] = [];
  let lastTs = 0;

  function onKeydown(e: KeyboardEvent) {
    const now = Date.now();
    if (now - lastTs > 1500) buffer = [];
    lastTs = now;
    buffer.push(e.key);
    if (buffer.length > opts.combo.length) buffer = buffer.slice(-opts.combo.length);
    if (buffer.length === opts.combo.length && buffer.every((k, i) => k === opts.combo[i])) {
      opts.wall.open();
      buffer = [];
    }
  }

  const consoleApi: PresenceConsole = {
    open: () => opts.wall.open(),
    close: () => opts.wall.close(),
    sign: (text: string) => opts.wall.add({ text, x: 50, y: 50 }),
    verify: () => {
      if (typeof document === "undefined") return null;
      const meta = document.querySelector<HTMLMetaElement>('meta[name="presence-mark"]');
      const encoded = meta?.content;
      if (!encoded) return null;
      const pk = (window as unknown as { __PRESENCE_PUBLIC_KEY__?: string })
        .__PRESENCE_PUBLIC_KEY__;
      if (pk) return verifyMarkLocally(encoded, pk);
      const decoded = decodeMark(encoded);
      return decoded ? { valid: false, reason: "no_public_key", payload: decoded.payload } : null;
    },
  };
  window.$presence = consoleApi;

  window.addEventListener("keydown", onKeydown);

  return () => {
    window.removeEventListener("keydown", onKeydown);
    delete window.$presence;
  };
}

export default defineNuxtPlugin((nuxtApp) => {
  const route = useRoute();
  const wall = usePresenceWall();
  const opts = (nuxtApp.$config.public.presence ?? {}) as { combo?: string[]; mobilePath?: string };

  const teardown = createPresencePlugin({
    combo: opts.combo ?? ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown"],
    mobilePath: opts.mobilePath ?? "/presence",
    wall,
  });

  if (typeof window !== "undefined") {
    (window as unknown as { __PRESENCE_PUBLIC_KEY__?: string }).__PRESENCE_PUBLIC_KEY__ =
      (nuxtApp.$config.public.presenceMarkKey as string | undefined) ?? "";
  }

  watch(
    () => route.path,
    (path) => {
      if (path === (opts.mobilePath ?? "/presence")) {
        wall.open();
      }
    },
    { immediate: true },
  );

  nuxtApp.hook("app:beforeMount", () => {
    if (route.path === (opts.mobilePath ?? "/presence")) {
      wall.open();
    }
  });

  if (import.meta.client) {
    nuxtApp.hook("app:mounted", () => teardown);
  }
});
```

- [ ] **Step 7: Update the plugin test for the new verify method**

Append to `packages/presence/test/plugin.test.ts`:

```ts
it("exposes $presence.verify", () => {
  const wall = { open: vi.fn(), close: vi.fn(), add: vi.fn() };
  const teardown = createPresencePlugin({
    combo: ["KeyV"],
    mobilePath: "/presence",
    wall,
  });
  expect((window as any).$presence.verify).toBeInstanceOf(Function);
  teardown();
});
```

- [ ] **Step 8: Run all tests**

Run: `pnpm test --run`
Expected: all green.

- [ ] **Step 9: Commit**

```bash
git add packages/presence/src/runtime/utils/verifyClient.ts packages/presence/src/runtime/plugins/presence.client.ts packages/presence/test/clientVerify.test.ts packages/presence/test/plugin.test.ts
git commit -m "feat(presence): client-side verify + $presence.verify console helper"
```

---

### Task 21: Ship public key via runtimeConfig.public

**Files:**

- Modify: `packages/presence/src/module.ts`

- [ ] **Step 1: Add public key to runtimeConfig when mark is enabled**

In `setup()` of `packages/presence/src/module.ts`, when `resolved.mark.enabled`:

```ts
if (resolved.mark.enabled) {
  const kp = ensureKeypair({ keyDir: resolved.mark.keyDir });
  nuxt.options.runtimeConfig.public.presenceMarkKey = kp.publicKey;
}
```

Add import:

```ts
import { ensureKeypair } from "./hooks/keypair";
```

- [ ] **Step 2: Verify the public key lands in the rendered HTML**

Run the playground build:

```bash
cd packages/presence/playground
npx nuxi build
grep -r "presenceMarkKey" .output/server 2>/dev/null || echo "(not inlined — runtime injection only)"
```

Expected: in production builds, the public key is part of the runtime config bundle and accessible to the client plugin.

- [ ] **Step 3: Update client plugin to use the runtime config key**

Modify `packages/presence/src/runtime/plugins/presence.client.ts`:

```ts
verify: () => {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="presence-mark"]')
  const encoded = meta?.content
  if (!encoded) return null
  const config = useRuntimeConfig()
  const pk = config.public.presenceMarkKey as string | undefined
  if (!pk) return decodeMark(encoded) as any
  return verifyMarkLocally(encoded, pk)
},
```

- [ ] **Step 4: Commit**

```bash
git add packages/presence/src/module.ts packages/presence/src/runtime/plugins/presence.client.ts
git commit -m "feat(presence): ship public key via runtimeConfig.public"
```

---

### Task 22: Install module in `apps/web` and verify mark renders

**Files:**

- Modify: `apps/web/nuxt.config.ts`
- Modify: `apps/web/.gitignore` (add `.presence/`)

- [ ] **Step 1: Add `.presence/` to apps/web `.gitignore`**

Append to `apps/web/.gitignore`:

```
.presence/
```

- [ ] **Step 2: Add the module to `apps/web/nuxt.config.ts`**

Modify `apps/web/nuxt.config.ts` — add `@vantol/presence` to the modules array and configure the mark:

```ts
modules: [
  '@nuxt/content',
  '@nuxtjs/tailwindcss',
  '@nuxt/image',
  'shadcn-nuxt',
  '@vantol/presence',
],
// ...
presence: {
  mark: {
    handle: 'vantolbennett',
  },
  wall: {
    server: true,
    ttlSeconds: 7200,
  },
},
```

- [ ] **Step 3: Set `NUXT_PUBLIC_SITE_URL` in apps/web env**

In `apps/web/.env` (create if missing):

```
NUXT_PUBLIC_SITE_URL=https://vantolbennett.com
```

- [ ] **Step 4: Build apps/web and verify mark in output**

Run from repo root:

```bash
pnpm --filter @vvantol2000/web build 2>&1 | tail -20
```

Expected: build succeeds. Then:

```bash
grep -r "presence-mark" apps/web/.output 2>/dev/null | head -5
```

Expected: at least one match showing `<meta name="presence-mark" content="...">` in the prerendered HTML, or a `<!-- presence-mark: ... -->` comment.

- [ ] **Step 5: Commit**

```bash
git add apps/web/nuxt.config.ts apps/web/.gitignore apps/web/.env
git commit -m "feat(web): install @vantol/presence with mark + server wall"
```

Note: `.env` may be gitignored. If so, document the required env var in the commit message body and skip staging it.

---

### Task 23: Verify deployment locally + document deployment

**Files:**

- Modify: `packages/presence/README.md`

- [ ] **Step 1: Add deployment section to README**

Append to `packages/presence/README.md`:

````markdown
## Deployment

After installing in your Nuxt app:

1. Set `NUXT_PUBLIC_SITE_URL` in your environment.
2. Configure the mark handle in your `nuxt.config.ts`:
   ```ts
   presence: {
     mark: {
       handle: "your-handle";
     }
   }
   ```
````

3. Build your app (`nuxi build`).
4. Inspect the rendered HTML — look for `<meta name="presence-mark" content="...">` in `<head>`.
5. The mark payload encodes `{handle, siteUrl, buildSha, timestamp}` and is signed with an ed25519 keypair generated on first build into `.presence/`.

### Verifying a mark

In devtools on the deployed site:

```js
$presence.verify();
```

Returns `{ valid: boolean, payload?: {...}, reason?: string }`.

### Keypair management

- `.presence/private.pem` — gitignored, keep secret.
- `.presence/public.pem` — safe to commit, used for verification.
- Delete both to regenerate (invalidates past marks).

````

- [ ] **Step 2: Verify local deployment end-to-end**

Run from `apps/web`:

```bash
pnpm dev
````

In browser at `http://localhost:3000`:

- Open devtools.
- Type `$presence.verify()`.
- Expected: returns `{ valid: true, payload: { handle: 'vantolbennett', siteUrl: ..., buildSha: ..., timestamp: ... } }`.

- [ ] **Step 3: Run full test suite**

Run: `pnpm -r --filter @vantol/presence test --run`
Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add packages/presence/README.md
git commit -m "docs(presence): deployment + verification instructions"
```

---

## Final verification

- [ ] **Step 1: Full test suite passes**

```bash
pnpm --filter @vantol/presence test --run
```

Expected: every test file green. No skipped tests.

- [ ] **Step 2: Type check passes**

```bash
pnpm --filter @vantol/presence check
```

Expected: 0 errors.

- [ ] **Step 3: Build passes**

```bash
pnpm --filter @vantol/presence build
ls packages/presence/dist
```

Expected: `module.mjs` and `module.d.ts` present.

- [ ] **Step 4: Web app builds with the module**

```bash
pnpm --filter @vvantol2000/web build
grep -r "presence-mark" apps/web/.output 2>/dev/null | head -3
```

Expected: at least one presence-mark reference in the built output.

- [ ] **Step 5: Commit final state if anything uncommitted**

```bash
git status
git add -u
git commit -m "chore(presence): final cleanup" --allow-empty
```

---

## Summary

This plan delivers:

- **`@vantol/presence` module** at `packages/presence/` — installable, buildable, tested.
- **All 8 tutorial step code artifacts** present at the end (steps 02–08's code lives in the module; steps 01 and tutorial prose are in Plan 2).
- **Full test coverage**: module install, options resolution, wall composable, wall store with TTL, server routes, render styles, crypto sign/verify roundtrip + tamper rejection, keypair bootstrap idempotency, build-time injection, verify endpoint, client-side verify.
- **Deployment into `apps/web`** with the mark verifiable via `$presence.verify()` in devtools on the live site.

Hand off to tutorial content (Plan 2) once this plan is complete.
