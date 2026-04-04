'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Product } from '@/types';
import { useLanguage } from '@/components/LanguageContext';
import ProductCard from '@/components/ProductCard';
import CuratorsNote from '@/components/CuratorsNote';
import { SiteContent } from '@/types';
import { siteConfig, publicUrl } from '@/lib/config';

export default function HomePage() {
  const { lang, t } = useLanguage();
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`${siteConfig.basePath}/data/products.json`).then((r) => r.json()),
      fetch(`${siteConfig.basePath}/data/site-content.json`).then((r) => r.json()),
    ])
      .then(([products, siteContent]: [Product[], SiteContent]) => {
        const selectedIds = siteContent.selectedProducts ?? [];
        if (selectedIds.length > 0) {
          const ordered = selectedIds
            .map((id) => products.find((p) => p.id === id))
            .filter((p): p is Product => !!p);
          setFeatured(ordered.slice(0, 8));
        } else {
          setFeatured(products.slice(0, 8));
        }
      })
      .catch(() => {});
  }, []);

  const firstRow = featured.slice(0, 4);
  const secondRow = featured.slice(4, 8);

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

        <div className="hero-content">
          <h1 className="hero-title">{t.home.hero.title}</h1>
          <p className="hero-subtitle">{t.home.hero.subtitle}</p>
          <Link href="/shop" className="btn-primary">{t.home.hero.cta}</Link>
        </div>
      </section>

      {/* Featured works — first row */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">{t.home.featured.title}</h2>
          <p className="section-subtitle">{t.home.featured.subtitle}</p>
        </div>

        {firstRow.length > 0 ? (
          <div className="product-grid">
            {firstRow.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="product-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        )}
      </section>

      {/* Artist intro */}
      <section className="about-intro-section">
        <div className="about-intro-inner">
          <div className="about-intro-image-col">
            <Image
              src={publicUrl('/img/profile-large.webp')}
              alt="Oliver"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="about-intro-text-col">
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

      {/* Featured works — second row */}
      <section className="section">
        {secondRow.length > 0 ? (
          <div className="product-grid">
            {secondRow.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="product-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        )}

        <div className="featured-cta">
          <Link href="/shop" className="btn-secondary">{t.home.hero.cta}</Link>
        </div>
      </section>
    </div>
  );
}
