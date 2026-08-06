import {
  defineNuxtModule,
  createResolver,
  addImports,
  addComponent,
  addServerHandler,
} from "@nuxt/kit";

export interface ModuleOptions {
  /**
   * Directory relative to project root containing agent definitions.
   * @default 'server/agents'
   */
  dir?: string;
  /**
   * Default LLM model provider/name.
   * @default 'mock'
   */
  defaultModel?: string;
  /**
   * Unstorage persistence driver type ('memory', 'fs', etc.)
   * @default 'memory'
   */
  storage?: string;
  /**
   * Learning Plot visualizer options
   */
  learningPlot?: {
    enabled?: boolean;
    route?: string;
  };
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@vvantol2000/nuxt-eve",
    configKey: "eve",
    compatibility: {
      nuxt: "^4.0.0",
    },
  },
  defaults: {
    dir: "server/agents",
    defaultModel: "mock",
    storage: "memory",
    learningPlot: {
      enabled: true,
      route: "/__eve_plot__",
    },
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    // Expose configuration to runtime
    nuxt.options.runtimeConfig.public.eve = {
      learningPlotEnabled: options.learningPlot?.enabled ?? true,
      learningPlotRoute: options.learningPlot?.route ?? "/__eve_plot__",
    };

    nuxt.options.runtimeConfig.eve = {
      dir: options.dir ?? "server/agents",
      defaultModel: options.defaultModel ?? "mock",
      storage: options.storage ?? "memory",
    };

    // Register runtime composables
    addImports([
      { name: "useEveAgent", from: resolver.resolve("./runtime/composables/useEveAgent") },
      { name: "useEveChat", from: resolver.resolve("./runtime/composables/useEveChat") },
    ]);

    // Register Vue components
    addComponent({
      name: "EveChatWindow",
      filePath: resolver.resolve("./runtime/components/EveChatWindow.vue"),
    });

    addComponent({
      name: "EveLearningPlot",
      filePath: resolver.resolve("./runtime/components/EveLearningPlot.vue"),
    });

    // Register Nitro API routes
    addServerHandler({
      route: "/api/_eve/:agent/chat",
      handler: resolver.resolve("./runtime/server/api/chat.post"),
    });

    addServerHandler({
      route: "/api/_eve/:agent/stream",
      handler: resolver.resolve("./runtime/server/api/stream.get"),
    });
  },
});
