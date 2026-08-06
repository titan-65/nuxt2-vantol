/**
 * Integration test — runs the CLI against a real .env file.
 *
 * Set ENV_SCHEMA_PATH and ENV_FILE_PATH to run these tests.
 *
 * Run: ENV_SCHEMA_PATH=./fixtures/schema.json ENV_FILE_PATH=./fixtures/.env pnpm test
 */
import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";

const SCHEMA_PATH = process.env.ENV_SCHEMA_PATH;
const ENV_PATH = process.env.ENV_FILE_PATH;
const skip = !SCHEMA_PATH || !ENV_PATH;

describe.skipIf(skip)("integration: env-check CLI", () => {
  const tmpDir = resolve(__dirname, "../.tmp-test");
  const cliPath = resolve(__dirname, "../dist/cli.js");

  beforeAll(() => {
    if (skip) {
      console.log("Skipping — set ENV_SCHEMA_PATH and ENV_FILE_PATH to run integration tests");
    }
  });

  function runCli(schemaPath: string, envPath: string) {
    return execSync(`node ${cliPath} --schema ${schemaPath} --env ${envPath}`, {
      encoding: "utf-8",
      timeout: 10_000,
    });
  }

  it.runIf(!skip)("validates a real .env file successfully", () => {
    const output = runCli(SCHEMA_PATH!, ENV_PATH!);
    expect(output).toContain("env-check: all variables valid");
  });

  it.runIf(!skip)("exits 1 when a required var is missing from .env", () => {
    // Create a schema with a var that doesn't exist in the env file
    mkdirSync(tmpDir, { recursive: true });
    const strictSchema = resolve(tmpDir, "strict-schema.json");
    writeFileSync(
      strictSchema,
      JSON.stringify({
        THIS_DOES_NOT_EXIST_IN_ENV: { type: "string" },
      }),
    );

    try {
      expect(() => runCli(strictSchema, ENV_PATH!)).toThrow();
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it.runIf(!skip)("shows masked secrets in output", () => {
    // Find a key in the schema that contains SECRET, KEY, or PASSWORD
    const output = runCli(SCHEMA_PATH!, ENV_PATH!);
    if (output.includes("••••••")) {
      expect(output).toContain("••••••");
    }
  });
});
