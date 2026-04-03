'use client';

import Link from 'next/link';
import { useLanguage } from './LanguageContext';

export default function Footer() {
  const { t, lang } = useLanguage();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-grid">
          <div>
            <span className="footer-brand-name">Oliver&apos;s Konst</span>
            <p className="footer-tagline">
              {lang === 'en'
                ? 'Original paintings by Swedish artist Oliver'
                : 'Originalmålningar av den svenska konstnären Oliver'}
            </p>
          </div>
          <div>
            <p className="footer-col-heading">Navigation</p>
            <ul className="footer-links">
              <li><Link href="/" className="footer-link">{t.nav.home}</Link></li>
              <li><Link href="/shop" className="footer-link">{t.nav.shop}</Link></li>
              <li><Link href="/about" className="footer-link">{t.nav.about}</Link></li>
              <li><Link href="/contact" className="footer-link">{t.nav.contact}</Link></li>
            </ul>
          </div>
          <div>
            <p className="footer-col-heading">Kontakt / Contact</p>
            <p className="footer-contact-text">oliver@oliverskonst.se</p>
            <p className="footer-contact-text">Göteborg, Sverige</p>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} Oliver&apos;s Konst. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
