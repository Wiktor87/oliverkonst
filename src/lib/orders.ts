import { siteConfig } from './config';
import type { Order } from '@/types';

const API_BASE = 'https://api.github.com';
const ORDER_FILE = 'data/orders.json';

/**
 * Save an order to data/orders.json via the GitHub Contents API.
 * The token is a fine-grained PAT with contents:write on this repo,
 * stored in site-content.json and configured through the admin panel.
 */
export async function saveOrder(order: Order, token: string): Promise<boolean> {
  if (!token) return false;

  const url = `${API_BASE}/repos/${siteConfig.repoOwner}/${siteConfig.repoName}/contents/${ORDER_FILE}`;

  try {
    const readRes = await fetch(url, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (!readRes.ok) return false;

    const file = await readRes.json();
    const base64 = (file.content as string).replace(/\n/g, '');
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const decoded = new TextDecoder('utf-8').decode(bytes);
    const orders: Order[] = JSON.parse(decoded);

    orders.push(order);

    const jsonString = JSON.stringify(orders, null, 2);
    const encoded = new TextEncoder().encode(jsonString);
    const content = btoa(Array.from(encoded, (b) => String.fromCharCode(b)).join(''));

    const writeRes = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `New order: ${order.customerName}`,
        content,
        sha: file.sha,
      }),
    });

    return writeRes.ok;
  } catch {
    return false;
  }
}
