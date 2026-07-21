import { defineNuxtPlugin } from "nuxt/app";
import { presencePlugin, type PresenceNuxtApp } from "./presence.client";

/**
 * The file Nuxt actually loads via `addPlugin`.
 *
 * `presencePlugin` stays in its own file, unwrapped, so `test/plugin.test.ts`
 * can import it directly under plain vitest. "nuxt/app" (not the virtual "#app"
 * alias) is a real package export, so it resolves under plain tsc too — only
 * this wrapper needs `nuxt` as a dependency, not the whole runtime.
 */
export default defineNuxtPlugin((nuxtApp) => {
  presencePlugin(nuxtApp as unknown as PresenceNuxtApp);
});
