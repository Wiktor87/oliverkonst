/**
 * Payment stub functions for future Klarna and Stripe integration.
 *
 * TODO: These functions are placeholders only.
 *
 * To enable real payment processing you will need to:
 * 1. Add a server-side backend (e.g., Vercel serverless functions or a Node.js API)
 * 2. Store Klarna/Stripe API credentials as environment variables on the server
 * 3. Replace these stubs with actual API calls to the respective SDKs:
 *    - Klarna: https://docs.klarna.com/klarna-payments/
 *    - Stripe: https://stripe.com/docs/payments/payment-intents
 *
 * The static GitHub Pages site cannot call payment provider APIs directly due to:
 * - CORS restrictions
 * - Need to keep secret API keys server-side
 * - Requirement for webhook endpoints to receive payment confirmations
 */

import type {
  CheckoutRequest,
  CheckoutResponse,
  PaymentResult,
  PaymentSession,
} from '@/types/payment';

/**
 * Initialize a Klarna Payments session.
 * TODO: Implement via server-side API route using the Klarna Payments SDK.
 */
export async function initializeKlarnaCheckout(
  _request: CheckoutRequest,
): Promise<CheckoutResponse> {
  // TODO: Call your server-side API (e.g., POST /api/checkout/klarna)
  // which will use the Klarna Payments API to create a session.
  return {
    success: false,
    provider: 'klarna',
    error: 'Klarna checkout is not yet implemented. A server backend is required.',
  };
}

/**
 * Initialize a Stripe Checkout or Payment Intent session.
 * TODO: Implement via server-side API route using the Stripe Node.js SDK.
 */
export async function initializeStripeCheckout(
  _request: CheckoutRequest,
): Promise<CheckoutResponse> {
  // TODO: Call your server-side API (e.g., POST /api/checkout/stripe)
  // which will use Stripe's createPaymentIntent or createCheckoutSession.
  return {
    success: false,
    provider: 'stripe',
    error: 'Stripe checkout is not yet implemented. A server backend is required.',
  };
}

/**
 * Create a payment session for the given provider.
 * TODO: Route to the appropriate provider implementation.
 */
export async function createPaymentSession(
  request: CheckoutRequest,
): Promise<CheckoutResponse> {
  // TODO: Replace stubs with real implementations once a backend is available.
  if (request.provider === 'klarna') {
    return initializeKlarnaCheckout(request);
  }
  return initializeStripeCheckout(request);
}

/**
 * Handle a payment callback / redirect from a payment provider.
 * TODO: Validate the session status server-side and update the order.
 */
export async function handlePaymentCallback(
  _provider: CheckoutRequest['provider'],
  _sessionId: string,
): Promise<PaymentResult> {
  // TODO: Call your server-side API to verify the payment status
  // (e.g., GET /api/checkout/result?provider=klarna&session_id=...)
  return {
    success: false,
    provider: 'klarna',
    sessionId: '',
    status: 'pending',
    error: 'Payment callback handling is not yet implemented. A server backend is required.',
  };
}

/**
 * Retrieve an existing payment session by ID.
 * TODO: Implement server-side lookup via the relevant provider API.
 */
export async function getPaymentSession(
  _provider: CheckoutRequest['provider'],
  _sessionId: string,
): Promise<PaymentSession | null> {
  // TODO: Implement once a backend is available.
  return null;
}
