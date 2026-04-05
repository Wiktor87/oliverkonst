'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { useCart } from '@/components/CartContext';
import { useEffect, useRef, useState } from 'react';

interface OrderData {
  customer: { name: string; email: string };
  items: Array<{ title: string; quantity: number; price: number; productId: string }>;
  totalAmount: number;
  createdAt: string;
}

export default function CheckoutSuccessPage() {
  const { lang } = useLanguage();
  const { clearCart } = useCart();
  const cleared = useRef(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const sv = lang === 'sv';

  useEffect(() => {
    if (!cleared.current) {
      cleared.current = true;
      clearCart();

      // Read order data from sessionStorage
      try {
        const data = sessionStorage.getItem('pendingOrder');
        if (data) {
          setOrder(JSON.parse(data));
          sessionStorage.removeItem('pendingOrder');
        }
      } catch {
        // ignore
      }
    }
  }, [clearCart]);

  return (
    <div className="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" className="empty-state-icon" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#16a34a' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h1 className="empty-state-title">
        {sv ? 'Tack för ditt köp!' : 'Thank you for your purchase!'}
      </h1>
      <p className="empty-state-text">
        {sv
          ? 'Din betalning har genomförts. Du kommer att få en bekräftelse via e-post. Vi kontaktar dig med leveransinformation.'
          : 'Your payment has been processed. You will receive a confirmation via email. We will contact you with delivery information.'}
      </p>

      {order && (
        <div className="checkout-success-details">
          <h3>{sv ? 'Orderdetaljer' : 'Order details'}</h3>
          <p><strong>{sv ? 'Kund' : 'Customer'}:</strong> {order.customer.name}</p>
          <p><strong>{sv ? 'E-post' : 'Email'}:</strong> {order.customer.email}</p>
          <ul>
            {order.items.map((item, i) => (
              <li key={i}>{item.title} x{item.quantity} – {(item.price * item.quantity).toLocaleString('sv-SE')} SEK</li>
            ))}
          </ul>
          <p><strong>{sv ? 'Totalt' : 'Total'}:</strong> {order.totalAmount.toLocaleString('sv-SE')} SEK</p>
        </div>
      )}

      <Link href="/shop" className="btn-primary">
        {sv ? 'Tillbaka till konsten' : 'Back to the shop'}
      </Link>
    </div>
  );
}
