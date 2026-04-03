'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';
import { publicUrl } from '@/lib/config';

interface SocialLinks {
  instagram: string;
  facebook: string;
}

export default function Footer() {
  const { t, lang } = useLanguage();
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({ instagram: '', facebook: '' });

  useEffect(() => {
    fetch(publicUrl('/data/site-content.json'))
      .then((res) => res.json())
      .then((data) => { if (data?.socialLinks) setSocialLinks(data.socialLinks); })
      .catch(() => {});
  }, []);

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
            {(socialLinks.instagram || socialLinks.facebook) && (
              <div className="footer-social">
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label="Instagram">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                )}
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label="Facebook">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} Oliver&apos;s Konst. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
