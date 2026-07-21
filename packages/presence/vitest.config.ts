import { defineConfig } from "vite-plus";

export default defineConfig({
  resolve: {
    alias: {
      vitest: "vite-plus/test",
    },
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    server: {
      deps: {
        inline: ["@nuxt/test-utils"],
      },
    },
  },
});
