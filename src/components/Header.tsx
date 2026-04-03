'use client';

import Link from 'next/link';
import { useCart } from './CartContext';
import { useLanguage } from './LanguageContext';

export default function Header() {
  const { totalItems } = useCart();
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-logo">
          Oliver&apos;s Konst
        </Link>

        <nav className="site-nav">
          <Link href="/" prefetch={false} className="nav-link">{t.nav.home}</Link>
          <Link href="/shop" prefetch={false} className="nav-link">{t.nav.shop}</Link>
          <Link href="/exhibitions" prefetch={false} className="nav-link">{t.nav.exhibitions}</Link>
          <Link href="/about" prefetch={false} className="nav-link">{t.nav.about}</Link>
          <Link href="/contact" prefetch={false} className="nav-link">{t.nav.contact}</Link>
        </nav>

        <div className="header-actions">
          <button
            onClick={() => setLang(lang === 'sv' ? 'en' : 'sv')}
            className="lang-toggle"
          >
            {lang === 'sv' ? 'EN' : 'SV'}
          </button>

          <Link href="/cart" prefetch={false} className="cart-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </Link>
        </div>
      </div>

      <div className="mobile-nav">
        <Link href="/" prefetch={false} className="mobile-nav-link">{t.nav.home}</Link>
        <Link href="/shop" prefetch={false} className="mobile-nav-link">{t.nav.shop}</Link>
        <Link href="/exhibitions" prefetch={false} className="mobile-nav-link">{t.nav.exhibitions}</Link>
        <Link href="/about" prefetch={false} className="mobile-nav-link">{t.nav.about}</Link>
        <Link href="/contact" prefetch={false} className="mobile-nav-link">{t.nav.contact}</Link>
      </div>
    </header>
  );
}
