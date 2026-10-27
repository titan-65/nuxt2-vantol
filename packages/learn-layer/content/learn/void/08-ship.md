---
title: "Ship: R2 Images, CI, and the Final Storefront"
description: "Finish Jumble with R2 photos, a CI workflow, the full deploy, and a final walkthrough."
series: "void"
order: 8
feature: "R2 + CI + production"
sourceUrl: "https://void.cloud/guide/storage"
difficulty: "Advanced"
estMinutes: 30
img: "/jumble-stage-1.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1767533048/PXL_20251010_202726442_2_hhudfr.jpg"
  website: "https://vantolbennett.vercel.app"
---

The storefront is complete when a photo can change without a deploy, CI can prove the build, and every route works from the same production Worker.

Stage 8 adds R2-backed flavor photos, the upload path in the admin, a CI workflow, and the final walkthrough.

::JumblePreview{stage="8" height="760"}
::

The preview is the final storefront. The full app has `/`, `/cookies/:slug`, `/checkout`, `/orders/:publicId`, and `/admin`.

## What it is

- `flavors.image_key` stores an optional R2 object key.
- `POST /api/admin/images` accepts a JPEG/PNG/WebP through the admin session and writes it to R2.
- `GET /api/images/:key` serves the image with a long cache and `nosniff`.
- The storefront uses the photo when present and the original generated cookie art otherwise.
- A GitHub Actions workflow installs, builds, and verifies the app.
- `void deploy` provisions D1, KV, the queue, the cron, and the R2 bucket.

## The upload

The admin sends a real multipart file. The Worker picks the object key; the browser never chooses a path.

```ts [routes/api/admin/images.ts]
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

await db.update(flavors).set({ imageKey: key }).where(eq(flavors.id, flavorId));
return { imageKey: key };
```

The key is a UUID plus a known extension. Uploads are restricted to raster images, capped at 2 MB, and gated by the same admin session as the dashboard.

## Serving the photo

```ts [routes/api/images/[key].ts]
const IMAGE_KEY = /^[0-9a-f-]{36}\.(jpg|png|webp)$/i;

export const GET = defineHandler(async (c) => {
  const key = c.req.param("key");
  if (!IMAGE_KEY.test(key)) return c.notFound();

  const object = await storage.get(`flavors/${key}`);
  if (!object) return c.notFound();

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Content-Disposition", "inline");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
});
```

The route only serves keys under `flavors/` that match the UUID shape. R2 never becomes a general file server.

The storefront falls back to `CookieArt` when a flavor has no image:

```vue [src/JumbleMenu.vue]
<img
  v-if="flavor.imageKey"
  class="menu-cookie-image"
  :src="`/api/images/${flavor.imageKey}`"
  :alt="`${flavor.name} cookie`"
/>
<CookieArt
  v-else
  :color="flavor.color"
  :accent="flavor.accent"
  :label="`${flavor.name} cookie`"
/>
```

## CI

The workflow is deliberately small: install, then build the app. The build runs the same route/resource inference as a deploy.

```yaml [.github/workflows/jumble-ci.yml]
name: Jumble CI
on:
  push:
    paths: ["apps/jumble/**", "pnpm-lock.yaml", ".github/workflows/jumble-ci.yml"]
  pull_request:
    paths: ["apps/jumble/**", "pnpm-lock.yaml", ".github/workflows/jumble-ci.yml"]
jobs:
  build:
    runs-on: ubuntu-latest
    env:
      ADMIN_PASSWORD: ci-build-only-password
    steps:
      - uses: actions/checkout@v4
      - uses: voidzero-dev/setup-vp@v1
        with:
          cache: true
      - run: vp install
      - run: pnpm --filter jumble build
```

Add `void db generate`/migration checks when the schema changes. The deploy itself is a release step, not a pull-request step.

## The final deploy

Generate and apply the last migration, set the admin secret, and ship:

```bash
void db generate
void secret put ADMIN_PASSWORD
void deploy --platform cloudflare
```

Void creates or updates:

- D1 `DB` with migrations.
- KV `KV` for carts and admin sessions.
- Queue `order-confirmation`.
- Cron `0 6 * * 1`.
- R2 `STORAGE` for flavor photos.
- Worker routes and assets.

The deployed app is `https://jumble.educreon.workers.dev`.

## The final walkthrough

1. Open `/` — the weekly menu, generated art, and the cart trigger.
2. Open a cookie, choose a 6-pack, and add it.
3. Raise the quantity, open checkout, and choose a pickup slot.
4. Place the order and land on a public order code.
5. The queue confirms it; the timeline appends the confirmation.
6. Sign in at `/admin`, move the order to Preparing, then Ready.
7. Toggle a flavor out of the week; the storefront updates.
8. Upload a flavor photo; the menu uses it without a redeploy.
9. Open `/preview/3` and `/preview/4` to confirm the older stages still stop at their boundaries.

## Gotchas

- **R2 is not a CMS.** Validate content type and size, choose the key, and keep the admin gate.
- **Use `nosniff` and a safe disposition.** Uploaded files are untrusted input.
- **Cache immutable keys.** A new upload gets a new UUID; replacing a photo changes the key.
- **Secrets are deploy prerequisites.** `void deploy` fails without `ADMIN_PASSWORD`; keep it out of Git.
- **Migrations are release artifacts.** Generate, review, and commit them before deploying.
- **Do not leak admin data into the login render.** The unauthorized loader returns empty data.
- **The stage routes are the proof.** Stage 4 has a cart without checkout; stage 5 has checkout without queue; stage 6 has status without admin; stage 7 has admin without photos.

## Recap

All eight stages are in production: a branded storefront, a weekly D1 menu, KV carts, D1 checkout, queue-backed confirmations, polling order status, protected admin operations, and R2 photos.

The final app is `/`. The source is `apps/jumble`. The lessons are the changelog.
