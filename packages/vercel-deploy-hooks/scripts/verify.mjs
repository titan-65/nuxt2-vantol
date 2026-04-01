/**
 * Verification script — checks if deploy hooks exist for a Vercel project.
 *
 * Usage:
 *   VERCEL_TOKEN=xxx VERCEL_PROJECT_ID=xxx node scripts/verify.mjs
 *
 * This does NOT trigger a deploy. It only lists existing hooks.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;

if (!TOKEN || !PROJECT_ID) {
  console.error(`
Usage: VERCEL_TOKEN=xxx VERCEL_PROJECT_ID=xxx node scripts/verify.mjs

Required env vars:
  VERCEL_TOKEN       — Vercel API token (get from https://vercel.com/account/tokens)
  VERCEL_PROJECT_ID  — Vercel project ID (found in project settings URL)
`);
  process.exit(1);
}

async function main() {
  console.log(`Checking deploy hooks for project: ${PROJECT_ID}\n`);

  const res = await fetch(
    `https://api.vercel.com/v9/projects/${PROJECT_ID}/deploy-hooks`,
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    },
  );

  if (!res.ok) {
    console.error(`API error: ${res.status} ${res.statusText}`);
    const body = await res.text();
    console.error(body);
    process.exit(1);
  }

  const data = await res.json();

  if (!data.deployHooks || data.deployHooks.length === 0) {
    console.log('No deploy hooks found for this project.');
    console.log('\nCreate one at: https://vercel.com/[team]/[project]/settings/git');
    process.exit(0);
  }

  console.log(`Found ${data.deployHooks.length} deploy hook(s):\n`);

  for (const hook of data.deployHooks) {
    console.log(`  Name:    ${hook.name}`);
    console.log(`  Branch:  ${hook.ref}`);
    console.log(`  URL:     ${hook.url || '(use vercel-deploy-hooks --url <url>)'}`);
    console.log(`  Created: ${new Date(hook.createdAt).toISOString()}`);
    console.log('');
  }

  // Quick test: fetch without triggering
  const testUrl = data.deployHooks[0].url;
  if (testUrl) {
    console.log('To test deployment, run:');
    console.log(`  npx @vvantol2000/vercel-deploy-hooks --url "${testUrl}" --dry-run`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
