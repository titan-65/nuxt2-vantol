#!/usr/bin/env node

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateEnv } from './validate';
import type { EnvSchema } from './types';

const args = process.argv.slice(2);

function getArg(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  return undefined;
}

function hasFlag(flag: string): boolean {
  return args.includes(flag);
}

function parseEnvFile(path: string): Record<string, string> {
  const content = readFileSync(path, 'utf-8');
  const env: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    env[key] = value;
  }
  return env;
}

function printHelp() {
  console.log(`
env-check — Validate environment variables against a schema

Usage:
  npx env-check [options]

Options:
  --schema <path>   Path to a JSON schema file
  --env <path>      Path to .env file (default: process.env)
  --help, -h        Show this help

Schema format (JSON):
  {
    "DATABASE_URL": { "type": "url", "required": true },
    "PORT": { "type": "number", "default": 3000 },
    "NODE_ENV": { "type": "enum", "values": ["development", "production", "test"], "default": "development" }
  }
`);
}

function main() {
  if (hasFlag('--help') || hasFlag('-h')) {
    printHelp();
    process.exit(0);
  }

  const schemaPath = getArg('--schema');
  if (!schemaPath) {
    console.error('env-check: --schema is required\n');
    printHelp();
    process.exit(1);
  }

  const resolvedSchemaPath = resolve(schemaPath);
  if (!existsSync(resolvedSchemaPath)) {
    console.error(`env-check: schema file not found: ${resolvedSchemaPath}`);
    process.exit(1);
  }

  let schema: EnvSchema | undefined;
  try {
    schema = JSON.parse(readFileSync(resolvedSchemaPath, 'utf-8')) as EnvSchema;
  } catch {
    console.error(`env-check: failed to parse schema file: ${resolvedSchemaPath}`);
    process.exit(1);
  }

  if (!schema) {
    console.error(`env-check: schema file is empty: ${resolvedSchemaPath}`);
    process.exit(1);
  }

  const envPath = getArg('--env');
  let env: Record<string, string | undefined>;

  if (envPath) {
    const resolvedEnvPath = resolve(envPath);
    if (!existsSync(resolvedEnvPath)) {
      console.error(`env-check: env file not found: ${resolvedEnvPath}`);
      process.exit(1);
    }
    env = parseEnvFile(resolvedEnvPath);
  } else {
    env = process.env as Record<string, string | undefined>;
  }

  try {
    const result = validateEnv(schema, env);
    console.log('env-check: all variables valid');
    for (const [key, value] of Object.entries(result)) {
      const display = key.toLowerCase().includes('secret') || key.toLowerCase().includes('key') || key.toLowerCase().includes('password')
        ? '••••••'
        : String(value);
      console.log(`  ✓ ${key}=${display}`);
    }
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
