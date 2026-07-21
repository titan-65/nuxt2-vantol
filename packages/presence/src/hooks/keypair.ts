import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createPublicKey } from "node:crypto";
import { generateKeypair, type Keypair } from "../runtime/utils/crypto";

export interface EnsureKeypairOptions {
  keyDir: string;
  /** PEM private key, usually from an env var. Wins over anything on disk. */
  privateKey?: string;
}

/** Newlines survive env vars badly, so `\n` escapes are accepted too. */
function normalisePem(pem: string): string {
  return pem.includes("\\n") ? pem.replaceAll("\\n", "\n") : pem;
}

/**
 * Resolves the signing keypair, in priority order:
 *
 * 1. An explicitly supplied private key — the public half is derived from it,
 *    so a stable identity survives deploys on hosts with no persistent disk.
 * 2. A complete pair already in `keyDir`.
 * 3. A freshly generated pair, written to `keyDir`.
 *
 * Both halves on disk must be present to be reused: a public key whose private
 * counterpart is missing can sign nothing.
 */
export function ensureKeypair(opts: EnsureKeypairOptions): Keypair {
  if (opts.privateKey) {
    const privateKey = normalisePem(opts.privateKey);

    return {
      privateKey,
      // Never written to disk — the supplied key is the source of truth.
      publicKey: createPublicKey(privateKey).export({ type: "spki", format: "pem" }).toString(),
    };
  }

  const publicPath = join(opts.keyDir, "public.pem");
  const privatePath = join(opts.keyDir, "private.pem");

  if (existsSync(publicPath) && existsSync(privatePath)) {
    return {
      publicKey: readFileSync(publicPath, "utf8"),
      privateKey: readFileSync(privatePath, "utf8"),
    };
  }

  const keypair = generateKeypair();
  mkdirSync(opts.keyDir, { recursive: true });
  writeFileSync(publicPath, keypair.publicKey, { mode: 0o644 });
  writeFileSync(privatePath, keypair.privateKey, { mode: 0o600 });

  return keypair;
}
