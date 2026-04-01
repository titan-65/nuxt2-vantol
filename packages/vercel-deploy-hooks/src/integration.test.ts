/**
 * Integration test — runs against a real Vercel deploy hook.
 *
 * Set VERCEL_DEPLOY_HOOK_URL to run these tests.
 * Set VERCEL_DRY_RUN=true to skip the actual deploy trigger.
 *
 * Run: VERCEL_DEPLOY_HOOK_URL=https://... pnpm test
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { triggerDeploy } from './deploy';

const HOOK_URL = process.env.VERCEL_DEPLOY_HOOK_URL;
const DRY_RUN = process.env.VERCEL_DRY_RUN === 'true';

const skip = !HOOK_URL;

describe.skipIf(skip)('integration: vercel-deploy-hooks', () => {
  beforeAll(() => {
    if (skip) {
      console.log('Skipping — set VERCEL_DEPLOY_HOOK_URL to run integration tests');
    }
  });

  it('validates the hook URL format', () => {
    expect(HOOK_URL).toBeTruthy();
    const url = new URL(HOOK_URL!);
    expect(url.hostname).toContain('vercel.com');
    expect(url.pathname).toContain('/deploy/');
  });

  it.runIf(!DRY_RUN)('triggers a real deploy and returns job info', async () => {
    const result = await triggerDeploy({ hookUrl: HOOK_URL! });

    // Vercel returns a job object
    expect(result.jobId).toBeTruthy();
    expect(result.jobId.length).toBeGreaterThan(0);
    expect(result.state).toBeTruthy();
    // createdAt should be a valid ISO date
    expect(new Date(result.createdAt).getTime()).not.toBeNaN();
  });

  it.runIf(DRY_RUN)('dry run: validates URL without deploying', () => {
    console.log(`Dry run — would deploy to: ${HOOK_URL!.slice(0, 60)}...`);
    expect(HOOK_URL).toMatch(/^https:\/\/api\.vercel\.com\/v1\/integrations\/deploy\//);
  });
});
