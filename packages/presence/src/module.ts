import { addComponent, addPlugin, createResolver, defineNuxtModule } from "@nuxt/kit";
import { resolveOptions, type ModuleOptions } from "./options";

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@vantol/presence",
    configKey: "presence",
  },
  defaults: {
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
    },
  },
  setup(options, nuxt) {
    const resolved = resolveOptions(options);
    if (!resolved.enabled) return;
    if (!resolved.wall.enabled) return;

    const { resolve } = createResolver(import.meta.url);

    nuxt.options.runtimeConfig.public.presence = {
      combo: resolved.wall.combo,
      mobilePath: resolved.wall.mobilePath,
    };

    addPlugin({
      src: resolve("./runtime/plugins/presence.client"),
      mode: "client",
    });

    addComponent({
      name: "PresenceWall",
      filePath: resolve("./runtime/components/PresenceWall.vue"),
    });
  },
});
