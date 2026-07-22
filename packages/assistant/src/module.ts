import {
  addComponent,
  addImports,
  addPlugin,
  addServerHandler,
  createResolver,
  defineNuxtModule,
} from "@nuxt/kit";
import { defaults, resolveOptions, type ModuleOptions } from "./options";

export type { ModuleOptions };

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-assistant",
    configKey: "assistant",
  },
  defaults,
  setup(options, nuxt) {
    const resolved = resolveOptions(options);
    if (!resolved.enabled) return;

    const { resolve } = createResolver(import.meta.url);

    // Public runtime configuration
    const publicConfig: Record<string, unknown> = {
      enabled: resolved.enabled,
      autoMount: resolved.autoMount,
      shortcut: resolved.shortcut,
      position: resolved.position,
      persona: resolved.persona,
      suggestedQueries: resolved.suggestedQueries,
    };
    nuxt.options.runtimeConfig.public.assistant = publicConfig;

    // Client plugin
    addPlugin({
      src: resolve("./runtime/plugins/assistant.client.plugin"),
      mode: "client",
    });

    // Auto-imported Component
    addComponent({
      name: "NuxtAssistant",
      filePath: resolve("./runtime/components/NuxtAssistant.vue"),
    });

    // Auto-imported Composable
    addImports({
      name: "useNuxtAssistant",
      as: "useNuxtAssistant",
      from: resolve("./runtime/composables/useNuxtAssistant"),
    });

    // Server API handlers
    if (resolved.server.enabled) {
      nuxt.options.runtimeConfig.assistant = {
        apiKey: resolved.server.apiKey,
      };

      addServerHandler({
        route: "/api/_assistant/chat",
        method: "post",
        handler: resolve("./runtime/server/api/chat.post"),
      });

      addServerHandler({
        route: "/api/_assistant/knowledge",
        method: "get",
        handler: resolve("./runtime/server/api/knowledge.get"),
      });

      addServerHandler({
        route: "/api/_assistant/search",
        method: "get",
        handler: resolve("./runtime/server/api/search.get"),
      });
    }
  },
});
