import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";
import { existsSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ensureKeypair } from "../src/hooks/keypair";

describe("ensureKeypair", () => {
  let dir: string;

  beforeEach(() => {
    dir = join(mkdtempSync(join(tmpdir(), "presence-test-")), ".presence");
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("generates keys when none exist, creating the directory", () => {
    const kp = ensureKeypair({ keyDir: dir });

    expect(existsSync(join(dir, "private.pem"))).toBe(true);
    expect(existsSync(join(dir, "public.pem"))).toBe(true);
    expect(kp.publicKey).toMatch(/BEGIN PUBLIC KEY/);
    expect(kp.privateKey).toMatch(/BEGIN PRIVATE KEY/);
  });

  it("keeps the private key owner-only", () => {
    ensureKeypair({ keyDir: dir });

    expect(statSync(join(dir, "private.pem")).mode & 0o077).toBe(0);
  });

  it("is idempotent — reuses existing keys", () => {
    const first = ensureKeypair({ keyDir: dir });
    const second = ensureKeypair({ keyDir: dir });

    expect(second.publicKey).toBe(first.publicKey);
    expect(second.privateKey).toBe(first.privateKey);
  });

  it("regenerates when only one half of the pair survives", () => {
    const first = ensureKeypair({ keyDir: dir });
    rmSync(join(dir, "public.pem"));
    const second = ensureKeypair({ keyDir: dir });

    expect(second.publicKey).not.toBe(first.publicKey);
    expect(existsSync(join(dir, "public.pem"))).toBe(true);
  });
});
