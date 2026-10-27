import { defineHandler } from "void";
import { storage } from "void/storage";

const IMAGE_KEY = /^[0-9a-f-]{36}\.(jpg|png|webp)$/i;

export const GET = defineHandler(async (c) => {
  const key = c.req.param("key");
  if (!IMAGE_KEY.test(key)) {
    return c.notFound();
  }

  const object = await storage.get(`flavors/${key}`);
  if (!object) {
    return c.notFound();
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Content-Disposition", "inline");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new Response(object.body, { headers });
});
