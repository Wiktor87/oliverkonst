/**
 * Read completed Stripe Checkout Sessions (Payment Link purchases) for the admin panel.
 *
 * Payment Links send the customer straight to Stripe, so the site never gets a
 * chance to write those purchases to data/orders.json. Instead the admin panel
 * reads them directly from the Stripe API with a *restricted* read-only key.
 * The key is kept in this browser's localStorage only – it is never committed
 * to the (public) repository.
 *
 * Required key permissions (Läs): Checkout Sessions.
 * For payment method, receipt and refunds also: PaymentIntents and Charges.
 * For exact product matching (thumbnails) also: Payment Links.
 */

const API_BASE = 'https://api.stripe.com/v1';
const STORAGE_KEY = 'admin_stripe_key';

export interface StripeOrderLineItem {
  description: string;
  quantity: number;
  amountTotal: number;
}

export interface StripeOrderPayment {
  /** Human readable, e.g. "Visa •••• 4242", "Klarna", "Swish" */
  method: string;
  status: string;
  receiptUrl: string;
  amountRefunded: number;
  refunded: boolean;
}

export interface StripeOrder {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  /** Delivery method chosen on the site's checkout page (Frakt / Upphämtning) */
  deliveryMethod: string;
  /** Shipping name/address collected by Stripe, if any */
  shippingName: string;
  shippingAddress: string;
  /** Address typed on the site's checkout page (packed into client_reference_id) */
  siteAddress: string;
  billingAddress: string;
  /** Raw client_reference_id */
  reference: string;
  customFields: { label: string; value: string }[];
  items: StripeOrderLineItem[];
  /** Amounts in whole currency units (SEK), not öre */
  amountSubtotal: number;
  amountShipping: number;
  amountDiscount: number;
  amountTax: number;
  amountTotal: number;
  currency: string;
  paymentStatus: string;
  /** null when the key lacks PaymentIntents/Charges read access */
  payment: StripeOrderPayment | null;
  dashboardUrl: string;
  livemode: boolean;
  /** Stripe Payment Link id (plink_…) the purchase came from */
  paymentLinkId: string;
}

