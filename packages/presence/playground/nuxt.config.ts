export default defineNuxtConfig({
  alias: {
    "nuxt-presence": "../src/module",
  },
  modules: ["nuxt-presence"],
  presence: {
    // app.vue places <PresenceWall> by hand to exercise that path; without this
    // the module would mount a second one on top of it.
    wall: { autoMount: false },
  },
});
