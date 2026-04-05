import { siteConfig } from './config';
import type { Order } from '@/types';

const API_BASE = 'https://api.github.com';
const ORDER_FILE = 'data/orders.json';

/**
 * Save an order to data/orders.json via the GitHub Contents API.
 * Uses NEXT_PUBLIC_ORDER_TOKEN (a fine-grained PAT with contents:write).
 */
export async function saveOrder(order: Order): Promise<boolean> {
  const token = process.env.NEXT_PUBLIC_ORDER_TOKEN;
  if (!token) {
    console.warn('NEXT_PUBLIC_ORDER_TOKEN not set – order not saved to repository');
    return false;
  }

  const url = `${API_BASE}/repos/${siteConfig.repoOwner}/${siteConfig.repoName}/contents/${ORDER_FILE}`;

  try {
    // Read current orders file
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

    // Append new order
    orders.push(order);

    // Encode updated content
    const jsonString = JSON.stringify(orders, null, 2);
    const encoded = new TextEncoder().encode(jsonString);
    const content = btoa(Array.from(encoded, (b) => String.fromCharCode(b)).join(''));

    // Write back
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
