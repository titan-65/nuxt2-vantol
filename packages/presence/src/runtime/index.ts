/**
 * Runtime barrel — currently only re-exports the server surface. Client-side
 * entry points (`usePresenceWall`, `PresenceWall.vue`, the plugin) remain
 * imported directly from their file paths; this index exists to give consumers
 * a stable `nuxt-presence/runtime` import root.
 */

export * from "./server";
