import { watch, type Ref } from "vue";
import { usePresenceWall, type WallHandle } from "../composables/usePresenceWall";
import { setDefaultRenderStyle } from "../utils/renderStyle";
import type { RenderStyle } from "../../options";

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

interface BufferedKey {
  key: string;
  code: string;
}

export function createPresencePlugin(opts: PresencePluginOptions): () => void {
  let buffer: BufferedKey[] = [];
  let lastTs = 0;

  function onKeydown(e: KeyboardEvent) {
    const now = Date.now();
    if (now - lastTs > 1500) buffer = [];
    lastTs = now;
    buffer.push({ key: e.key, code: e.code });
    if (buffer.length > opts.combo.length) buffer = buffer.slice(-opts.combo.length);
    // Match against either the logical key ("ArrowUp") or the physical code
    // ("KeyK"), since callers may configure a combo using either style.
    if (
      buffer.length === opts.combo.length &&
      buffer.every((k, i) => k.key === opts.combo[i] || k.code === opts.combo[i])
    ) {
      opts.wall.open();
      buffer = [];
    }
  }

  const consoleApi: PresenceConsole = {
    open: () => opts.wall.open(),
    close: () => opts.wall.close(),
    sign: (text: string) => {
      opts.wall.add({ text, x: 50, y: 50 });
    },
  };
  window.$presence = consoleApi;

  window.addEventListener("keydown", onKeydown);

  return () => {
    window.removeEventListener("keydown", onKeydown);
    delete window.$presence;
  };
}

// ponytail: typed as the minimal subset of NuxtApp this plugin touches, rather than
// pulling in `nuxt/app` types. `nuxt/app` transitively imports Nuxt's generated
// `#build/*` virtual modules at runtime, which only exist inside an actual Nuxt
// build — importing it here would break plain-vitest unit tests of this same file
// (see test/plugin.test.ts, which imports createPresencePlugin directly).
interface PresenceNuxtApp {
  $config: {
    public: { presence?: { combo?: string[]; mobilePath?: string; renderStyle?: RenderStyle } };
  };
  $router?: { currentRoute: Ref<{ path: string }> };
}

// Plain function export — Nuxt's plugin loader accepts this exactly like a
// defineNuxtPlugin(fn) result (defineNuxtPlugin just returns `fn` unchanged when
// given a function), so wrapping it adds nothing here.
export default function presencePlugin(nuxtApp: PresenceNuxtApp): void {
  const wall = usePresenceWall();
  const opts = nuxtApp.$config.public.presence ?? {};
  const combo = opts.combo ?? ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown"];
  const mobilePath = opts.mobilePath ?? "/presence";
  if (opts.renderStyle) setDefaultRenderStyle(opts.renderStyle);

  createPresencePlugin({ combo, mobilePath, wall });

  // Auto-open on mobile hash route
  const currentRoute = nuxtApp.$router?.currentRoute;
  if (currentRoute) {
    watch(
      () => currentRoute.value.path,
      (path) => {
        if (path === mobilePath) {
          wall.open();
        }
      },
      { immediate: true },
    );
  }
}
