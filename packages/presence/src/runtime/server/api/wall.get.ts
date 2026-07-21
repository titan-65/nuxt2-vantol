import { defineEventHandler } from "h3";
import { useRuntimeConfig } from "nitropack/runtime";
import { getWallStore, type WallStoreOptions } from "../utils/wallStore";

export default defineEventHandler((event) => {
  // Annotated because Nitro's runtime config is index-signature typed.
  const opts: WallStoreOptions = useRuntimeConfig(event).presence;

  return { signatures: getWallStore(opts).list() };
});
