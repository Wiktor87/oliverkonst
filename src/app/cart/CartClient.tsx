'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { useCart } from '@/components/CartContext';
import { siteConfig, publicUrl } from '@/lib/config';

export default function CartClient() {
  const { t, lang } = useLanguage();
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  const handleCheckout = () => {
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
        {items.map((item) => (
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
        ))}
      </div>

      <div className="cart-summary">
        <div className="cart-total-row">
          <span className="cart-total-label">{t.cart.total}</span>
          <span className="cart-total-amount">{totalPrice.toLocaleString('sv-SE')} SEK</span>
        </div>

        <div className="cart-contact-note">
          <span className="cart-contact-note-title">{t.cart.checkout}</span>
          {t.cart.contactMessage}
        </div>

        <div className="payment-soon">
          <p className="payment-soon-label">
            {lang === 'sv' ? 'Betalning kommer snart' : 'Payment coming soon'}
          </p>
          <div className="payment-options">
            <button disabled className="payment-option-btn">
              <span className="payment-klarna">Klarna</span>
              <span className="payment-soon-note">
                {lang === 'sv' ? '(kommer snart)' : '(coming soon)'}
              </span>
            </button>
            <button disabled className="payment-option-btn">
              <span className="payment-stripe">Stripe</span>
              <span className="payment-soon-note">
                {lang === 'sv' ? '(kommer snart)' : '(coming soon)'}
              </span>
            </button>
          </div>
        </div>

        <div className="cart-actions">
          <button onClick={handleCheckout} className="btn-primary">{t.cart.checkout}</button>
          <Link href="/shop" className="btn-secondary">{t.cart.continueShopping}</Link>
        </div>
      </div>
    </div>
  );
}
