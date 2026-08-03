// The learning platform, as a Nuxt layer.
//
// Everything under /learn — pages, content, the tutorial-progress composable,
// the MDC playground components and the learn RSS feed — is owned here. The host
// app (apps/web) picks it up with a single `extends` entry and stays an
// editorial blog.
//
// ponytail: no `components` override. Nuxt already scans every layer's
// app/components, and @nuxt/content already scans every layer's
// app/components/content for MDC. Adding a prefix here would only rename them.
export default defineNuxtConfig({
  $meta: {
    name: "learn-layer",
  },
});
