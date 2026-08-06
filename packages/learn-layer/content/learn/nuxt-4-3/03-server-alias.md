---
title: "The #server Alias"
description: "Clean, predictable imports inside your server directory — no more ../../../ relative-path hell."
series: "nuxt-4-3"
order: 3
feature: "#server import alias"
sourcePRs: ["https://github.com/nuxt/nuxt/pull/33870"]
---

## What's new

Nuxt 4.3 adds a `#server` alias for imports **within your server directory**, mirroring how `#shared` already works.

## Why you'd care

Deeply nested server routes turn imports into a counting exercise: was it three `../` or four? Get it wrong and the build breaks. `#server` gives every server file the same stable, absolute-feeling import path.

## Before

From a nested API route, reaching a utility meant walking back up the tree:

```ts [server/api/users/[id]/profile.ts]
import { helper } from "../../../../utils/helper";
```

Move the file and every one of those paths breaks.

## After

Import from the alias — same path no matter where the file lives:

```ts [server/api/users/[id]/profile.ts]
import { helper } from "#server/utils/helper";
```

## Do it yourself

1. Create a utility at `server/utils/helper.ts` that exports a simple function.
2. Create a nested route, e.g. `server/api/users/[id]/profile.ts`.
3. Import the helper using `import { helper } from '#server/utils/helper'`.
4. Hit the endpoint and confirm it works.
5. Try importing `#server/...` from a component in `app/` — note that it's blocked.

::BlogAlert{type="warning"}
`#server` includes import protection: you **can't** import server code from client or shared contexts. That's a feature — it keeps server-only code (and secrets) out of your client bundle.
::

## Gotchas

- The alias resolves relative to the `server/` directory root, not the file you're in. Write the full path from `server/`.
- If your editor doesn't resolve `#server` at first, restart the TS server so it picks up the regenerated Nuxt types.

## Recap

Use `#server/...` for imports inside `server/`. Cleaner paths, safe refactors, and a hard boundary against leaking server code to the client.
