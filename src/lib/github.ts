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

/**
 * Upload a binary file (image, etc.) to the repository via the GitHub Contents API.
 * `base64Content` should be the raw base64-encoded file content (no data-URL prefix).
 * Returns the SHA of the newly created blob.
 */
export async function uploadFile(
  token: string,
  filePath: string,
  base64Content: string,
  commitMessage: string,
): Promise<string> {
  const url = `${API_BASE}/repos/${siteConfig.repoOwner}/${siteConfig.repoName}/contents/${filePath}`;

  // Check if file already exists so we can pass its SHA (required for updates)
  let existingSha: string | undefined;
  try {
    const checkRes = await fetch(url, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (checkRes.ok) {
      const existing = (await checkRes.json()) as { sha: string };
      existingSha = existing.sha;
    }
  } catch {
    // file does not exist yet — that's fine
  }

  const body: Record<string, string> = { message: commitMessage, content: base64Content, branch: 'main' };
  if (existingSha) body.sha = existingSha;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
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
