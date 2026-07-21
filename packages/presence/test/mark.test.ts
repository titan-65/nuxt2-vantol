import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildMarkToken, resolveHandle } from "../src/hooks/mark";
import { generateKeypair, verifyMark } from "../src/runtime/utils/crypto";

describe("buildMarkToken", () => {
  const keypair = generateKeypair();

  it("produces a token that verifies against the public key", () => {
    const token = buildMarkToken({
      handle: "vantolbennett",
      siteUrl: "https://vantolbennett.com",
      rootDir: process.cwd(),
      privateKey: keypair.privateKey,
    });

    const result = verifyMark(token, keypair.publicKey);
    expect(result.valid).toBe(true);
    expect(result).toMatchObject({
      payload: { handle: "vantolbennett", siteUrl: "https://vantolbennett.com" },
    });
    expect(result.valid && result.payload.buildSha).toBeTruthy();
  });
});

describe("resolveHandle", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "presence-mark-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("prefers the configured handle", () => {
    expect(resolveHandle("configured", dir)).toBe("configured");
  });

  it("falls back to a string author in package.json", () => {
    writeFileSync(join(dir, "package.json"), JSON.stringify({ author: "vantol" }));
    expect(resolveHandle("", dir)).toBe("vantol");
  });

  it("falls back to an object author's name", () => {
    writeFileSync(join(dir, "package.json"), JSON.stringify({ author: { name: "vantol" } }));
    expect(resolveHandle("", dir)).toBe("vantol");
  });

  it("returns unknown when there is nothing to read", () => {
    expect(resolveHandle("", dir)).toBe("unknown");
  });
});
