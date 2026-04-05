'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { useCart } from '@/components/CartContext';
import { useEffect, useRef, useState } from 'react';

export default function CheckoutSuccessPage() {
  const { lang } = useLanguage();
  const { clearCart } = useCart();
  const processed = useRef(false);
  const [customerName, setCustomerName] = useState('');
  const sv = lang === 'sv';

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    clearCart();

    try {
      const data = sessionStorage.getItem('pendingOrder');
      if (data) {
        const parsed = JSON.parse(data);
        setCustomerName(parsed.name || '');
        sessionStorage.removeItem('pendingOrder');
      }
    } catch {
      // ignore
    }
  }, [clearCart]);

  return (
    <div className="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" className="empty-state-icon" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#16a34a' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h1 className="empty-state-title">
        {sv ? 'Tack för ditt köp!' : 'Thank you for your purchase!'}
        {customerName ? ` ${customerName}` : ''}
      </h1>
      <p className="empty-state-text">
        {sv
          ? 'Din betalning har genomförts. Vi kontaktar dig med leveransinformation.'
          : 'Your payment has been processed. We will contact you with delivery information.'}
      </p>

      <Link href="/shop" className="btn-primary">
        {sv ? 'Tillbaka till konsten' : 'Back to the shop'}
      </Link>
    </div>
  );
}