interface StripeAddress {
  line1?: string | null;
  line2?: string | null;
  postal_code?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

interface StripeCharge {
  receipt_url?: string | null;
  amount_refunded: number;
  refunded: boolean;
  payment_method_details?: {
    type: string;
    card?: { brand?: string | null; last4?: string | null; wallet?: { type?: string } | null } | null;
    [key: string]: unknown;
  } | null;
}

interface StripeCheckoutSession {
  id: string;
  created: number;
  livemode: boolean;
  amount_subtotal: number | null;
  amount_total: number | null;
  currency: string | null;
  payment_status: string;
  client_reference_id: string | null;
  payment_link?: string | null;
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
  total_details?: { amount_discount?: number; amount_shipping?: number; amount_tax?: number } | null;
  custom_fields?: {
    label?: { custom?: string | null } | null;
    type: string;
    text?: { value?: string | null } | null;
    numeric?: { value?: string | null } | null;
    dropdown?: { value?: string | null; options?: { label: string; value: string }[] } | null;
  }[];
  payment_intent?: string | { id: string; status: string; latest_charge?: string | StripeCharge | null } | null;
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

const COUNTRY_NAMES: Record<string, string> = { SE: 'Sverige', NO: 'Norge', DK: 'Danmark', FI: 'Finland' };

function formatAddress(a?: StripeAddress | null): string {
  if (!a) return '';
  const street = [a.line1, a.line2].filter(Boolean).join(', ');
  const city = [a.postal_code, a.city].filter(Boolean).join(' ');
  const country = a.country ? COUNTRY_NAMES[a.country] || a.country : '';
  // Stripe often collects only the country for card billing – skip that noise
  if (!street && !city) return '';
  return [street, city, country].filter(Boolean).join(', ');
}

const METHOD_NAMES: Record<string, string> = {
  card: 'Kort',
  klarna: 'Klarna',
  swish: 'Swish',
  link: 'Link',
  paypal: 'PayPal',
  mobilepay: 'MobilePay',
  sepa_debit: 'SEPA',
};

function describePaymentMethod(charge: StripeCharge): string {
  const d = charge.payment_method_details;
  if (!d) return '';
  if (d.type === 'card' && d.card) {
    const brand = d.card.brand ? d.card.brand.charAt(0).toUpperCase() + d.card.brand.slice(1) : 'Kort';
    const wallet = d.card.wallet?.type
      ? ` (${d.card.wallet.type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())})`
      : '';
    return `${brand}${d.card.last4 ? ` •••• ${d.card.last4}` : ''}${wallet}`;
  }
  return METHOD_NAMES[d.type] || d.type;
}

function customFieldValue(f: NonNullable<StripeCheckoutSession['custom_fields']>[number]): string {
  if (f.type === 'dropdown' && f.dropdown) {
    const opt = f.dropdown.options?.find((o) => o.value === f.dropdown?.value);
    return opt?.label || f.dropdown.value || '';
  }
  return f.text?.value || f.numeric?.value || '';
}

function toOrder(s: StripeCheckoutSession): StripeOrder {
  const shipping = s.collected_information?.shipping_details || s.shipping_details;

  // Checkout page packs: "name | phone | Frakt/Upphämtning | street, postal city"
  const refParts = (s.client_reference_id || '').split('|').map((p) => p.trim());

  const pi = typeof s.payment_intent === 'object' ? s.payment_intent : null;
  const piId = typeof s.payment_intent === 'string' ? s.payment_intent : pi?.id || '';
  const charge = pi && typeof pi.latest_charge === 'object' ? pi.latest_charge : null;

  const dashboardBase = `https://dashboard.stripe.com${s.livemode ? '' : '/test'}`;

  return {
    id: s.id,
    createdAt: new Date(s.created * 1000).toISOString(),
    customerName: s.customer_details?.name || shipping?.name || refParts[0] || '',
    customerEmail: s.customer_details?.email || s.customer_email || '',
    customerPhone: s.customer_details?.phone || refParts[1] || '',
    deliveryMethod: refParts[2] || (shipping?.address ? 'Frakt' : ''),
    shippingName: shipping?.name || '',
    shippingAddress: formatAddress(shipping?.address),
    siteAddress: refParts.slice(3).join(' | '),
    billingAddress: formatAddress(s.customer_details?.address),
    reference: s.client_reference_id || '',
    customFields: (s.custom_fields || [])
      .map((f) => ({ label: f.label?.custom || '', value: customFieldValue(f) }))
      .filter((f) => f.value),
    items: (s.line_items?.data || []).map((li) => ({
      description: li.description || '',
      quantity: li.quantity || 1,
      amountTotal: li.amount_total / 100,
    })),
    amountSubtotal: (s.amount_subtotal || 0) / 100,
    amountShipping: (s.total_details?.amount_shipping || 0) / 100,
    amountDiscount: (s.total_details?.amount_discount || 0) / 100,
    amountTax: (s.total_details?.amount_tax || 0) / 100,
    amountTotal: (s.amount_total || 0) / 100,
    currency: (s.currency || 'sek').toUpperCase(),
    paymentStatus: s.payment_status,
    payment: charge
      ? {
          method: describePaymentMethod(charge),
          status: pi?.status || '',
          receiptUrl: charge.receipt_url || '',
          amountRefunded: charge.amount_refunded / 100,
          refunded: charge.refunded,
        }
      : null,
    dashboardUrl: piId ? `${dashboardBase}/payments/${piId}` : `${dashboardBase}/checkout/sessions/${s.id}`,
    livemode: s.livemode,
    paymentLinkId: s.payment_link || '',
  };
}

async function stripeGet<T>(key: string, path: string, params: URLSearchParams): Promise<T> {
  const res = await fetch(`${API_BASE}${path}?${params}`, {
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
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return (await res.json()) as T;
}

async function fetchSessions(key: string, withPayment: boolean, maxPages: number): Promise<StripeOrder[]> {
  const orders: StripeOrder[] = [];
  let startingAfter = '';

  for (let page = 0; page < maxPages; page++) {
    const params = new URLSearchParams({ limit: '100', status: 'complete' });
    params.append('expand[]', 'data.line_items');
    if (withPayment) params.append('expand[]', 'data.payment_intent.latest_charge');
    if (startingAfter) params.set('starting_after', startingAfter);

    const body = await stripeGet<{ data: StripeCheckoutSession[]; has_more: boolean }>(
      key, '/checkout/sessions', params,
    );
    orders.push(...body.data.map(toOrder));
    if (!body.has_more || body.data.length === 0) break;
    startingAfter = body.data[body.data.length - 1].id;
  }

  return orders;
}

/**
 * Fetch all completed Checkout Sessions, newest first.
 * Falls back to fetching without payment details if the key lacks
 * PaymentIntents/Charges permissions (then `paymentDetailsMissing` is true).
 */
export async function fetchStripeOrders(
  key: string,
  maxPages = 10,
): Promise<{ orders: StripeOrder[]; paymentDetailsMissing: boolean }> {
  try {
    return { orders: await fetchSessions(key, true, maxPages), paymentDetailsMissing: false };
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status !== 401 && status !== 403) throw err;
    // Retry without payment expansion – if this also fails the key is wrong altogether
    return { orders: await fetchSessions(key, false, maxPages), paymentDetailsMissing: true };
  }
}

/**
 * Map Payment Link ids to their public buy.stripe.com URLs, so orders can be
 * matched to products by their stored stripePaymentLink. Returns an empty map
 * if the key lacks Payment Links read access.
 */
export async function fetchPaymentLinkUrls(key: string, maxPages = 5): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  let startingAfter = '';
  try {
    for (let page = 0; page < maxPages; page++) {
      const params = new URLSearchParams({ limit: '100' });
      if (startingAfter) params.set('starting_after', startingAfter);
      const body = await stripeGet<{ data: { id: string; url: string }[]; has_more: boolean }>(
        key, '/payment_links', params,
      );
      for (const l of body.data) map[l.id] = l.url;
      if (!body.has_more || body.data.length === 0) break;
      startingAfter = body.data[body.data.length - 1].id;
    }
  } catch {
    // Missing permission – fall back to name matching
  }
  return map;
}
