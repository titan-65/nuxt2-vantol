/**
 * Build config for nuxt-module-builder.
 *
 * `failOnWarn: false` because the subpath exports (`./runtime`, `./runtime/server`,
 * `./runtime/server/storage`) need a per-directory `package.json` to mark them as
 * ESM-only — the builder warns about this. At runtime Node resolves them fine
 * via the top-level `package.json` `exports` field, so the warning is informational.
 */
export default {
  failOnWarn: false,
};
