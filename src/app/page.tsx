'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Product } from '@/types';
import { useLanguage } from '@/components/LanguageContext';
import ProductCard from '@/components/ProductCard';
import CuratorsNote from '@/components/CuratorsNote';
import { siteConfig, publicUrl } from '@/lib/config';

export default function HomePage() {
  const { lang, t } = useLanguage();
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    fetch(`${siteConfig.basePath}/data/products.json`)
      .then((r) => r.json())
      .then((data: Product[]) => setFeatured(data.slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-bg-image">
          <Image
            src={publicUrl('/images/oliver-banner.webp')}
            alt="Oliver's Konst banner"
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>
        <div className="hero-overlay-light" />
        <div className="hero-overlay-sides" />
        <div className="hero-overlay-bottom" />

        <div className="hero-content">
          <h1 className="hero-title">{t.home.hero.title}</h1>
          <p className="hero-subtitle">{t.home.hero.subtitle}</p>
          <Link href="/shop" className="btn-primary">{t.home.hero.cta}</Link>
        </div>
      </section>

      {/* Featured works */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">{t.home.featured.title}</h2>
          <p className="section-subtitle">{t.home.featured.subtitle}</p>
        </div>

        {featured.length > 0 ? (
          <div className="product-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="product-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        )}

        <div className="featured-cta">
          <Link href="/shop" className="btn-secondary">{t.home.hero.cta}</Link>
        </div>
      </section>

      {/* Artist intro */}
      <section className="about-intro-section">
        <div className="about-intro-inner">
          <div className="about-portrait-wrap">
            <div className="about-portrait">
              <Image
                src={publicUrl('/images/oliver-profil.webp')}
                alt="Oliver"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
          <div>
            <p className="about-intro-eyebrow">
              {lang === 'sv' ? 'Om konstnären' : 'About the artist'}
            </p>
            <h2 className="about-intro-title">{t.home.intro.title}</h2>
            <p className="about-intro-text">{t.home.intro.text}</p>

            <CuratorsNote
              text={
                lang === 'sv'
                  ? '"Varje penselstrag är ett samtal mellan känsla och form – ett försök att fånga det flyktiga ljuset och bevara det för evigt."'
                  : '"Every brushstroke is a conversation between feeling and form – an attempt to capture fleeting light and preserve it forever."'
              }
              attribution="Oliver"
              label={lang === 'sv' ? 'Konstnärens röst' : "Artist's Voice"}
            />

            <Link href="/about" className="btn-tertiary">
              {t.home.intro.readMore} →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
