import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { signMark, type MarkPayload } from "../runtime/utils/crypto";

export interface BuildMarkOptions {
  handle: string;
  siteUrl: string;
  rootDir: string;
  privateKey: string;
}

export function readBuildSha(rootDir: string): string {
  const fromCi = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA;
  if (fromCi) return fromCi.slice(0, 7);

  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      cwd: rootDir,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    // Not a git checkout, or git is unavailable — the mark still signs fine.
    return "unknown";
  }
}

/** Falls back to the consuming app's package.json author, per the module options docs. */
export function resolveHandle(handle: string, rootDir: string): string {
  if (handle) return handle;

  try {
    const pkg: unknown = JSON.parse(readFileSync(join(rootDir, "package.json"), "utf8"));
    const author = (pkg as { author?: string | { name?: string } }).author;
    const name = typeof author === "string" ? author : author?.name;
    if (name) return name;
  } catch {
    // No readable package.json — fall through.
  }

  return "unknown";
}

export function buildMarkToken(opts: BuildMarkOptions): string {
  const payload: MarkPayload = {
    handle: resolveHandle(opts.handle, opts.rootDir),
    siteUrl: opts.siteUrl,
    buildSha: readBuildSha(opts.rootDir),
    timestamp: Date.now(),
  };

  return signMark(payload, opts.privateKey);
}

export const MARK_META_NAME = "presence-mark";
