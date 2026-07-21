import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";
import { existsSync, mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ensureKeypair } from "../src/hooks/keypair";
import { generateKeypair, signMark, verifyMark } from "../src/runtime/utils/crypto";

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

  it("uses a supplied private key and derives its public half", () => {
    const supplied = generateKeypair();
    const kp = ensureKeypair({ keyDir: dir, privateKey: supplied.privateKey });

    expect(kp.privateKey).toBe(supplied.privateKey);
    expect(kp.publicKey.trim()).toBe(supplied.publicKey.trim());
  });

  it("keeps a supplied key stable across builds and off the disk", () => {
    const supplied = generateKeypair();
    const first = ensureKeypair({ keyDir: dir, privateKey: supplied.privateKey });
    const second = ensureKeypair({ keyDir: dir, privateKey: supplied.privateKey });

    expect(second.publicKey).toBe(first.publicKey);
    expect(existsSync(dir) ? readdirSync(dir) : []).toEqual([]);
  });

  it("accepts a supplied key whose newlines were escaped by an env var", () => {
    const supplied = generateKeypair();
    const escaped = supplied.privateKey.replaceAll("\n", "\\n");

    const kp = ensureKeypair({ keyDir: dir, privateKey: escaped });
    const token = signMark(
      { handle: "v", siteUrl: "https://x.test", buildSha: "abc", timestamp: 1 },
      kp.privateKey,
    );

    expect(verifyMark(token, supplied.publicKey).valid).toBe(true);
  });

  it("ignores the disk pair entirely when a key is supplied", () => {
    const onDisk = ensureKeypair({ keyDir: dir });
    const supplied = generateKeypair();

    const kp = ensureKeypair({ keyDir: dir, privateKey: supplied.privateKey });
    expect(kp.publicKey).not.toBe(onDisk.publicKey);
  });

  it("regenerates when only one half of the pair survives", () => {
    const first = ensureKeypair({ keyDir: dir });
    rmSync(join(dir, "public.pem"));
    const second = ensureKeypair({ keyDir: dir });

    expect(second.publicKey).not.toBe(first.publicKey);
    expect(existsSync(join(dir, "public.pem"))).toBe(true);
  });
});
