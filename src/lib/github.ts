import { siteConfig } from './config';

const API_BASE = 'https://api.github.com';

interface GitHubFileResponse {
  content: string;
  sha: string;
  name: string;
  path: string;
}

/** Read a JSON file from the repository and return its parsed content and SHA. */
export async function readJsonFile<T>(token: string, filePath: string): Promise<{ data: T; sha: string }> {
  const url = `${API_BASE}/repos/${siteConfig.repoOwner}/${siteConfig.repoName}/contents/${filePath}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status}: ${await res.text()}`);
  }

  const file = (await res.json()) as GitHubFileResponse;
  const decoded = atob(file.content.replace(/\n/g, ''));
  return { data: JSON.parse(decoded) as T, sha: file.sha };
}

/** Write a JSON file back to the repository (creates a commit). */
export async function writeJsonFile<T>(
  token: string,
  filePath: string,
  data: T,
  sha: string,
  commitMessage: string,
): Promise<void> {
  const url = `${API_BASE}/repos/${siteConfig.repoOwner}/${siteConfig.repoName}/contents/${filePath}`;
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: commitMessage, content, sha }),
  });

  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status}: ${await res.text()}`);
  }
}

/** Validate a GitHub PAT by fetching the authenticated user. Returns the login on success. */
export async function validateToken(token: string): Promise<string> {
  const res = await fetch(`${API_BASE}/user`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) {
    throw new Error('Invalid token');
  }

  const user = (await res.json()) as { login: string };
  return user.login;
}
