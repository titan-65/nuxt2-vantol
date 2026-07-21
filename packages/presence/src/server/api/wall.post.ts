import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { useRuntimeConfig } from "nitropack/runtime";
import { getWallStore, type WallStoreOptions } from "../utils/wallStore";

const MAX_TEXT_LENGTH = 200;

export default defineEventHandler(async (event) => {
  // Annotated because Nitro's runtime config is index-signature typed.
  const { ttlSeconds, maxSignatures }: WallStoreOptions = useRuntimeConfig(event).presence;
  const store = getWallStore({ ttlSeconds, maxSignatures });

  const body = await readBody<{
    text?: unknown;
    x?: unknown;
    y?: unknown;
    rotation?: unknown;
    color?: unknown;
  }>(event);

  if (
    typeof body?.text !== "string" ||
    body.text.length === 0 ||
    body.text.length > MAX_TEXT_LENGTH ||
    typeof body.x !== "number" ||
    typeof body.y !== "number"
  ) {
    setResponseStatus(event, 400);
    return { error: "invalid_signature" };
  }

  if (store.list().length >= maxSignatures) {
    setResponseStatus(event, 429);
    return { error: "wall_full" };
  }

  const signature = store.add({
    text: body.text,
    x: body.x,
    y: body.y,
    rotation: typeof body.rotation === "number" ? body.rotation : 0,
    color: typeof body.color === "string" ? body.color : "#f5c542",
  });

  return { ok: true, signature };
});
