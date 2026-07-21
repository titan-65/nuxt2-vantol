import { ref, type Ref } from "vue";
import type { WallTransport } from "../utils/wallSync";

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
  /** True once this visitor has left their mark, so the UI stops offering a caret. */
  hasSigned: Ref<boolean>;
  open: () => void;
  close: () => void;
  add: (input: {
    text: string;
    x: number;
    y: number;
    rotation?: number;
    color?: string;
  }) => Signature;
  /** Replaces the list wholesale — the server is the source of truth when it answers. */
  replace: (signatures: Signature[]) => void;
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
  const hasSigned = ref(false);

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
    hasSigned.value = true;

    // Fire-and-forget: the signature is already on screen, and a failed POST
    // must not lose it or block the UI.
    void transport?.push(sig).catch(() => {});

    return sig;
  }
  function replace(next: Signature[]) {
    signatures.value = next;
  }
  function clear() {
    signatures.value = [];
  }

  return { isOpen, signatures, hasSigned, open, close, add, replace, clear };
}

/**
 * Set once by the client plugin when `wall.server` is on.
 *
 * Same shape as setDefaultRenderStyle: the composable stays free of Nuxt and of
 * `fetch` wiring, so it is still unit-testable on its own.
 */
let transport: WallTransport | undefined;

export function configureWallTransport(next: WallTransport | undefined): void {
  transport = next;
}

let shared: WallHandle | undefined;

/**
 * The wall shared by the component, the plugin and the console API.
 *
 * It must be one instance: the combo listener and `$presence.sign()` live in
 * the plugin, while the rendering lives in the component. Handing each caller
 * its own wall means the combo opens something nobody draws.
 *
 * On the server every call gets a fresh wall, so nothing leaks between requests.
 */
export function usePresenceWall(): WallHandle {
  if (import.meta.server) return createWall();

  shared ??= createWall();
  return shared;
}

/** Test-only: drops the shared wall so cases cannot bleed into each other. */
export function resetPresenceWall(): void {
  shared = undefined;
  transport = undefined;
}
