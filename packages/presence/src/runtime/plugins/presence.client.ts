/**
 * V1 client plugin (per T13).
 *
 *   - Combo key sequence opens/closes the wall (e.g. ↑↑↓↓).
 *   - `console.$presence` exposes open/close/sign/verify on `window` for tooling.
 *   - The SSR boolean `presence.isAdmin` is mirrored to `window.__PRESENCE_ADMIN__`
 *     so the component renders the admin tab without re-fetching.
 *   - Transport is registered once via `configureWallTransport`.
 *   - Polling runs only while the wall is open.
 */

import { createApp, watch } from "vue";
import PresenceWall from "../components/PresenceWall.vue";
import {
  configureWallTransport,
  usePresenceWall,
  type WallHandle,
} from "../composables/usePresenceWall";
import { createHttpTransport, startPolling } from "../utils/wallSync";

export const MARK_META_SELECTOR = 'meta[name="presence-mark"]';

export async function verifyMarkInPage(): Promise<MarkVerification> {
  const token = document.querySelector(MARK_META_SELECTOR)?.getAttribute("content");
  if (!token) return { valid: false, reason: "no_mark" };

  try {
    const response = await fetch("/api/_presence/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    });
    return (await response.json()) as MarkVerification;
  } catch (error) {
    return {
      valid: false,
      reason: error instanceof Error ? error.message : "verify_failed",
    };
  }
}

export interface MarkVerification {
  valid: boolean;
  payload?: unknown;
  reason?: string;
}

interface PresenceConsole {
  open: () => void;
  close: () => void;
  sign: (text: string) => void;
  verify: () => Promise<MarkVerification>;
}

declare global {
  interface Window {
    $presence?: PresenceConsole;
    __PRESENCE_ADMIN__?: boolean;
  }
}

interface BufferedKey {
  key: string;
  code: string;
}

export interface PresencePluginOptions {
  combo: string[];
  isAdmin: boolean;
  pageKey?: string;
  pollMs: number;
  wall: Pick<WallHandle, "open" | "close" | "add">;
}

export function createPresencePlugin(opts: PresencePluginOptions): () => void {
  // ponytail: SSR hands the admin boolean here. Setting `window.__PRESENCE_ADMIN__`
  // once at startup keeps the component free of Nuxt-only imports.
  window.__PRESENCE_ADMIN__ = opts.isAdmin;

  let buffer: BufferedKey[] = [];
  let lastTs = 0;

  function onKeydown(e: KeyboardEvent) {
    const now = Date.now();
    if (now - lastTs > 1500) buffer = [];
    lastTs = now;
    buffer.push({ key: e.key, code: e.code });
    if (buffer.length > opts.combo.length) buffer = buffer.slice(-opts.combo.length);
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
      void opts.wall.add({ body: text, ...(opts.pageKey ? { pageKey: opts.pageKey } : {}) });
    },
    verify: verifyMarkInPage,
  };
  window.$presence = consoleApi;

  window.addEventListener("keydown", onKeydown);

  return () => {
    window.removeEventListener("keydown", onKeydown);
    delete window.$presence;
  };
}

export const WALL_ROOT_SELECTOR = "[data-presence-wall-root]";

export function mountWall(): () => void {
  if (document.querySelector(WALL_ROOT_SELECTOR)) return () => {};

  const host = document.createElement("div");
  host.setAttribute("data-presence-wall-root", "");
  document.body.appendChild(host);

  const app = createApp(PresenceWall);
  app.mount(host);

  return () => {
    app.unmount();
    host.remove();
  };
}

// ponytail: typed as the minimal subset of NuxtApp this plugin touches, rather
// than importing `nuxt/app` types (which transitively pull Nuxt's generated
// `#build/*` virtual modules).
export interface PresenceNuxtApp {
  $config: {
    public: {
      presence?: {
        enabled?: boolean;
        wall?: {
          combo?: string[];
          pageKey?: string;
          autoMount?: boolean;
          pollMs?: number;
          isAdmin?: boolean;
        };
      };
    };
  };
}

export function presencePlugin(nuxtApp: PresenceNuxtApp): void {
  const opts = nuxtApp.$config.public.presence;
  if (opts?.enabled === false) return;

  const wall = usePresenceWall();
  const wallOpts = opts?.wall ?? {};
  const combo = wallOpts.combo ?? ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown"];
  const isAdmin = wallOpts.isAdmin === true;
  const pageKey = typeof wallOpts.pageKey === "string" ? wallOpts.pageKey : undefined;
  const pollMs = wallOpts.pollMs ?? 5000;

  createPresencePlugin({ combo, isAdmin, pageKey, pollMs, wall });

  if (wallOpts.autoMount !== false) mountWall();

  const transport = createHttpTransport();
  configureWallTransport(transport);
  let stop: (() => void) | undefined;
  watch(wall.isOpen, (open) => {
    stop?.();
    stop = open
      ? startPolling(
          transport,
          { intervalMs: pollMs, onSignatures: wall.replace },
          // Admin sees pending entries too — the gate runs server-side.
          isAdmin ? { includePending: true } : undefined,
        )
      : undefined;
  });
}
