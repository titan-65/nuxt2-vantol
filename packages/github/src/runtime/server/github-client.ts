/**
 * Tiny GitHub REST API client — covers only the surface the companion needs:
 * exchange code for token, fetch `/user`, fetch `/user/followers` + `/user/following`.
 */

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
}

export interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

const GITHUB_API = "https://api.github.com";

async function fetchJson<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(
      `GitHub ${response.status} ${response.statusText} — ${await response.text().catch(() => "")}`,
    );
  }
  return (await response.json()) as T;
}

export async function exchangeCodeForToken(args: {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
}): Promise<GitHubTokenResponse> {
  const body = new URLSearchParams({
    client_id: args.clientId,
    client_secret: args.clientSecret,
    code: args.code,
    redirect_uri: args.redirectUri,
  });
  return fetchJson<GitHubTokenResponse>(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/x-www-form-urlencoded" },
      body,
    },
  );
}

export async function fetchUser(accessToken: string): Promise<GitHubUser> {
  return fetchJson<GitHubUser>(`${GITHUB_API}/user`, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
}

export async function fetchFollowers(
  accessToken: string,
): Promise<GitHubUser[]> {
  return fetchJson<GitHubUser[]>(
    `${GITHUB_API}/user/followers?per_page=100`,
    { headers: { authorization: `Bearer ${accessToken}` } },
  );
}

export async function fetchFollowing(
  accessToken: string,
): Promise<GitHubUser[]> {
  return fetchJson<GitHubUser[]>(
    `${GITHUB_API}/user/following?per_page=100`,
    { headers: { authorization: `Bearer ${accessToken}` } },
  );
}
