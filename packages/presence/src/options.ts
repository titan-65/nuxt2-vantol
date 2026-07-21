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
  /**
   * PEM private key, for a signing identity that survives deploys.
   *
   * Defaults to `NUXT_PRESENCE_PRIVATE_KEY`. Left empty, the module generates a
   * pair in `keyDir` — which on a host with no persistent disk means a fresh
   * identity every deploy. Never commit this value.
   */
  privateKey: string;
}

export interface ModuleOptions {
  enabled: boolean;
  wall: PresenceWallOptions;
  mark: PresenceMarkOptions;
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[]
    ? T[K]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

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
    privateKey: process.env.NUXT_PRESENCE_PRIVATE_KEY ?? "",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function deepMerge<T extends object>(base: T, override: DeepPartial<T> | undefined): T {
  if (!override) return base;

  const baseRecord = base as unknown as Record<string, unknown>;
  const out: Record<string, unknown> = { ...baseRecord };
  const overrideRecord = override as Record<string, unknown>;

  for (const key of Object.keys(override)) {
    const value = overrideRecord[key];
    const baseValue = baseRecord[key];

    if (isRecord(value) && isRecord(baseValue)) {
      out[key] = deepMerge(baseValue, value);
    } else {
      out[key] = value;
    }
  }

  return out as unknown as T;
}

export function resolveOptions(input: DeepPartial<ModuleOptions> = {}): ModuleOptions {
  return deepMerge(defaults, input);
}

// Gives consumers (and our own tests) a typed `presence:` key in nuxt.config.
declare module "@nuxt/schema" {
  interface NuxtConfig {
    presence?: DeepPartial<ModuleOptions>;
  }
  interface NuxtOptions {
    presence?: DeepPartial<ModuleOptions>;
  }
}
