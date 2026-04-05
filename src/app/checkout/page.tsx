'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { useCart } from '@/components/CartContext';
import { publicUrl } from '@/lib/config';
import { buildPaymentLinkUrl } from '@/lib/stripe';
import type { SiteContent } from '@/types';

type DeliveryMethod = 'shipping' | 'pickup';

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
}

const emptyForm: CustomerForm = {
  name: '', email: '', phone: '', street: '', postalCode: '', city: '',
};

export default function CheckoutPage() {
  const { lang } = useLanguage();
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [delivery, setDelivery] = useState<DeliveryMethod>('shipping');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(publicUrl('/data/site-content.json'))
      .then((r) => r.json())
      .then((data: SiteContent) => setSiteContent(data))
      .catch(() => {});
  }, []);

  const sv = lang === 'sv';

  const totalShipping = delivery === 'shipping'
    ? items.reduce((sum, i) => sum + (i.shippingCost || 0) * i.quantity, 0)
    : 0;
  const totalAmount = totalPrice + totalShipping;

  const notificationRecipients = siteContent?.notificationEmails || siteContent?.contactEmail || '';

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <h1 className="empty-state-title">{sv ? 'Varukorgen är tom' : 'Cart is empty'}</h1>
        <p className="empty-state-text">{sv ? 'Lägg till konstverk innan du går till kassan.' : 'Add artwork before proceeding to checkout.'}</p>
        <Link href="/shop" className="btn-primary">{sv ? 'Till konsten' : 'Go to shop'}</Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) return;
    setSubmitting(true);

    // Find if we have a single item with a Payment Link
    const singleItemWithLink = items.length === 1 && items[0].stripePaymentLink;

    if (singleItemWithLink) {
      // Stripe flow: pack customer & delivery info into client_reference_id
      // so it's visible in Stripe Dashboard under Betalningar
      const deliveryLabel = delivery === 'shipping' ? 'Frakt' : 'Upphämtning';
      const addressPart = delivery === 'shipping'
        ? ` | ${form.street}, ${form.postalCode} ${form.city}`
        : '';
      const refId = `${form.name} | ${form.phone} | ${deliveryLabel}${addressPart}`;

      const stripeUrl = buildPaymentLinkUrl(items[0].stripePaymentLink!, {
        prefilled_email: form.email,
        client_reference_id: refId.slice(0, 200),
      });

      // Save info for success page display
      sessionStorage.setItem('pendingOrder', JSON.stringify({
        name: form.name,
        email: form.email,
      }));

      window.location.href = stripeUrl;
    } else {
      // Non-Stripe flow: send order details via email
      const itemLines = items.map((i) =>
        `- ${i.title[lang]} x${i.quantity} = ${(i.price * i.quantity).toLocaleString('sv-SE')} SEK` +
        (delivery === 'shipping' && i.shippingCost ? ` (frakt: ${(i.shippingCost * i.quantity).toLocaleString('sv-SE')} SEK)` : '')
      ).join('\n');

      const deliveryLabel = delivery === 'shipping'
        ? (sv ? 'Frakt' : 'Shipping')
        : (sv ? 'Upphämtning' : 'Pickup');

      const addressBlock = delivery === 'shipping'
        ? `\n${sv ? 'Adress' : 'Address'}:\n${form.street}\n${form.postalCode} ${form.city}`
        : '';

      const orderText = [
        `${sv ? 'NY BESTÄLLNING' : 'NEW ORDER'}`,
        ``,
        `${sv ? 'Kund' : 'Customer'}: ${form.name}`,
        `${sv ? 'E-post' : 'Email'}: ${form.email}`,
        `${sv ? 'Telefon' : 'Phone'}: ${form.phone}`,
        `${sv ? 'Leverans' : 'Delivery'}: ${deliveryLabel}`,
        addressBlock,
        ``,
        `${sv ? 'Produkter' : 'Products'}:`,
        itemLines,
        ``,
        `${sv ? 'Produkter totalt' : 'Products total'}: ${totalPrice.toLocaleString('sv-SE')} SEK`,
        delivery === 'shipping' ? `${sv ? 'Frakt' : 'Shipping'}: ${totalShipping.toLocaleString('sv-SE')} SEK` : '',
        `${sv ? 'TOTALT' : 'TOTAL'}: ${totalAmount.toLocaleString('sv-SE')} SEK`,
      ].filter(Boolean).join('\n');

      const subject = encodeURIComponent(`Beställning – Oliver's Konst – ${form.name}`);
      const body = encodeURIComponent(orderText);
      const recipients = notificationRecipients || 'oliver@oliverkonst.se';
      clearCart();
      window.location.href = `mailto:${recipients}?subject=${subject}&body=${body}`;
    }
  };

  return (
    <div className="checkout-layout">
      <h1 className="checkout-title">{sv ? 'Kassa' : 'Checkout'}</h1>

      <form onSubmit={handleSubmit} className="checkout-grid">
        {/* Left: Customer form */}
        <div className="checkout-form-section">
          <h2 className="checkout-section-title">{sv ? 'Dina uppgifter' : 'Your details'}</h2>

          <div className="checkout-form-group">
            <label className="input-label">{sv ? 'Namn' : 'Name'} *</label>
            <input
              type="text"
              required
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={sv ? 'Förnamn Efternamn' : 'First Last'}
            />
          </div>

          <div className="checkout-form-group">
            <label className="input-label">{sv ? 'E-post' : 'Email'} *</label>
            <input
              type="email"
              required
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={sv ? 'din@epost.se' : 'your@email.com'}
            />
          </div>

          <div className="checkout-form-group">
            <label className="input-label">{sv ? 'Telefon' : 'Phone'} *</label>
            <input
              type="tel"
              required
              className="input-field"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+46 70 123 45 67"
            />
          </div>

          {/* Delivery method */}
          <h2 className="checkout-section-title" style={{ marginTop: '2rem' }}>
            {sv ? 'Leveranssätt' : 'Delivery method'}
          </h2>

          <div className="checkout-delivery-options">
            <label className={`checkout-delivery-option${delivery === 'pickup' ? ' active' : ''}`}>
              <input
                type="radio"
                name="delivery"
                value="pickup"
                checked={delivery === 'pickup'}
                onChange={() => setDelivery('pickup')}
              />
              <div>
                <span className="checkout-delivery-label">{sv ? 'Upphämtning' : 'Pickup'}</span>
                <span className="checkout-delivery-desc">
                  {sv ? 'Hämta i Göteborg – gratis' : 'Pick up in Gothenburg – free'}
                </span>
              </div>
              <span className="checkout-delivery-price">{sv ? 'Gratis' : 'Free'}</span>
            </label>

            <label className={`checkout-delivery-option${delivery === 'shipping' ? ' active' : ''}`}>
              <input
                type="radio"
                name="delivery"
                value="shipping"
                checked={delivery === 'shipping'}
                onChange={() => setDelivery('shipping')}
              />
              <div>
                <span className="checkout-delivery-label">{sv ? 'Frakt' : 'Shipping'}</span>
                <span className="checkout-delivery-desc">
                  {sv ? 'Leverans till din adress' : 'Delivery to your address'}
                </span>
              </div>
              <span className="checkout-delivery-price">
                {totalShipping > 0
                  ? `${totalShipping.toLocaleString('sv-SE')} SEK`
                  : (sv ? 'Gratis' : 'Free')}
              </span>
            </label>
          </div>

          {/* Address fields - only shown when shipping */}
          {delivery === 'shipping' && (
            <div className="checkout-address-fields">
              <div className="checkout-form-group">
                <label className="input-label">{sv ? 'Gatuadress' : 'Street address'} *</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  placeholder={sv ? 'Gatan 1' : '123 Street'}
                />
              </div>
              <div className="checkout-form-row">
                <div className="checkout-form-group">
                  <label className="input-label">{sv ? 'Postnummer' : 'Postal code'} *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                    placeholder="123 45"
                  />
                </div>
                <div className="checkout-form-group">
                  <label className="input-label">{sv ? 'Ort' : 'City'} *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder={sv ? 'Göteborg' : 'Gothenburg'}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Order summary */}
        <div className="checkout-summary-section">
          <h2 className="checkout-section-title">{sv ? 'Ordersammanfattning' : 'Order summary'}</h2>

          <div className="checkout-items">
            {items.map((item) => (
              <div key={item.productId} className="checkout-item">
                <div className="checkout-item-image">
                  <Image
                    src={item.imageUrl.startsWith('http') ? item.imageUrl : publicUrl(item.imageUrl)}
                    alt={item.title[lang]}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="checkout-item-details">
                  <span className="checkout-item-title">{item.title[lang]}</span>
                  <span className="checkout-item-qty">x{item.quantity}</span>
                </div>
                <div className="checkout-item-prices">
                  <span className="checkout-item-price">{(item.price * item.quantity).toLocaleString('sv-SE')} SEK</span>
                  {delivery === 'shipping' && (item.shippingCost || 0) > 0 && (
                    <span className="checkout-item-shipping">
                      + {sv ? 'frakt' : 'shipping'} {((item.shippingCost || 0) * item.quantity).toLocaleString('sv-SE')} SEK
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-totals">
            <div className="checkout-total-row">
              <span>{sv ? 'Produkter' : 'Products'}</span>
              <span>{totalPrice.toLocaleString('sv-SE')} SEK</span>
            </div>
            <div className="checkout-total-row">
              <span>{sv ? 'Frakt' : 'Shipping'}</span>
              <span>{delivery === 'pickup' ? (sv ? 'Gratis' : 'Free') : `${totalShipping.toLocaleString('sv-SE')} SEK`}</span>
            </div>
            <div className="checkout-total-row checkout-total-final">
              <span>{sv ? 'Totalt' : 'Total'}</span>
              <span>{totalAmount.toLocaleString('sv-SE')} SEK</span>
            </div>
          </div>

          {/* Terms acceptance */}
          <label className="checkout-terms-check">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              required
            />
            <span>
              {sv ? 'Jag godkänner ' : 'I accept the '}
              <Link href="/terms" target="_blank">{sv ? 'köpvillkoren' : 'terms of purchase'}</Link>
            </span>
          </label>

          {/* Submit */}
          {items.length === 1 && items[0].stripePaymentLink ? (
            <button
              type="submit"
              disabled={!acceptTerms || submitting}
              className="btn-stripe"
            >
              {submitting
                ? (sv ? 'Omdirigerar...' : 'Redirecting...')
                : (sv ? 'Betala med Stripe' : 'Pay with Stripe')}
            </button>
          ) : (
            <button
              type="submit"
              disabled={!acceptTerms || submitting}
              className="btn-primary btn-full"
            >
              {sv ? 'Slutför beställning' : 'Complete order'}
            </button>
          )}

          <p className="checkout-note">
            {items.length === 1 && items[0].stripePaymentLink
              ? (sv ? 'Du omdirigeras till Stripe för säker betalning.' : 'You will be redirected to Stripe for secure payment.')
              : (sv ? 'En orderbekräftelse skickas via e-post. Vi kontaktar dig för betalning och leverans.' : 'An order confirmation will be sent via email. We will contact you for payment and delivery.')}
          </p>

          <Link href="/cart" className="checkout-back-link">
            ← {sv ? 'Tillbaka till varukorgen' : 'Back to cart'}
          </Link>
        </div>
      </form>
    </div>
  );
}
