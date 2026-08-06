export type AssistantPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";

export interface AssistantPersona {
  name: string;
  avatar: string;
  title: string;
  greeting: string;
}

export interface AssistantServerOptions {
  enabled: boolean;
  apiKey: string;
}

export interface ModuleOptions {
  enabled: boolean;
  autoMount: boolean;
  shortcut: string[];
  position: AssistantPosition;
  persona: AssistantPersona;
  suggestedQueries: string[];
  server: AssistantServerOptions;
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
  autoMount: true,
  shortcut: ["Cmd+K", "Ctrl+K", "Meta+K"],
  position: "bottom-right",
  persona: {
    name: "Nox",
    avatar: "/eve.png",
    title: "Portfolio & Developer Assistant",
    greeting:
      "Hi! I'm Nox, Vantol's assistant. Ask me about articles, projects, tutorials, or navigating the site!",
  },
  suggestedQueries: [
    "Who is Vantol Bennett?",
    "Show me Nuxt 4 and Vue tutorials",
    "What projects are in this portfolio?",
    "How do I sign the guestbook?",
  ],
  server: {
    enabled: true,
    apiKey: process.env.NUXT_ASSISTANT_API_KEY ?? "",
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

declare module "@nuxt/schema" {
  interface NuxtConfig {
    assistant?: DeepPartial<ModuleOptions>;
  }
  interface NuxtOptions {
    assistant?: DeepPartial<ModuleOptions>;
  }
}
