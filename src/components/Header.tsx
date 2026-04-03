'use client';

import Link from 'next/link';
import { useCart } from './CartContext';
import { useLanguage } from './LanguageContext';

export default function Header() {
  const { totalItems } = useCart();
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="bg-white border-b border-amber-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-serif text-2xl text-amber-800 hover:text-amber-600 transition-colors">
          Oliver&apos;s Konst
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-stone-600 hover:text-amber-700 transition-colors text-sm font-medium">
            {t.nav.home}
          </Link>
          <Link href="/shop" className="text-stone-600 hover:text-amber-700 transition-colors text-sm font-medium">
            {t.nav.shop}
          </Link>
          <Link href="/about" className="text-stone-600 hover:text-amber-700 transition-colors text-sm font-medium">
            {t.nav.about}
          </Link>
          <Link href="/contact" className="text-stone-600 hover:text-amber-700 transition-colors text-sm font-medium">
            {t.nav.contact}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLang(lang === 'sv' ? 'en' : 'sv')}
            className="text-xs font-semibold text-stone-500 hover:text-amber-700 transition-colors border border-stone-200 rounded px-2 py-1"
          >
            {lang === 'sv' ? 'EN' : 'SV'}
          </button>

          <Link href="/cart" className="relative text-stone-600 hover:text-amber-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-t border-amber-50 px-4 py-2 flex justify-center gap-6">
        <Link href="/" className="text-stone-600 hover:text-amber-700 text-sm">{t.nav.home}</Link>
        <Link href="/shop" className="text-stone-600 hover:text-amber-700 text-sm">{t.nav.shop}</Link>
        <Link href="/about" className="text-stone-600 hover:text-amber-700 text-sm">{t.nav.about}</Link>
        <Link href="/contact" className="text-stone-600 hover:text-amber-700 text-sm">{t.nav.contact}</Link>
      </div>
    </header>
  );
}
