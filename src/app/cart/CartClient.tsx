'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { useCart } from '@/components/CartContext';
import { siteConfig, publicUrl } from '@/lib/config';
import type { Product } from '@/types';

export default function CartClient() {
  const { t, lang } = useLanguage();
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch(publicUrl('/data/products.json'))
      .then((r) => r.json())
      .then((prods: Product[]) => setProducts(prods))
      .catch(() => {});
  }, []);

  // Check which items have Stripe Payment Links
  const getPaymentLink = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product?.stripePaymentLink || '';
  };

  const itemsWithPaymentLink = items.filter((i) => getPaymentLink(i.productId));
  const allHavePaymentLinks = items.length > 0 && itemsWithPaymentLink.length === items.length;
  const someHavePaymentLinks = itemsWithPaymentLink.length > 0;

  const handleEmailCheckout = () => {
    const itemLines = items
      .map((i) => `- ${i.title[lang]} x${i.quantity} = ${(i.price * i.quantity).toLocaleString('sv-SE')} SEK`)
      .join('\n');
    const subject = encodeURIComponent("Beställningsförfrågan – Oliver's Konst");
    const body = encodeURIComponent(
      `Hej Oliver!\n\nJag är intresserad av att beställa följande:\n\n${itemLines}\n\nTotalt: ${totalPrice.toLocaleString('sv-SE')} SEK\n\nVänligen kontakta mig för att slutföra köpet.\n\nMed vänliga hälsningar`,
    );
    window.location.href = `mailto:${siteConfig.contactEmail}?subject=${subject}&body=${body}`;
  };

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" className="empty-state-icon" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h1 className="empty-state-title">{t.cart.title}</h1>
        <p className="empty-state-text">{t.cart.empty}</p>
        <Link href="/shop" className="btn-primary">{t.cart.continueShopping}</Link>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <h1 className="cart-title">{t.cart.title}</h1>

      <div className="cart-items-list">
        {items.map((item) => {
          const paymentLink = getPaymentLink(item.productId);
          return (
            <div key={item.productId} className="cart-item">
              <div className="cart-item-thumb">
                <Image
                  src={item.imageUrl.startsWith('http') ? item.imageUrl : publicUrl(item.imageUrl)}
                  alt={item.title[lang]}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="cart-item-info">
                <h3 className="cart-item-title">{item.title[lang]}</h3>
                <p className="cart-item-price">{item.price.toLocaleString('sv-SE')} SEK</p>
                {paymentLink && (
                  <a
                    href={paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-stripe-small"
                  >
                    {lang === 'sv' ? 'Betala med Stripe' : 'Pay with Stripe'}
                  </a>
                )}
              </div>
              <div className="cart-qty">
                <button className="cart-qty-btn" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>−</button>
                <span className="cart-qty-value">{item.quantity}</span>
                <button className="cart-qty-btn" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
              </div>
              <div className="cart-item-totals">
                <span className="cart-item-subtotal">{(item.price * item.quantity).toLocaleString('sv-SE')} SEK</span>
                <button className="cart-remove-btn" onClick={() => removeItem(item.productId)}>
                  {t.cart.remove}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="cart-summary">
        <div className="cart-total-row">
          <span className="cart-total-label">{t.cart.total}</span>
          <span className="cart-total-amount">{totalPrice.toLocaleString('sv-SE')} SEK</span>
        </div>

        <div className="cart-actions">
          {/* If single item with payment link, show prominent Stripe button */}
          {items.length === 1 && allHavePaymentLinks ? (
            <a
              href={getPaymentLink(items[0].productId)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-stripe"
            >
              {lang === 'sv' ? 'Betala med Stripe' : 'Pay with Stripe'}
            </a>
          ) : someHavePaymentLinks ? (
            <div className="cart-contact-note">
              <span className="cart-contact-note-title">
                {lang === 'sv' ? 'Betalning via Stripe' : 'Payment via Stripe'}
              </span>
              {lang === 'sv'
                ? 'Klicka på "Betala med Stripe" vid varje konstverk för att betala direkt. Du kan även beställa via e-post.'
                : 'Click "Pay with Stripe" next to each artwork to pay directly. You can also order via email.'}
            </div>
          ) : (
            <div className="cart-contact-note">
              <span className="cart-contact-note-title">{t.cart.checkout}</span>
              {t.cart.contactMessage}
            </div>
          )}

          <button onClick={handleEmailCheckout} className="btn-primary">
            {someHavePaymentLinks
              ? (lang === 'sv' ? 'Beställ via e-post' : 'Order via email')
              : t.cart.checkout}
          </button>
          <Link href="/shop" className="btn-secondary">{t.cart.continueShopping}</Link>
        </div>

        <div className="cart-terms-note">
          <Link href="/terms">
            {lang === 'sv' ? 'Läs våra köpvillkor' : 'Read our terms of purchase'}
          </Link>
        </div>
      </div>
    </div>
  );
}
