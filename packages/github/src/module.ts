/**
 * @nuxt-presence/github — companion module for nuxt-presence.
 *
 * Exposes the `/api/_presence/auth/github/{start,callback,signout}`
 * routes and a small `/api/_presence/social-pull` endpoint. The host app
 * owns identity resolution (per the T1 host-adapter contract) — see
 * `apps/web/server/plugins/presence-identity.ts`, which falls back to the
 * GitHub session cookie this module issues.
 */

import {
  addServerHandler,
  addTemplate,
  createResolver,
  defineNuxtModule,
} from "@nuxt/kit";

export interface ModuleOptions {
  /** Disable OAuth + just skip identity resolution. Wall stays anonymous. */
  enabled?: boolean;
  /** Enable `/user/followers` + `/user/following` for connection badges. */
  socialPull?: boolean;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@nuxt-presence/github",
    configKey: "presenceGithub",
    compatibilityDate: "2024-04-03",
  },
  defaults: {
    enabled: true,
    socialPull: false,
  },
  setup(options, nuxt) {
    if (options.enabled === false) return;

    const { resolve } = createResolver(import.meta.url);

    addServerHandler({
      route: "/api/_presence/auth/github/start",
      method: "get",
      handler: resolve("./runtime/server/api/auth.github.start"),
    });
    addServerHandler({
      route: "/api/_presence/auth/github/callback",
      method: "get",
      handler: resolve("./runtime/server/api/auth.github.callback"),
    });
    addServerHandler({
      route: "/api/_presence/auth/github/signout",
      method: "post",
      handler: resolve("./runtime/server/api/auth.github.signout"),
    });

    // Public runtimeConfig — the client component can read whether GitHub OAuth
    // is wired at all (used to expose a "Sign in" affordance). Identity
    // resolution is owned by the host app's Nitro plugin, which reads the
    // session cookie this module issues.
    const publicGithub: Record<string, unknown> = {
      enabled: options.enabled !== false,
      socialPull: options.socialPull === true,
    };
    nuxt.options.runtimeConfig.public = nuxt.options.runtimeConfig.public ?? {};
    nuxt.options.runtimeConfig.public.presenceGithub = publicGithub;
  },
});
