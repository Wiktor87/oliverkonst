'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { useCart } from '@/components/CartContext';
import { publicUrl } from '@/lib/config';

export default function CartClient() {
  const { t, lang } = useLanguage();
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  const sv = lang === 'sv';

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

  const totalShipping = items.reduce((sum, i) => sum + (i.shippingCost || 0) * i.quantity, 0);

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
              {(item.shippingCost || 0) > 0 && (
                <p className="cart-item-shipping">
                  {sv ? 'Frakt' : 'Shipping'}: {item.shippingCost!.toLocaleString('sv-SE')} SEK
                </p>
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
        ))}
      </div>

      <div className="cart-summary">
        <div className="cart-total-row">
          <span className="cart-total-label">{sv ? 'Produkter' : 'Products'}</span>
          <span className="cart-total-amount">{totalPrice.toLocaleString('sv-SE')} SEK</span>
        </div>
        {totalShipping > 0 && (
          <div className="cart-total-row">
            <span className="cart-total-label">{sv ? 'Frakt (vid leverans)' : 'Shipping (if delivered)'}</span>
            <span className="cart-total-amount">{totalShipping.toLocaleString('sv-SE')} SEK</span>
          </div>
        )}

        <div className="cart-actions">
          <Link href="/checkout" className="btn-primary btn-full">
            {t.cart.checkout}
          </Link>
          <Link href="/shop" className="btn-secondary">{t.cart.continueShopping}</Link>
        </div>

        <div className="cart-terms-note">
          <Link href="/terms">
            {sv ? 'Läs våra köpvillkor' : 'Read our terms of purchase'}
          </Link>
        </div>
      </div>
    </div>
  );
}
