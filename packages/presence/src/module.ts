import { defineNuxtModule } from "@nuxt/kit";
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
  setup(_options, _nuxt) {
    const resolved = resolveOptions(_options);
    if (!resolved.enabled) return;
  },
});
