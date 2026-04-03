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
  const base64 = file.content.replace(/\n/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const decoded = new TextDecoder('utf-8').decode(bytes);
  return { data: JSON.parse(decoded) as T, sha: file.sha };
}

/** Write a JSON file back to the repository (creates a commit). Returns the new SHA. */
export async function writeJsonFile<T>(
  token: string,
  filePath: string,
  data: T,
  sha: string,
  commitMessage: string,
): Promise<string> {
  const url = `${API_BASE}/repos/${siteConfig.repoOwner}/${siteConfig.repoName}/contents/${filePath}`;

  const jsonString = JSON.stringify(data, null, 2);
  const bytes = new TextEncoder().encode(jsonString);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  const content = btoa(binary);

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

  const result = (await res.json()) as { content: { sha: string } };
  return result.content.sha;
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
