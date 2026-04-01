# @vvantol2000/vercel-deploy-hooks

Trigger Vercel deployments programmatically via deploy hooks. Use in CI/CD pipelines, scheduled builds, or content-triggered deploys.

## Install

```bash
npm install @vvantol2000/vercel-deploy-hooks
```

## Programmatic Usage

```ts
import { triggerDeploy } from '@vvantol2000/vercel-deploy-hooks';

const result = await triggerDeploy({
  hookUrl: 'https://api.vercel.com/v1/integrations/deploy/mysite/hook/abc123',
});

console.log(result);
// { jobId: 'okzCd50AIap1O31g0gne', state: 'PENDING', createdAt: '2026-04-01T12:00:00.000Z' }
```

## CLI Usage

```bash
# Via flag
npx vercel-deploy-hooks --url https://api.vercel.com/v1/integrations/deploy/...

# Via env var
VERCEL_DEPLOY_HOOK_URL=https://... npx vercel-deploy-hooks

# Dry run (validate without deploying)
npx vercel-deploy-hooks --url https://... --dry-run

# Disable build cache
npx vercel-deploy-hooks --url https://... --no-build-cache

# From config file
npx vercel-deploy-hooks --config deploy.config.json
```

### Config File

```json
{
  "hookUrl": "https://api.vercel.com/v1/integrations/deploy/mysite/hook/abc123",
  "noBuildCache": false
}
```

## How to Get a Deploy Hook URL

1. Go to your Vercel project → **Settings** → **Git**
2. In "Deploy Hooks", enter a name and select a branch
3. Copy the generated URL

## How It Works

This package sends a `POST` request to your Vercel deploy hook URL. Vercel's API returns:

```json
{
  "job": {
    "id": "okzCd50AIap1O31g0gne",
    "state": "PENDING",
    "createdAt": 1662825789999
  }
}
```

The package maps this to a clean `DeployResult`:

```ts
interface DeployResult {
  jobId: string;     // Vercel job ID
  state: string;     // PENDING, QUEUED, etc.
  createdAt: string; // ISO timestamp (converted from unix ms)
}
```

## Error Handling

Throws with clear messages for:
- Missing `hookUrl`
- Invalid URL format
- Non-Vercel URL
- HTTP errors (401, 404, etc.)
- Unexpected response format (no `job` field)
- Non-JSON response body
- Request timeout (default 30s)
- Network failures

## Integration Tests

Run against a real Vercel deploy hook:

```bash
# Dry run (validates URL only)
VERCEL_DRY_RUN=true VERCEL_DEPLOY_HOOK_URL=https://... pnpm test

# Real deploy (actually triggers!)
VERCEL_DEPLOY_HOOK_URL=https://... pnpm test
```

## Verify Your Hooks

List deploy hooks for a project using the Vercel API:

```bash
VERCEL_TOKEN=xxx VERCEL_PROJECT_ID=xxx node scripts/verify.mjs
```

## License

MIT
