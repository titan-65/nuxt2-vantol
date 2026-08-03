---
title: "The Signed Mark"
description: "Generate an ed25519 keypair on first build, sign a payload describing the build, stamp it into every page's head, and add a verify endpoint that can't be tricked into validating a forgery."
series: "nuxt-modules-capstone"
order: 1
feature: "ed25519, build-time signing, verify endpoint"
sourceUrl: "https://nodejs.org/api/crypto.html#cryptosignalgorithm-data-key-callback"
difficulty: "Advanced"
estMinutes: 15
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

At build time the module signs `{ handle, siteUrl, buildSha, timestamp }` with an ed25519 private key and stamps the result into every page's `<head>`. Anyone can read it and check it.

## Why you'd care

This is the build-time half of the boundary doing real work: filesystem, `node:crypto`, git, none of which can exist in the browser. It's also a compact lesson in getting a small crypto surface right, where two of the obvious approaches are quietly wrong.

## Before

Pages carry no evidence of who built them.

## After

```html
<meta name="presence-mark" content="eyJoYW5kbGUiOiJ2YW50b2xiZW5uZXR0Iiw..." />
```

And in devtools, `await $presence.verify()` answers `{ valid: true, payload: {…} }`.

## Do it yourself

### 1. Sign the bytes, not the object

```ts
export function signMark(payload: MarkPayload, privateKeyPem: string): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = edSign(null, Buffer.from(encoded), createPrivateKey(privateKeyPem));

  return `${encoded}.${signature.toString("base64url")}`;
}
```

::BlogAlert{type="warning"}
The tempting design is `sign(payload)` / `verify(payload, sig)`, both doing their own `JSON.stringify`. That works until something re-serialises with different key ordering — then a perfectly valid mark fails to verify, intermittently, for reasons that look like a crypto bug. Sign the **encoded string**, ship the encoded string, verify against those exact bytes. The token carries its own canonical form.
::

Verification returns a reason rather than throwing, because it runs on the request path:

```ts
export function verifyMark(token: string, publicKeyPem: string): VerifyResult {
  if (!publicKeyPem) return { valid: false, reason: "no_public_key" };

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return { valid: false, reason: "malformed_token" };

  try {
    const ok = edVerify(
      null,
      Buffer.from(encoded),
      createPublicKey(publicKeyPem),
      Buffer.from(signature, "base64url"),
    );
    if (!ok) return { valid: false, reason: "invalid_signature" };

    return { valid: true, payload: JSON.parse(Buffer.from(encoded, "base64url").toString()) };
  } catch (error) {
    return { valid: false, reason: error instanceof Error ? error.message : "verify_error" };
  }
}
```

### 2. Keys on first build

```ts
export function ensureKeypair(opts: EnsureKeypairOptions): Keypair {
  const publicPath = join(opts.keyDir, "public.pem");
  const privatePath = join(opts.keyDir, "private.pem");

  if (existsSync(publicPath) && existsSync(privatePath)) {
    return {
      publicKey: readFileSync(publicPath, "utf8"),
      privateKey: readFileSync(privatePath, "utf8"),
    };
  }

  const keypair = generateKeypair();
  mkdirSync(opts.keyDir, { recursive: true });
  writeFileSync(publicPath, keypair.publicKey, { mode: 0o644 });
  writeFileSync(privatePath, keypair.privateKey, { mode: 0o600 });

  return keypair;
}
```

**Both** halves must be present to reuse. If only `public.pem` survived — say someone committed it and gitignored its partner — reusing it would mean a public key with nothing to sign against.

### 3. Stamp it into the head

```ts
const keypair = ensureKeypair({ keyDir: resolvePath(nuxt.options.rootDir, resolved.mark.keyDir) });
const token = buildMarkToken({
  handle: resolved.mark.handle,
  siteUrl: String(nuxt.options.runtimeConfig.public.siteUrl ?? ""),
  rootDir: nuxt.options.rootDir,
  privateKey: keypair.privateKey,
});

nuxt.options.app.head.meta ??= [];
nuxt.options.app.head.meta.push({ name: MARK_META_NAME, content: token });
```

The tutorial-shaped approach here is a Nitro `render:html` hook. Two reasons this is better: Nuxt 4.5 no longer types nitro hooks on `NuxtHooks`, so you'd be casting; and `app.head` bakes the mark into prerendered pages, not just SSR responses. On a static blog, the hook approach silently produces nothing.

### 4. A verify endpoint that can't be fooled

```ts
export default defineEventHandler(async (event): Promise<VerifyResult> => {
  const presence: { publicKey?: string; mark?: string } = useRuntimeConfig(event).public.presence;

  const body = await readBody<{ token?: unknown }>(event).catch(() => undefined);
  const token = typeof body?.token === "string" ? body.token : presence.mark;

  if (!token) return { valid: false, reason: "no_mark" };

  return verifyMark(token, presence.publicKey ?? "");
});
```

::BlogAlert{type="warning"}
Note what the endpoint does **not** accept: a public key. An API shaped `{ payload, signature, publicKey }` verifies that the caller's signature matches the caller's own key — which is true for every forgery ever made. It reads like verification and checks nothing. The key must come from the server's own config.
::

### 5. The console helper

```ts
export async function verifyMarkInPage(): Promise<MarkVerification> {
  const token = document.querySelector(MARK_META_SELECTOR)?.getAttribute("content");
  if (!token) return { valid: false, reason: "no_mark" };

  const response = await fetch("/api/_presence/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token }),
  });
  return (await response.json()) as MarkVerification;
}
```

Verifying in the browser would mean ed25519 through WebCrypto, whose support is still uneven — to answer a question the endpoint already answers authoritatively.

## Gotchas

- **`private.pem` must never be committed.** Add `**/.presence/` to `.gitignore` — and check it took. A pattern like `.presence/private.pem` contains a slash, so git anchors it to the repo root and it will quietly miss `apps/web/.presence/private.pem`. Verify with `git check-ignore -v <path>`.
- **`0o600` on the private key.** Cheap, and correct.
- **Prefer CI's commit sha** (`VERCEL_GIT_COMMIT_SHA`, `GITHUB_SHA`) over shelling out to git — build hosts often have no `.git`.
- **The mark signs a build, not a request.** A host with no keypair generates a fresh one, so each deploy identifies that deploy. Document the semantic or people will expect a stable identity.
- **Only the public key goes in `runtimeConfig.public`.** Putting the private key there ships your signing key to every visitor.

## Recap

Sign canonical bytes, keep both halves of the keypair together, write the mark through `app.head` so prerendered pages carry it, and never let the caller supply the key you verify against. Next: production.
