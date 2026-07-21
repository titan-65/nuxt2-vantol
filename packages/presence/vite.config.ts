import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    target: "node18",
    lib: {
      entry: ["src/module.ts"],
      formats: ["es"],
      fileName: () => "module.mjs",
    },
    rollupOptions: {
      external: ["nuxt", "@nuxt/kit", "@nuxt/schema"],
    },
  },
});
