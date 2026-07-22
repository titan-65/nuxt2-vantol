/**
 * Server-runtime barrel. Hosts import from `nuxt-presence/runtime/server` to
 * reach the storage adapter + identity resolver + admin gate without pulling
 * Nitro-only routes into their bundle.
 */

export * from "./storage";
export { evaluateFilter } from "./filter";
export { checkRateLimit } from "./rate-limit";
export {
  requireAdmin,
  adminTokenSupplied,
  isAdminEnvSet,
  AdminRequiredError,
  ADMIN_TOKEN_HEADER,
} from "./admin";
export {
  resolveIdentity,
  setPresenceIdentityResolver,
  getPresenceIdentityResolver,
  reporterKey,
} from "./identity";
export { resolveScope, resolveSiteKey, validatePageKey, PageKeyError, adminTokenId } from "./scope";
