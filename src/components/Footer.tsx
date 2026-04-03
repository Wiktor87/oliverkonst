'use client';

import Link from 'next/link';
import { useLanguage } from './LanguageContext';

export default function Footer() {
  const { t, lang } = useLanguage();

  return (
    <footer className="bg-stone-50 border-t border-amber-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-lg text-amber-800 mb-3">Oliver&apos;s Konst</h3>
            <p className="text-sm text-stone-500">
              {lang === 'en'
                ? 'Original paintings by Swedish artist Oliver'
                : 'Originalmålningar av den svenska konstnären Oliver'}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-stone-700 mb-3 text-sm uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-stone-500 hover:text-amber-700">{t.nav.home}</Link></li>
              <li><Link href="/shop" className="text-sm text-stone-500 hover:text-amber-700">{t.nav.shop}</Link></li>
              <li><Link href="/about" className="text-sm text-stone-500 hover:text-amber-700">{t.nav.about}</Link></li>
              <li><Link href="/contact" className="text-sm text-stone-500 hover:text-amber-700">{t.nav.contact}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-stone-700 mb-3 text-sm uppercase tracking-wider">Kontakt / Contact</h4>
            <p className="text-sm text-stone-500">oliver@oliverskonst.se</p>
            <p className="text-sm text-stone-500">Göteborg, Sverige</p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-amber-100 text-center text-sm text-stone-400">
          © {new Date().getFullYear()} Oliver&apos;s Konst. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
