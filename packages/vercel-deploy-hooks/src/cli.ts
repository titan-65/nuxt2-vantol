#!/usr/bin/env node

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { triggerDeploy } from './deploy';
import type { DeployConfig } from './types';

const args = process.argv.slice(2);

function getArg(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  return undefined;
}

function hasFlag(flag: string): boolean {
  return args.includes(flag);
}

function printHelp() {
  console.log(`
vercel-deploy-hooks — Trigger Vercel deployments via deploy hooks

Usage:
  npx vercel-deploy-hooks [options]

Options:
  --url <hookUrl>        Vercel deploy hook URL (or set VERCEL_DEPLOY_HOOK_URL env var)
  --config <path>        Path to a JSON config file
  --no-build-cache       Disable build cache for this deployment
  --dry-run              Validate the URL and print what would happen, without deploying
  --help, -h             Show this help

Examples:
  npx vercel-deploy-hooks --url https://api.vercel.com/v1/integrations/deploy/...
  VERCEL_DEPLOY_HOOK_URL=https://... npx vercel-deploy-hooks
  npx vercel-deploy-hooks --config deploy.config.json
  npx vercel-deploy-hooks --url https://... --dry-run
`);
}

async function main() {
  if (hasFlag('--help') || hasFlag('-h')) {
    printHelp();
    process.exit(0);
  }

  let config: DeployConfig | undefined;

  const configPath = getArg('--config');
  if (configPath) {
    const resolved = resolve(configPath);
    if (!existsSync(resolved)) {
      console.error(`vercel-deploy-hooks: config file not found: ${resolved}`);
      process.exit(1);
    }
    try {
      config = JSON.parse(readFileSync(resolved, 'utf-8')) as DeployConfig;
    } catch {
      console.error(`vercel-deploy-hooks: failed to parse config file: ${resolved}`);
      process.exit(1);
    }
  } else {
    const hookUrl = getArg('--url') || process.env.VERCEL_DEPLOY_HOOK_URL;
    if (!hookUrl) {
      console.error('vercel-deploy-hooks: --url or VERCEL_DEPLOY_HOOK_URL is required\n');
      printHelp();
      process.exit(1);
    }
    config = {
      hookUrl,
      noBuildCache: hasFlag('--no-build-cache'),
    };
  }

  if (!config) {
    console.error('vercel-deploy-hooks: failed to load config');
    process.exit(1);
  }

  // Validate URL
  try {
    const url = new URL(config.hookUrl);
    if (!url.hostname.includes('vercel.com')) {
      throw new Error('URL does not appear to be a Vercel deploy hook');
    }
  } catch (err) {
    console.error(`vercel-deploy-hooks: invalid URL — ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }

  // Dry run
  if (hasFlag('--dry-run')) {
    console.log('vercel-deploy-hooks: dry run (no deploy triggered)');
    console.log(`  URL:    ${config.hookUrl.slice(0, 60)}...`);
    console.log(`  Cache:  ${config.noBuildCache ? 'disabled' : 'enabled'}`);
    console.log('  Valid:  yes');
    process.exit(0);
  }

  try {
    console.log('vercel-deploy-hooks: triggering deploy...');
    const result = await triggerDeploy(config);
    console.log('vercel-deploy-hooks: deployed successfully');
    console.log(`  Job ID:  ${result.jobId}`);
    console.log(`  State:   ${result.state}`);
    console.log(`  Created: ${result.createdAt}`);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
