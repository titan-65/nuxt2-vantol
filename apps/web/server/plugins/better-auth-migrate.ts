/**
 * Run Better Auth's Kysely/SQLite migrations once at server startup so the
 * `user` / `session` / `account` / `verification` tables exist before
 * any auth route is hit (Better Auth's built-in adapter does not
 * auto-migrate in this setup).
 */

import { defineNitroPlugin } from "nitropack/runtime";
import { getMigrations } from "better-auth/db/migration";
import { auth } from "../utils/auth";

export default defineNitroPlugin(async () => {
  const { runMigrations } = await getMigrations(auth.options);
  await runMigrations();
});
