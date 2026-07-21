import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateKeypair, type Keypair } from "../runtime/utils/crypto";

export interface EnsureKeypairOptions {
  keyDir: string;
}

/**
 * Loads the keypair from `keyDir`, generating one on first run.
 *
 * Both halves must be present to be reused — a half-deleted pair regenerates,
 * since a public key with no matching private key can verify nothing.
 */
export function ensureKeypair(opts: EnsureKeypairOptions): Keypair {
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
