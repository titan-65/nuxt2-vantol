import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      vitest: "vite-plus/test",
    },
  },
  test: {
    include: ["test/**/*.test.ts"],
    server: {
      deps: {
        inline: ["@nuxt/test-utils"],
      },
    },
  },
});
