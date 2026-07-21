import { defineEventHandler } from "h3";
import { useRuntimeConfig } from "#imports";
import { getWallStore } from "../utils/wallStore";

export default defineEventHandler((event) => {
  const { ttlSeconds, maxSignatures } = useRuntimeConfig(event).presence;

  return { signatures: getWallStore({ ttlSeconds, maxSignatures }).list() };
});
