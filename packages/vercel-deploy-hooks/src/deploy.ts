import type { DeployConfig, DeployResult, VercelJobResponse } from "./types";

const TIMEOUT_MS = 30_000;

function getDeployUrl(config: DeployConfig): string {
  let url = config.hookUrl;
  if (config.noBuildCache) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}buildCache=false`;
  }
  return url;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(`vercel-deploy-hooks: request timed out after ${timeoutMs / 1000}s`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function triggerDeploy(config: DeployConfig): Promise<DeployResult> {
  const { hookUrl } = config;

  if (!hookUrl || typeof hookUrl !== "string") {
    throw new Error("vercel-deploy-hooks: hookUrl is required");
  }

  try {
    const url = new URL(hookUrl);
    if (!url.hostname.includes("vercel.com")) {
      throw new Error("vercel-deploy-hooks: hookUrl must be a Vercel deploy hook URL");
    }
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("vercel-deploy-hooks:")) throw err;
    throw new Error(`vercel-deploy-hooks: hookUrl must be a valid URL (got "${hookUrl}")`);
  }

  const targetUrl = getDeployUrl(config);

  const timeoutMs = config.timeoutMs ?? TIMEOUT_MS;

  let response: Response;
  try {
    response = await fetchWithTimeout(
      targetUrl,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      timeoutMs,
    );
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("vercel-deploy-hooks:")) throw err;
    throw new Error(
      `vercel-deploy-hooks: network error — ${err instanceof Error ? err.message : err}`,
    );
  }

  if (!response.ok) {
    let message = `vercel-deploy-hooks: deploy failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body?.error?.message) {
        message = `vercel-deploy-hooks: ${body.error.message}`;
      }
    } catch {
      // response body not JSON, use status message
    }
    throw new Error(message);
  }

  const text = await response.text();
  let body: VercelJobResponse;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(
      `vercel-deploy-hooks: expected JSON response from Vercel, got: ${text.slice(0, 200)}`,
    );
  }

  const job = body?.job;
  if (!job) {
    throw new Error(
      `vercel-deploy-hooks: unexpected response format — no "job" field. Got: ${JSON.stringify(body).slice(0, 200)}`,
    );
  }

  return {
    jobId: job.id,
    state: job.state || "UNKNOWN",
    createdAt: job.createdAt ? new Date(job.createdAt).toISOString() : new Date().toISOString(),
  };
}
