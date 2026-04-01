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
  name: 'content-triggered-build',
});

console.log(result);
// { jobId: 'xxx', status: 'QUEUED', createdAt: '2026-04-01T00:00:00Z' }
```

## CLI Usage

```bash
# Via flag
npx vercel-deploy-hooks --url https://api.vercel.com/v1/integrations/deploy/...

# Via env var
VERCEL_DEPLOY_HOOK_URL=https://... npx vercel-deploy-hooks

# With a label
npx vercel-deploy-hooks --url https://... --name "blog-update"

# From config file
npx vercel-deploy-hooks --config deploy.config.json
```

### Config File

```json
{
  "hookUrl": "https://api.vercel.com/v1/integrations/deploy/mysite/hook/abc123",
  "name": "scheduled-deploy"
}
```

## How to Get a Deploy Hook URL

1. Go to your Vercel project → **Settings** → **Deploy Hooks**
2. Create a new hook (e.g., "Trigger from CI")
3. Copy the generated URL

## Return Type

```ts
interface DeployResult {
  jobId: string;     // Vercel job ID
  status: string;    // Usually "QUEUED"
  createdAt: string; // ISO timestamp
}
```

## Error Handling

Throws with clear messages for:
- Missing `hookUrl`
- Invalid URL format
- Non-Vercel URL
- HTTP errors (401, 404, etc.)
- Network failures

## License

MIT
