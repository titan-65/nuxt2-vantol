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

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@vantol/presence",
    configKey: "presence",
  },
  // One source of truth — a second copy here silently drifts from options.ts.
  defaults,
  setup(options, nuxt) {
    const resolved = resolveOptions(options);
    if (!resolved.enabled) return;

    const { resolve } = createResolver(import.meta.url);
    const publicConfig: Record<string, unknown> = {};
    nuxt.options.runtimeConfig.public.presence = publicConfig;

    if (resolved.wall.enabled) {
      publicConfig.combo = resolved.wall.combo;
      publicConfig.mobilePath = resolved.wall.mobilePath;
      publicConfig.renderStyle = resolved.wall.renderStyle;

      addPlugin({
        src: resolve("./runtime/plugins/presence.client"),
        mode: "client",
      });

      addComponent({
        name: "PresenceWall",
        filePath: resolve("./runtime/components/PresenceWall.vue"),
      });

      if (resolved.wall.server) {
        // Private config — the routes need the TTL/cap, the browser does not.
        nuxt.options.runtimeConfig.presence = {
          ttlSeconds: resolved.wall.ttlSeconds,
          maxSignatures: resolved.wall.maxSignatures,
        };

        for (const method of ["post", "get"] as const) {
          addServerHandler({
            route: "/api/_presence/wall",
            method,
            handler: resolve(`./server/api/wall.${method}`),
          });
        }
      }
    }

    if (!resolved.mark.enabled) return;

    // Signed once per build, so every page of a build carries the same mark.
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

    // Only the public half ships to the browser — it is all a visitor needs to verify.
    publicConfig.publicKey = keypair.publicKey;
    publicConfig.mark = token;

    addServerHandler({
      route: "/api/_presence/verify",
      method: "post",
      handler: resolve("./server/api/verify.post"),
    });

    // ponytail: app.head rather than a nitro render:html hook. It is typed, and it
    // bakes the mark into prerendered pages as well as SSR responses.
    nuxt.options.app.head.meta ??= [];
    nuxt.options.app.head.meta.push({ name: MARK_META_NAME, content: token });
  },
});
