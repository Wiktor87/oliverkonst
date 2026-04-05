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
 * Build a Stripe Payment Link URL with optional pre-filled email.
 */
export function buildPaymentLinkUrl(
  baseUrl: string,
  options?: { prefilled_email?: string },
): string {
  if (!baseUrl) return '';
  const url = new URL(baseUrl);
  if (options?.prefilled_email) {
    url.searchParams.set('prefilled_email', options.prefilled_email);
  }
  return url.toString();
}
