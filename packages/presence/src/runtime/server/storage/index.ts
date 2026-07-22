/**
 * Public surface of the storage subsystem.
 *
 * Default driver is Nitro `useStorage()`. Hosts swap to a custom driver via
 * `presence.storage.instance` (module-options pass).
 *
 * Identity resolver (per T1) and admin gate (per T11) are exposed here as
 * setters so the host's Nitro plugin (or the optional `@nuxt-presence/github`
 * companion) can wire them up at startup.
 */

export * from "./presence-storage";
export { createNitroUnstorageStorage } from "./nitro-unstorage";

import { createNitroUnstorageStorage } from "./nitro-unstorage";
import type { PresenceStorage } from "./presence-storage";
import type { IdentityResolver } from "../identity";

let shared: PresenceStorage | undefined;

/** Lazy singleton — module-loadable from any server route. */
export function usePresenceStorage(): PresenceStorage {
  shared ??= createNitroUnstorageStorage();
  return shared;
}

// Re-export the identity-resolver setter/getter so the host's Nitro plugin and
// the optional `@nuxt-presence/github` companion can install a resolver from a
// single import path. `../identity` because identity.ts lives one dir up.
export {
  setPresenceIdentityResolver,
  getPresenceIdentityResolver,
  resolveIdentity,
  reporterKey,
} from "../identity";
export type { IdentityResolver } from "../identity";
