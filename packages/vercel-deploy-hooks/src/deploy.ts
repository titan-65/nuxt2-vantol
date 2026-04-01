import type { DeployConfig, DeployResult, DeployError } from './types';

export async function triggerDeploy(config: DeployConfig): Promise<DeployResult> {
  const { hookUrl, name } = config;

  if (!hookUrl || typeof hookUrl !== 'string') {
    throw new Error('vercel-deploy-hooks: hookUrl is required');
  }

  try {
    const url = new URL(hookUrl);
    if (!url.hostname.includes('vercel.com')) {
      throw new Error('vercel-deploy-hooks: hookUrl must be a Vercel deploy hook URL');
    }
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('vercel-deploy-hooks:')) throw err;
    throw new Error(`vercel-deploy-hooks: hookUrl must be a valid URL (got "${hookUrl}")`);
  }

  let response: Response;
  try {
    response = await fetch(hookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name || 'deploy-hook' }),
    });
  } catch (err) {
    throw new Error(
      `vercel-deploy-hooks: network error — ${err instanceof Error ? err.message : err}`,
    );
  }

  if (!response.ok) {
    const error: DeployError = {
      message: `vercel-deploy-hooks: deploy failed with status ${response.status}`,
      status: response.status,
      hookUrl,
    };
    try {
      const body = await response.json();
      if (body?.error?.message) {
        error.message = `vercel-deploy-hooks: ${body.error.message}`;
      }
    } catch {
      // response body not JSON
    }
    throw new Error(error.message);
  }

  const body = await response.json();

  return {
    jobId: body.jobId || body.id || 'unknown',
    status: body.status || 'QUEUED',
    createdAt: body.createdAt || new Date().toISOString(),
  };
}
