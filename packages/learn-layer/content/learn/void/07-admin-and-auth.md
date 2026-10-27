---
title: "Admin + Auth: Protect the Menu and Orders"
description: "Gate order operations and the weekly menu behind a server-verified admin session."
series: "void"
order: 7
feature: "Admin sessions + protected APIs"
sourceUrl: "https://void.cloud/guide/env-vars"
difficulty: "Advanced"
estMinutes: 30
img: "/jumble-stage-1.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1767533048/PXL_20251010_202726442_2_hhudfr.jpg"
  website: "https://vantolbennett.vercel.app"
---

Orders contain names, email addresses, and phone numbers. Menu edits change what every customer can buy. Neither belongs behind a public button.

Stage 7 adds a single-admin gate: a password from a Worker secret, an HttpOnly session cookie, KV-backed sessions, protected APIs, and a dashboard for orders and the weekly menu.

::JumblePreview{stage="7" height="760"}
::

The preview shows the unauthenticated door. The full app at `/admin` accepts the password you set in `ADMIN_PASSWORD`.

## What it is

- `env.ts` declares `ADMIN_PASSWORD` as a required server value.
- `POST /api/admin/login` compares the password and creates a KV session.
- `isAdmin(c)` reads the HttpOnly cookie and verifies the session in KV.
- `GET /admin` server-renders the login form or the dashboard.
- Protected APIs can list nothing until the session check passes.
- The dashboard updates order statuses and adds/removes flavors from the active week.

This is not customer authentication. It is one operator session for a small kitchen. Stage 8's images are uploaded through the same gate.

## The password

```ts [env.ts]
import { defineEnv, string } from "void/env";

export default defineEnv({
  ADMIN_PASSWORD: string(),
});
```

Local development reads the root `.env`; production needs a Worker secret:

```bash
void secret put ADMIN_PASSWORD
```

`void deploy` refuses to ship if the required server key is missing. The password never reaches the browser bundle.

## The session

The login route is the only place that accepts the password:

```ts [routes/api/admin/login.ts]
export const POST = defineHandler(async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Enter the admin password." }, 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success || parsed.data.password !== env.ADMIN_PASSWORD) {
    return c.json({ error: "That password is not right." }, 401);
  }

  const token = await createAdminSession();
  const secure = import.meta.env.PROD ? "; Secure" : "";
  const cookie = `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200${secure}`;

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "content-type": "application/json",
      "set-cookie": cookie,
    },
  });
});
```

The session is random, stored in KV with a 12-hour TTL, and delivered as an `HttpOnly`, `SameSite=Lax` cookie. `Secure` is added in production. The browser cannot read the session token.

```ts [src/server/admin.ts]
const sessions = kv.map<{ createdAt: string }>("admin-sessions");

export async function createAdminSession(): Promise<string> {
  const token = crypto.randomUUID();
  await sessions.put(token, { createdAt: new Date().toISOString() }, { ttl: 43200 });
  return token;
}

export async function isAdmin(c: Context): Promise<boolean> {
  const token = getCookie(c, ADMIN_COOKIE);
  if (!isCartToken(token)) return false;
  return Boolean(await sessions.get(token));
}
```

Logout deletes the KV session and expires the cookie. A stolen cookie is useless after logout or TTL.

## Protecting the page and APIs

The loader decides what HTML exists:

```ts [pages/admin.server.ts]
const authorized = await isAdmin(c);

if (!authorized) {
  return {
    stage: CURRENT_STAGE,
    authorized: false,
    orders: [],
    flavors: [],
    weekLabel: null,
  };
}

const [orders, menu] = await Promise.all([listOrders(), getAdminMenu()]);
return { stage: CURRENT_STAGE, authorized: true, orders, flavors: menu.flavors, weekLabel: menu.week?.label ?? null };
```

The API handlers repeat the check; a page gate is not an API gate:

```ts [routes/api/admin/menu.ts]
if (!(await isAdmin(c))) {
  return c.json({ error: "Admin session required." }, 401);
}
```

Order status updates use the same guard, validate the status against the shared enum, and append a timeline event:

```ts [routes/api/admin/orders/[publicId].ts]
const order = await updateOrderStatus(c.req.param("publicId"), parsed.data.status);
if (!order) return c.json({ error: "Order not found." }, 404);
```

## The dashboard

The authorized dashboard has two jobs:

1. Move an order through `pending → confirmed → preparing → ready → picked_up` (or cancel it).
2. Add or remove a flavor from the active week.

```vue [src/JumbleAdmin.vue]
<select :value="order.status" @change="onStatusChange(order, $event)">
  <option v-for="status in ORDER_STATUSES" :key="status" :value="status">
    {{ ORDER_STATUS_LABELS[status] }}
  </option>
</select>

<button @click="toggleFlavor(flavor)">
  {{ flavor.isActive ? "In the week" : "Add to week" }}
</button>
```

The order page polls the public status route; the admin is the only writer of the human status.

## Do it yourself

Create a local password in the root `.env`:

```ini
ADMIN_PASSWORD=choose-a-local-password
```

Then:

```bash
pnpm dev
```

Open `/admin`. Sign in, change an order status, remove a flavor, and check that the storefront reflects the menu change. The stage 7 preview stays at the login screen because the lesson iframe has no admin cookie.

Set the production secret and deploy:

```bash
void secret put ADMIN_PASSWORD
void deploy --platform cloudflare
```

## The live stage

`/preview/7` is intentionally the door. The full `/admin` is the protected screen. There is no public link to the dashboard; the URL is not the secret, the session is.

Stage 6 remains at `/preview/6` with the order timeline and no admin.

## Gotchas

- **Use a secret, not a source constant.** A password in `void.config.ts` or a client bundle is not auth.
- **Gate every admin API.** A server-rendered page gate does not protect a route someone can call directly.
- **Never return admin data to an unauthorized loader.** The login page receives empty arrays, not hidden HTML.
- **Keep the cookie HttpOnly and Secure in production.** `SameSite=Lax` is enough for the first-party dashboard; do not open a cross-site admin flow casually.
- **Rotate the password and expire sessions.** A single-admin app still deserves basic hygiene.
- **Rate-limit and monitor login attempts** before opening this to the public; this stage focuses on the session boundary.
- **This is not customer auth.** There is no account, no order ownership, and no customer dashboard.

## Recap

The kitchen has a locked door: secret-backed login, KV sessions, protected data, order status writes, and menu edits.

Next: **[Ship](/learn/void/08-ship)** — R2 photos, CI, and the final storefront.
