import { defineConfig } from 'vite-plus';

export default defineConfig({
  run: {
    tasks: {
      build: {
        command: 'vp run -r build',
        cache: true,
      },
    },
  },
});
