/**
 * Read completed Stripe Checkout Sessions (Payment Link purchases) for the admin panel.
 *
 * Payment Links send the customer straight to Stripe, so the site never gets a
 * chance to write those purchases to data/orders.json. Instead the admin panel
 * reads them directly from the Stripe API with a *restricted* key that only has
 * read access to Checkout Sessions. The key is kept in this browser's
 * localStorage only – it is never committed to the (public) repository.
 */

const API_BASE = 'https://api.stripe.com/v1';
const STORAGE_KEY = 'admin_stripe_key';

export interface StripeOrderLineItem {
  description: string;
  quantity: number;
  amountTotal: number;
}

export interface StripeOrder {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  /** Free-text reference packed by the checkout page: name | phone | delivery | address */
  reference: string;
  address: string;
  items: StripeOrderLineItem[];
  /** Amount in whole currency units (SEK), not öre */
  amountTotal: number;
  currency: string;
  paymentStatus: string;
}

interface StripeAddress {
  line1?: string | null;
  line2?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country?: string | null;
}

interface StripeCheckoutSession {
  id: string;
  created: number;
  amount_total: number | null;
  currency: string | null;
  payment_status: string;
  client_reference_id: string | null;
  customer_email: string | null;
  customer_details?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: StripeAddress | null;
  } | null;
  shipping_details?: { name?: string | null; address?: StripeAddress | null } | null;
  collected_information?: {
    shipping_details?: { name?: string | null; address?: StripeAddress | null } | null;
  } | null;
  line_items?: {
    data: { description: string | null; quantity: number | null; amount_total: number }[];
  };
}

export function getStoredStripeKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function storeStripeKey(key: string): void {
  try {
    if (key) localStorage.setItem(STORAGE_KEY, key);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

function formatAddress(a?: StripeAddress | null): string {
  if (!a) return '';
  const street = [a.line1, a.line2].filter(Boolean).join(', ');
  const city = [a.postal_code, a.city].filter(Boolean).join(' ');
  return [street, city].filter(Boolean).join(', ');
}

function toOrder(s: StripeCheckoutSession): StripeOrder {
  const shipping = s.collected_information?.shipping_details || s.shipping_details;
  return {
    id: s.id,
    createdAt: new Date(s.created * 1000).toISOString(),
    customerName: s.customer_details?.name || shipping?.name || s.client_reference_id?.split('|')[0].trim() || '',
    customerEmail: s.customer_details?.email || s.customer_email || '',
    customerPhone: s.customer_details?.phone || '',
    reference: s.client_reference_id || '',
    address: formatAddress(shipping?.address),
    items: (s.line_items?.data || []).map((li) => ({
      description: li.description || '',
      quantity: li.quantity || 1,
      amountTotal: li.amount_total / 100,
    })),
    amountTotal: (s.amount_total || 0) / 100,
    currency: (s.currency || 'sek').toUpperCase(),
    paymentStatus: s.payment_status,
  };
}

/** Fetch all completed Checkout Sessions, newest first. */
export async function fetchStripeOrders(key: string, maxPages = 10): Promise<StripeOrder[]> {
  const orders: StripeOrder[] = [];
  let startingAfter = '';

  for (let page = 0; page < maxPages; page++) {
    const params = new URLSearchParams({ limit: '100', status: 'complete' });
    params.append('expand[]', 'data.line_items');
    if (startingAfter) params.set('starting_after', startingAfter);

    const res = await fetch(`${API_BASE}/checkout/sessions?${params}`, {
      headers: { Authorization: `Bearer ${key}` },
    });

    if (!res.ok) {
      let message = `Stripe API error ${res.status}`;
      try {
        const body = (await res.json()) as { error?: { message?: string } };
        if (body.error?.message) message = body.error.message;
      } catch {
        // ignore
      }
      throw new Error(message);
    }

    const body = (await res.json()) as { data: StripeCheckoutSession[]; has_more: boolean };
    orders.push(...body.data.map(toOrder));
    if (!body.has_more || body.data.length === 0) break;
    startingAfter = body.data[body.data.length - 1].id;
  }

  return orders;
}
