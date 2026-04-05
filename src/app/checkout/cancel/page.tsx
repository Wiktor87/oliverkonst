'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';

export default function CheckoutCancelPage() {
  const { lang } = useLanguage();

  return (
    <div className="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" className="empty-state-icon" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#d97706' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <h1 className="empty-state-title">
        {lang === 'sv' ? 'Betalningen avbröts' : 'Payment cancelled'}
      </h1>
      <p className="empty-state-text">
        {lang === 'sv'
          ? 'Din betalning avbröts. Inga pengar har dragits. Din varukorg finns kvar.'
          : 'Your payment was cancelled. No charges were made. Your cart is still available.'}
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/cart" className="btn-primary">
          {lang === 'sv' ? 'Tillbaka till varukorgen' : 'Back to cart'}
        </Link>
        <Link href="/shop" className="btn-secondary">
          {lang === 'sv' ? 'Fortsätt handla' : 'Continue shopping'}
        </Link>
      </div>
    </div>
  );
}
