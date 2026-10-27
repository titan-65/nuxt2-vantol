import { defineHandler } from "void";
import { db, eq } from "void/db";
import { storage } from "void/storage";
import { flavors } from "@schema";
import { isAdmin } from "../../../src/server/admin";

const MAX_BYTES = 2 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const POST = defineHandler(async (c) => {
  if (!(await isAdmin(c))) {
    return c.json({ error: "Admin session required." }, 401);
  }

  let form: Record<string, string | File>;

  try {
    form = await c.req.parseBody();
  } catch {
    return c.json({ error: "Invalid image upload." }, 400);
  }

  const file = form.file;
  const flavorId = Number(form.flavorId);

  if (!(file instanceof File) || !Number.isInteger(flavorId) || flavorId < 1) {
    return c.json({ error: "Choose a flavor and an image." }, 400);
  }

  const extension = EXTENSIONS[file.type];
  if (!extension || file.size === 0 || file.size > MAX_BYTES) {
    return c.json({ error: "Use a JPEG, PNG, or WebP image under 2 MB." }, 400);
  }

  const key = `${crypto.randomUUID()}.${extension}`;

  await storage.put(`flavors/${key}`, file, {
    httpMetadata: {
      contentType: file.type,
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  const updated = await db
    .update(flavors)
    .set({ imageKey: key })
    .where(eq(flavors.id, flavorId))
    .returning({ id: flavors.id });

  if (!updated.length) {
    await storage.delete(`flavors/${key}`);
    return c.json({ error: "Flavor not found." }, 404);
  }

  return { imageKey: key };
});


export const DELETE = defineHandler(async (c) => {
  if (!(await isAdmin(c))) {
    return c.json({ error: "Admin session required." }, 401);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid image request." }, 400);
  }

  if (!body || typeof body !== "object" || !("flavorId" in body) || typeof body.flavorId !== "number") {
    return c.json({ error: "Invalid image request." }, 400);
  }

  const [flavor] = await db
    .select({ imageKey: flavors.imageKey })
    .from(flavors)
    .where(eq(flavors.id, body.flavorId))
    .limit(1);

  if (!flavor) {
    return c.json({ error: "Flavor not found." }, 404);
  }

  await db.update(flavors).set({ imageKey: null }).where(eq(flavors.id, body.flavorId));

  if (flavor.imageKey) {
    await storage.delete(`flavors/${flavor.imageKey}`);
  }

  return c.json({ ok: true });
});
