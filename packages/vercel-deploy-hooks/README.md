# @vvantol2000/vercel-deploy-hooks

[![npm version](https://img.shields.io/npm/v/@vvantol2000/vercel-deploy-hooks)](https://www.npmjs.com/package/@vvantol2000/vercel-deploy-hooks)
[![npm downloads](https://img.shields.io/npm/dt/@vvantol2000/vercel-deploy-hooks)](https://www.npmjs.com/package/@vvantol2000/vercel-deploy-hooks)
[![license](https://img.shields.io/npm/l/@vvantol2000/vercel-deploy-hooks)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![tests](https://img.shields.io/badge/tests-13%20passing-brightgreen)](.)
[![dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](.)
[![bundle size](https://img.shields.io/badge/bundle-2.2%20kB-lightgrey)](.)

Trigger Vercel deployments from Node.js, scripts, or CI/CD using [Vercel Deploy Hooks](https://vercel.com/docs/deploy-hooks).

Zero dependencies. TypeScript support. Works as both a library and a CLI.

---

## Quick Start

```bash
npm install @vvantol2000/vercel-deploy-hooks
```

```ts
import { triggerDeploy } from "@vvantol2000/vercel-deploy-hooks";

const result = await triggerDeploy({
  hookUrl: "https://api.vercel.com/v1/integrations/deploy/prj_ABC123/your-hook-token",
});

console.log(result);
// {
//   jobId: 'jwx6PaurTs7K19Q9SZ4K',
//   state: 'PENDING',
//   createdAt: '2026-04-01T20:32:17.240Z'
// }
```

---

## Get a Deploy Hook URL

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your project
3. Go to **Settings** → **Git**
4. Scroll down to **Deploy Hooks**
5. Enter a name (e.g., `content-deploy`) and select a branch
6. Copy the generated URL

The URL looks like:

```
https://api.vercel.com/v1/integrations/deploy/prj_ABC123/your-secret-token
```

---

## CLI Usage

### Install globally (optional)

```bash
npm install -g @vvantol2000/vercel-deploy-hooks
vercel-deploy-hooks --url https://...
```

### Or use with npx

```bash
npx @vvantol2000/vercel-deploy-hooks --url https://api.vercel.com/v1/integrations/deploy/...
```

### Environment variable

```bash
export VERCEL_DEPLOY_HOOK_URL=https://api.vercel.com/v1/integrations/deploy/...
npx @vvantol2000/vercel-deploy-hooks
```

### All CLI options

| Flag               | Description                                                     |
| ------------------ | --------------------------------------------------------------- |
| `--url <url>`      | Vercel deploy hook URL                                          |
| `--config <path>`  | Path to a JSON config file                                      |
| `--dry-run`        | Validate the URL and print what would happen, without deploying |
| `--no-build-cache` | Append `?buildCache=false` to skip Vercel's build cache         |
| `--help`           | Show help                                                       |

### Example output

```
vercel-deploy-hooks: triggering deploy...
vercel-deploy-hooks: deployed successfully
  Job ID:  jwx6PaurTs7K19Q9SZ4K
  State:   PENDING
  Created: 2026-04-01T20:32:17.240Z
```

---

## Programmatic API

### `triggerDeploy(config)`

Triggers a Vercel deployment and returns the job details.

```ts
import { triggerDeploy } from "@vvantol2000/vercel-deploy-hooks";

const result = await triggerDeploy({
  hookUrl: "https://api.vercel.com/v1/integrations/deploy/prj_ABC123/token",
  noBuildCache: false, // optional
  timeoutMs: 30_000, // optional (default: 30s)
});
```

#### `DeployConfig`

| Property       | Type      | Required | Description                                           |
| -------------- | --------- | -------- | ----------------------------------------------------- |
| `hookUrl`      | `string`  | Yes      | Vercel deploy hook URL                                |
| `noBuildCache` | `boolean` | No       | Append `?buildCache=false` to skip Vercel build cache |
| `timeoutMs`    | `number`  | No       | Request timeout in ms (default: `30000`)              |

#### `DeployResult`

```ts
interface DeployResult {
  jobId: string; // Vercel job ID (e.g., "jwx6PaurTs7K19Q9SZ4K")
  state: string; // "PENDING", "QUEUED", etc.
  createdAt: string; // ISO 8601 timestamp (e.g., "2026-04-01T20:32:17.240Z")
}
```

---

## How It Works

This package sends a `POST` request to your deploy hook URL. No auth header needed — the URL itself contains the secret token.

**Request:**

```
POST https://api.vercel.com/v1/integrations/deploy/prj_ABC123/your-secret-token
Content-Type: application/json
```

**Vercel's response:**

```json
{
  "job": {
    "id": "jwx6PaurTs7K19Q9SZ4K",
    "state": "PENDING",
    "createdAt": 1743532337240
  }
}
```

The package maps this to the `DeployResult` type — `createdAt` is converted from a Unix timestamp (milliseconds) to an ISO string.

---

## Error Handling

All errors are thrown as `Error` with a clear message prefixed by `vercel-deploy-hooks:`.

```ts
try {
  const result = await triggerDeploy({ hookUrl: myUrl });
} catch (err) {
  console.error(err.message);
}
```

### Errors thrown

| Scenario                     | Error message                                                       |
| ---------------------------- | ------------------------------------------------------------------- |
| Missing `hookUrl`            | `vercel-deploy-hooks: hookUrl is required`                          |
| Invalid URL                  | `vercel-deploy-hooks: hookUrl must be a valid URL (got "...")`      |
| Non-Vercel URL               | `vercel-deploy-hooks: hookUrl must be a Vercel deploy hook URL`     |
| HTTP error (401, 404, etc.)  | `vercel-deploy-hooks: deploy failed with status 404`                |
| Vercel returns error body    | `vercel-deploy-hooks: <Vercel error message>`                       |
| Response is not JSON         | `vercel-deploy-hooks: expected JSON response from Vercel, got: ...` |
| Response missing `job` field | `vercel-deploy-hooks: unexpected response format — no "job" field`  |
| Request timeout              | `vercel-deploy-hooks: request timed out after 30s`                  |
| Network failure              | `vercel-deploy-hooks: network error — ECONNREFUSED`                 |

---

## Use Cases

### Trigger on CMS content change

```ts
// In your CMS webhook handler (e.g., Contentful, Sanity, Strapi)
import { triggerDeploy } from "@vvantol2000/vercel-deploy-hooks";

export async function onContentPublished() {
  await triggerDeploy({
    hookUrl: process.env.VERCEL_DEPLOY_HOOK_URL,
  });
}
```

### Scheduled deploys (cron)

```ts
// Run daily at 6am via cron or GitHub Actions
import { triggerDeploy } from "@vvantol2000/vercel-deploy-hooks";

const result = await triggerDeploy({
  hookUrl: process.env.VERCEL_DEPLOY_HOOK_URL,
  noBuildCache: true, // force a fresh build
});
console.log(`Scheduled deploy queued: ${result.jobId}`);
```

### In a GitHub Action

```yaml
name: Trigger Vercel Deploy
on:
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: npx @vvantol2000/vercel-deploy-hooks --url "${{ secrets.VERCEL_DEPLOY_HOOK_URL }}"
```

### In a Nuxt/Nitro server route

```ts
// server/api/rebuild.post.ts
import { triggerDeploy } from "@vvantol2000/vercel-deploy-hooks";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (body.secret !== process.env.REBUILD_SECRET) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const result = await triggerDeploy({
    hookUrl: process.env.VERCEL_DEPLOY_HOOK_URL,
  });

  return { success: true, jobId: result.jobId };
});
```

---

## Disable Build Cache

By default, Vercel uses cached builds when triggered via deploy hooks. To force a full rebuild:

```ts
await triggerDeploy({
  hookUrl: myUrl,
  noBuildCache: true,
});
```

Or via CLI:

```bash
npx @vvantol2000/vercel-deploy-hooks --url https://... --no-build-cache
```

---

## Config File

Instead of passing the URL via flag or env var, use a JSON config file:

```json
{
  "hookUrl": "https://api.vercel.com/v1/integrations/deploy/prj_ABC123/token",
  "noBuildCache": false
}
```

```bash
npx @vvantol2000/vercel-deploy-hooks --config deploy.config.json
```

---

## Integration Tests

Run the included tests against a real Vercel deploy hook to verify everything works with your project.

```bash
# Dry run — validates URL only, no deploy
VERCEL_DRY_RUN=true VERCEL_DEPLOY_HOOK_URL=https://... npx vitest run

# Real deploy — actually triggers a deployment
VERCEL_DEPLOY_HOOK_URL=https://... npx vitest run
```

---

## Vercel API Limits

- Hobby plan: 5 deploy hooks per project
- Pro plan: 5 deploy hooks per project
- Enterprise: 10 deploy hooks per project

See [Vercel Deploy Hooks docs](https://vercel.com/docs/deploy-hooks) for full details.

---

## License

MIT
