/**
 * Stripe Payment Link utilities.
 *
 * Since this is a static site (GitHub Pages), we use Stripe Payment Links
 * instead of Stripe Checkout Sessions. Payment Links are created in the
 * Stripe Dashboard and stored per product in the admin panel.
 *
 * No secret keys or server-side code needed.
 */

/**
 * Build a Stripe Payment Link URL with optional pre-filled customer data.
 *
 * Supported query parameters for Payment Links:
 *  - prefilled_email: pre-fills the customer email field on Stripe checkout
 *  - client_reference_id: custom reference visible in the Stripe Dashboard (max 200 chars)
 */
export function buildPaymentLinkUrl(
  baseUrl: string,
  options?: { prefilled_email?: string; client_reference_id?: string },
): string {
  if (!baseUrl) return '';
  const url = new URL(baseUrl);
  if (options?.prefilled_email) {
    url.searchParams.set('prefilled_email', options.prefilled_email);
  }
  if (options?.client_reference_id) {
    url.searchParams.set('client_reference_id', options.client_reference_id);
  }
  return url.toString();
}
