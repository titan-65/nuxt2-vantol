import {
  addComponent,
  addPlugin,
  addServerHandler,
  createResolver,
  defineNuxtModule,
} from "@nuxt/kit";
import { resolve as resolvePath } from "node:path";
import { defaults, resolveOptions, type ModuleOptions } from "./options";
import { ensureKeypair } from "./hooks/keypair";
import { buildMarkToken, MARK_META_NAME } from "./hooks/mark";
import { isAdminEnvSet } from "./runtime/server/admin";

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-presence",
    configKey: "presence",
  },
  // One source of truth — a second copy here silently drifts from options.ts.
  defaults,
  async setup(options, nuxt) {
    const resolved = resolveOptions(options);
    if (!resolved.enabled) return;

    const { resolve } = createResolver(import.meta.url);

    // Public runtimeConfig (visible to client) — combo, mobilePath, isAdmin, etc.
    const publicPresence: Record<string, unknown> = {
      enabled: true,
      wall: {
        enabled: resolved.wall.enabled,
        combo: resolved.wall.combo,
        mobilePath: resolved.wall.mobilePath,
        autoMount: resolved.wall.autoMount,
        pollMs: resolved.wall.pollMs,
        // ponytail: SSR-only boolean. Per T11 — the token never reaches the
        // browser; only the resolved "is the admin tab allowed?" flag does.
        isAdmin: isAdminEnvSet(),
      },
    };

    // Private runtimeConfig (server-only) — siteKey, body limit, pin cap, policy.
    nuxt.options.runtimeConfig.public.presence = publicPresence;
    nuxt.options.runtimeConfig.presence = {
      wall: {
        enabled: resolved.wall.enabled,
        siteKey: resolved.wall.siteKey ?? null,
        siteKeyFallback: resolved.wall.siteKeyFallback ?? null,
        bodyLimit: resolved.wall.bodyLimit,
        pinCap: resolved.wall.pinCap,
        maxSignatures: resolved.wall.maxSignatures,
        policy: resolved.wall.policy,
      },
    };

    if (resolved.wall.enabled) {
      addPlugin({
        src: resolve("./runtime/plugins/presence.client.plugin"),
        mode: "client",
      });

      addComponent({
        name: "PresenceWall",
        filePath: resolve("./runtime/components/PresenceWall.vue"),
      });

      if (resolved.wall.server) {
        for (const method of ["post", "get"] as const) {
          addServerHandler({
            route: "/api/_presence/wall",
            method,
            handler: resolve(`./runtime/server/api/wall.${method}`),
          });
        }

        addServerHandler({
          route: "/api/_presence/wall/report",
          method: "post",
          handler: resolve("./runtime/server/api/wall.report.post"),
        });

        for (const action of ["pin", "unpin", "approve", "delete"] as const) {
          addServerHandler({
            route: `/api/_presence/admin/${action}`,
            method: "post",
            handler: resolve(`./runtime/server/api/admin.${action}.post`),
          });
        }
        addServerHandler({
          route: "/api/_presence/admin/list",
          method: "get",
          handler: resolve("./runtime/server/api/admin.list.get"),
        });
      }
    }

    if (!resolved.mark.enabled) return;

    const keypair = ensureKeypair({
      keyDir: resolvePath(nuxt.options.rootDir, resolved.mark.keyDir),
      privateKey: resolved.mark.privateKey,
    });
    const token = buildMarkToken({
      handle: resolved.mark.handle,
      siteUrl: String(nuxt.options.runtimeConfig.public.siteUrl ?? ""),
      rootDir: nuxt.options.rootDir,
      privateKey: keypair.privateKey,
    });

    // Mark ships to the client too — every page of a build carries the same mark.
    publicPresence.mark = token;

    addServerHandler({
      route: "/api/_presence/verify",
      method: "post",
      handler: resolve("./runtime/server/api/verify.post"),
    });

    // ponytail: app.head rather than a nitro render:html hook. It is typed, and
    // it bakes the mark into prerendered pages as well as SSR responses.
    nuxt.options.app.head.meta ??= [];
    nuxt.options.app.head.meta.push({ name: MARK_META_NAME, content: token });
  },
});
