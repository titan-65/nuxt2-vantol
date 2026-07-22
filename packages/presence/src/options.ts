import type { IdentityResolver, PresenceStorage } from "./runtime/server/storage";

/**
 * V0 `renderStyle` (cursive / block / monogram) is preserved for back-compat
 * with existing configs but is unused in V1 rendering — V1 renders cards, not
 * positional text. Hosts can drop it; the V1 component ignores it.
 */
export type RenderStyle = "cursive" | "block" | "monogram";

export interface PresenceMarkOptions {
  enabled: boolean;
  handle: string;
  keyDir: string;
  privateKey: string;
}

export interface PresenceWallPolicyFilter {
  extraHardBlocklist: string[];
  extraSoftBlocklist: string[];
  extraDenyRegex: Array<RegExp | string>;
}

export interface PresenceWallPolicyRateLimit {
  perIpHour: number;
  perUserTenMin: number;
}

export interface PresenceWallPolicy {
  filter: PresenceWallPolicyFilter;
  rateLimit: PresenceWallPolicyRateLimit;
}

export interface PresenceWallOptions {
  // V0 fields — preserved for back-compat.
  enabled: boolean;
  server: boolean;
  ttlSeconds: number;
  maxSignatures: number;
  combo: string[];
  mobilePath: string;
  autoMount: boolean;
  pollMs: number;
  renderStyle: RenderStyle;

  // V1 additions (per T5, T7, T14).
  /** Explicit siteKey override. Wins over `runtimeConfig.public.siteUrl`. */
  siteKey?: string;
  /** Dev fallback when neither override nor siteUrl is set. */
  siteKeyFallback?: string;
  /** Per-signature body max. Default 240. */
  bodyLimit: number;
  /** Max items in pinned state. Default 5. */
  pinCap: number;
  /** Filter + rate-limit policy. Hosts extend defaults via these. */
  policy: PresenceWallPolicy;
}

export interface PresenceStorageOptions {
  /** Override `useStorage(mountKey)`. Default `'presence'`. */
  mountKey?: string;
  /** Override any of the five top-level prefixes (`wall`, `report`, …). */
  prefixOverrides?: Record<string, string>;
  /** Host-supplied adapter that overrides the default Nitro unstorage driver. */
  instance?: () => PresenceStorage;
}

export interface PresenceIdentityOptions {
  /**
   * Identity resolver. Called server-side by `wall.post.ts` before storage.
   * Hosts implement this when they have their own auth (Convex, Clerk, …).
   * The optional `@nuxt-presence/github` companion installs a GitHub-OAuth
   * implementation behind this key.
   */
  resolve?: IdentityResolver;
}

export interface ModuleOptions {
  enabled: boolean;
  wall: PresenceWallOptions;
  mark: PresenceMarkOptions;
  storage?: PresenceStorageOptions;
  identity?: PresenceIdentityOptions;
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[]
    ? T[K]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function deepMerge<T extends object>(base: T, override: DeepPartial<T> | undefined): T {
  if (!override) return base;

  const baseRecord = base as unknown as Record<string, unknown>;
  const out: Record<string, unknown> = { ...baseRecord };
  const overrideRecord = override as Record<string, unknown>;

  for (const key of Object.keys(overrideRecord)) {
    const value = overrideRecord[key];
    const baseValue = baseRecord[key];
    if (isRecord(value) && isRecord(baseValue)) {
      out[key] = deepMerge(baseValue, value);
    } else if (value !== undefined) {
      // ponytail: skip undefined overrides — explicit "no value" should not erase defaults.
      out[key] = value;
    }
  }

  return out as unknown as T;
}

export function resolveOptions(input: DeepPartial<ModuleOptions> = {}): ModuleOptions {
  return deepMerge(defaults, input);
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
    autoMount: true,
    pollMs: 5000,
    renderStyle: "cursive",
    bodyLimit: 240,
    pinCap: 5,
    siteKey: undefined,
    siteKeyFallback: undefined,
    policy: {
      filter: {
        extraHardBlocklist: [],
        extraSoftBlocklist: [],
        extraDenyRegex: [],
      },
      rateLimit: {
        perIpHour: 5,
        perUserTenMin: 1,
      },
    },
  },
  mark: {
    enabled: true,
    handle: "",
    keyDir: ".presence/",
    privateKey: process.env.NUXT_PRESENCE_PRIVATE_KEY ?? "",
  },
};

// Gives consumers (and our own tests) a typed `presence:` key in nuxt.config.
declare module "@nuxt/schema" {
  interface NuxtConfig {
    presence?: DeepPartial<ModuleOptions>;
  }
  interface NuxtOptions {
    presence?: DeepPartial<ModuleOptions>;
  }
}
