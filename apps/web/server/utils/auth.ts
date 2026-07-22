/**
 * Better Auth instance — GitHub OAuth via the presence wall.
 *
 * Reuses the existing GitHub OAuth app creds (NUXT_PRESENCE_GITHUB_*).
 * `database` uses better-sqlite3 (already a dependency) through Better Auth's
 * built-in Kysely SQLite adapter; tables are auto-created on first use.
 */

import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const dbDir = resolve(".data");
mkdirSync(dbDir, { recursive: true });

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-secret-change-me-in-production",
  socialProviders: {
    github: {
      clientId: process.env.NUXT_PRESENCE_GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.NUXT_PRESENCE_GITHUB_CLIENT_SECRET ?? "",
      // Surface the GitHub username as `user.login` so the wall can show @handle.
      mapProfileToUser: (profile) => ({
        login: (profile as { login?: string }).login,
      }),
    },
  },
  // `login` is the GitHub handle; persisted so the resolver can read it back.
  user: {
    additionalFields: {
      login: { type: "string", required: false },
    },
  },
  database: new Database(resolve(dbDir, "better-auth.db")),
});
