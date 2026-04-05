'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { useCart } from '@/components/CartContext';
import { useEffect, useRef } from 'react';

export default function CheckoutSuccessPage() {
  const { lang } = useLanguage();
  const { clearCart } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (!cleared.current) {
      cleared.current = true;
      clearCart();
    }
  }, [clearCart]);

  return (
    <div className="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" className="empty-state-icon" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#16a34a' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h1 className="empty-state-title">
        {lang === 'sv' ? 'Tack för ditt köp!' : 'Thank you for your purchase!'}
      </h1>
      <p className="empty-state-text">
        {lang === 'sv'
          ? 'Din betalning har genomförts. Du kommer att få en bekräftelse via e-post från Stripe. Vi kontaktar dig med leveransinformation.'
          : 'Your payment has been processed. You will receive a confirmation email from Stripe. We will contact you with delivery information.'}
      </p>
      <Link href="/shop" className="btn-primary">
        {lang === 'sv' ? 'Tillbaka till konsten' : 'Back to the shop'}
      </Link>
    </div>
  );
}
