/**
 * V1 client shape (per T13).
 *
 *   - A signature is `{ id, author, body, createdAt, state }` — no x/y/rotation/color
 *     from V0. The wall renders cards, not positional marks.
 *   - Transport is set once by the client plugin via `configureWallTransport`.
 *   - `wall.signatures` is the source of truth that the component renders.
 */

import { ref, type Ref } from "vue";
import type { PresenceSignature } from "../server/storage";

export interface WallPushInput {
  body: string;
  pageKey?: string;
  renderHint?: "default" | "compact" | "signature";
}

export interface WallPullInput {
  pageKey?: string;
  includePending?: boolean;
  adminToken?: string;
}

export interface AdminInput {
  action: "pin" | "unpin" | "approve" | "delete";
  id: string;
  pinRank?: number;
  pageKey?: string;
  adminToken: string;
}

export interface WallTransport {
  push: (input: WallPushInput) => Promise<PresenceSignature>;
  pull: (
    input?: WallPullInput,
  ) => Promise<{ signatures: PresenceSignature[]; nextCursor?: string }>;
  admin: (input: AdminInput) => Promise<unknown>;
}

export interface WallHandle {
  isOpen: Ref<boolean>;
  signatures: Ref<PresenceSignature[]>;
  /** UI-side flag — server still dedups via the resolved identity. */
  hasSigned: Ref<boolean>;
  open: () => void;
  close: () => void;
  add: (input: WallPushInput) => Promise<PresenceSignature>;
  replace: (signatures: PresenceSignature[]) => void;
  clear: () => void;
}

let transport: WallTransport | undefined;

/** Set once by the client plugin. The composable stays Nuxt-free for unit tests. */
export function configureWallTransport(next: WallTransport | undefined): void {
  transport = next;
}

function createWall(): WallHandle {
  const isOpen = ref(false);
  const signatures = ref<PresenceSignature[]>([]);
  const hasSigned = ref(false);

  function open() {
    isOpen.value = true;
  }
  function close() {
    isOpen.value = false;
  }
  async function add(input: WallPushInput): Promise<PresenceSignature> {
    if (!transport) throw new Error("presence: no transport configured");
    const sig = await transport.push(input);
    signatures.value = [sig, ...signatures.value];
    hasSigned.value = true;
    return sig;
  }
  function replace(next: PresenceSignature[]) {
    signatures.value = next;
  }
  function clear() {
    signatures.value = [];
  }

  return { isOpen, signatures, hasSigned, open, close, add, replace, clear };
}

let shared: WallHandle | undefined;

/** On the server every call gets a fresh wall — nothing leaks between requests. */
export function usePresenceWall(): WallHandle {
  if (import.meta.server) return createWall();
  shared ??= createWall();
  return shared;
}

/** Test-only. */
export function resetPresenceWall(): void {
  shared = undefined;
  transport = undefined;
}
