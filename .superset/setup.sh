#!/usr/bin/env bash
# Superset workspace setup for the vantolbennett monorepo.
# Runs once per workspace, in the workspace worktree root.

set -euo pipefail

echo "==> Installing monorepo dependencies (pnpm)"
# corepack reads the `packageManager` field and pins pnpm@10.33.0 for us.
pnpm install

# Seed apps/web/.env from env.example if no .env exists yet.
# The repo's .gitignore already excludes .env, so each workspace starts clean.
# Placeholders let `nuxt dev` boot; the developer fills in real values locally.
ENV_FILE="apps/web/.env"
ENV_EXAMPLE="apps/web/env.example"
if [ ! -f "$ENV_FILE" ] && [ -f "$ENV_EXAMPLE" ]; then
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  echo "==> Seeded $ENV_FILE from $ENV_EXAMPLE (placeholder values — fill in real Firebase/Studio credentials to enable those features)."
else
  echo "==> $ENV_FILE already exists, leaving untouched."
fi
