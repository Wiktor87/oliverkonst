/**
 * Payment types and interfaces for future Klarna and Stripe integration.
 *
 * NOTE: These are placeholder types. Actual payment processing requires a
 * server-side backend (e.g., Vercel serverless functions). The static GitHub
 * Pages site cannot process payments directly.
 */

export type PaymentProvider = 'klarna' | 'stripe';

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'cancelled'
  | 'failed'
  | 'refunded';

export interface PaymentSession {
  provider: PaymentProvider;
  sessionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  expiresAt?: string;
  redirectUrl?: string;
}

/** Klarna API configuration – TODO: populate when backend is ready */
export interface KlarnaConfig {
  /** Klarna API username / UID */
  apiUsername: string;
  /** Klarna API password */
  apiPassword: string;
  /** Klarna merchant ID */
  merchantId: string;
  /** Klarna API base URL (playground vs. production) */
  apiUrl: string;
  /** Merchant confirmation URL after successful payment */
  confirmationUrl: string;
  /** Merchant push URL for order confirmation callbacks */
  pushUrl: string;
}

/** Stripe API configuration – TODO: populate when backend is ready */
export interface StripeConfig {
  /** Stripe publishable key (safe for client-side) */
  publishableKey: string;
  /** Stripe secret key (server-side only – never expose to browser) */
  secretKey: string;
  /** Optional Stripe webhook secret for validating event payloads */
  webhookSecret?: string;
  /** Currency code (e.g. 'sek') */
  currency: string;
}

export interface CheckoutItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface CheckoutRequest {
  provider: PaymentProvider;
  items: CheckoutItem[];
  totalAmount: number;
  currency: string;
  customerEmail?: string;
  locale: string;
}

export interface CheckoutResponse {
  success: boolean;
  provider: PaymentProvider;
  sessionId?: string;
  redirectUrl?: string;
  error?: string;
}

export interface PaymentResult {
  success: boolean;
  provider: PaymentProvider;
  sessionId: string;
  status: PaymentStatus;
  error?: string;
}
