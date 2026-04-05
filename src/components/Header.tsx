'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from './CartContext';
import { useLanguage } from './LanguageContext';
import { publicUrl } from '@/lib/config';

interface SocialLinks {
  instagram: string;
  facebook: string;
}

export default function Header() {
  const { totalItems } = useCart();
  const { lang, setLang, t } = useLanguage();
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({ instagram: '', facebook: '' });
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch(publicUrl('/data/site-content.json'))
      .then((res) => res.json())
      .then((data) => { if (data?.socialLinks) setSocialLinks(data.socialLinks); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide header on admin pages
  const isAdmin = pathname.startsWith('/admin');
  if (isAdmin) return null;

  return (
    <>
      {/* Mobile-only top banner image — in normal flow, scrolls away */}
      <div className="mobile-top-banner">
        <img
          src={publicUrl('/img/IMG_0417.jpeg')}
          alt=""
          aria-hidden="true"
        />
      </div>

      {/* Fixed overlay logo */}
      <Link href="/" className={`site-logo-fixed${scrolled ? ' site-logo-scrolled' : ' banner-visible'}`}>
        <Image
          src={publicUrl('/img/20676002-2972-4876-A8C6-6FAA7FA31B3E.png')}
          alt="Oliver's Konst"
          width={0}
          height={0}
          priority
          unoptimized
          className="site-logo-img"
        />
      </Link>

      {/* Sticky nav bar — no background */}
      <header className="site-header">
        <div className="site-header-inner">
          <nav className="site-nav">
            <Link href="/" prefetch={false} className="nav-link">{t.nav.home}</Link>
            <Link href="/shop" prefetch={false} className="nav-link">{t.nav.shop}</Link>
            <Link href="/exhibitions" prefetch={false} className="nav-link">{t.nav.exhibitions}</Link>
            <Link href="/classes" prefetch={false} className="nav-link">{t.nav.classes}</Link>
            <Link href="/about" prefetch={false} className="nav-link">{t.nav.about}</Link>
            <Link href="/contact" prefetch={false} className="nav-link">{t.nav.contact}</Link>
          </nav>

          <div className="header-actions">
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

        {/* Mobile hamburger button */}
        <button
          className={`hamburger-btn${scrolled ? '' : ' banner-visible'}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={`hamburger-icon${menuOpen ? ' open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        {/* Mobile slide-out menu */}
        {menuOpen && <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)} />}
        <nav className={`mobile-menu${menuOpen ? ' open' : ''}`}>
          <Link href="/" prefetch={false} className="mobile-menu-link" onClick={() => setMenuOpen(false)}>{t.nav.home}</Link>
          <Link href="/shop" prefetch={false} className="mobile-menu-link" onClick={() => setMenuOpen(false)}>{t.nav.shop}</Link>
          <Link href="/exhibitions" prefetch={false} className="mobile-menu-link" onClick={() => setMenuOpen(false)}>{t.nav.exhibitions}</Link>
          <Link href="/classes" prefetch={false} className="mobile-menu-link" onClick={() => setMenuOpen(false)}>{t.nav.classes}</Link>
          <Link href="/about" prefetch={false} className="mobile-menu-link" onClick={() => setMenuOpen(false)}>{t.nav.about}</Link>
          <Link href="/contact" prefetch={false} className="mobile-menu-link" onClick={() => setMenuOpen(false)}>{t.nav.contact}</Link>
        </nav>
      </header>
    </>
  );
}
