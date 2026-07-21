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

export type SignatureInput = Omit<StoredSignature, "id" | "createdAt" | "expiresAt">;

export interface WallStoreOptions {
  ttlSeconds: number;
  maxSignatures: number;
}

export interface WallStore {
  add: (input: SignatureInput) => StoredSignature;
  list: () => StoredSignature[];
  clear: () => void;
}

function makeId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function createWallStore(opts: WallStoreOptions): WallStore {
  // ponytail: plain array, not a Map — TTL is uniform so insertion order is
  // expiry order, and maxSignatures keeps it small enough that shift() is free.
  const items: StoredSignature[] = [];

  function evictExpired(): void {
    const now = Date.now();
    while (items.length > 0 && items[0]!.expiresAt <= now) {
      items.shift();
    }
  }

  function add(input: SignatureInput): StoredSignature {
    evictExpired();

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

  function clear(): void {
    items.length = 0;
  }

  return { add, list, clear };
}

// ponytail: one process-wide store, created on first request from runtime config.
// The wall is explicitly ephemeral, so a restart wiping it is intended behavior.
let shared: WallStore | undefined;

export function getWallStore(opts: WallStoreOptions): WallStore {
  shared ??= createWallStore(opts);
  return shared;
}
