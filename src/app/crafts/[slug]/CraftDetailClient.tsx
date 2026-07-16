'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Craft, Category } from '@/types';
import { useLanguage } from '@/components/LanguageContext';
import { siteConfig, publicUrl } from '@/lib/config';

export default function CraftDetailClient() {
  const params = useParams();
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [craft, setCraft] = useState<Craft | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!params.slug) return;
    Promise.all([
      fetch(`${siteConfig.basePath}/data/crafts.json`).then((r) => r.json() as Promise<Craft[]>),
      fetch(`${siteConfig.basePath}/data/craft-categories.json`).then((r) => r.json() as Promise<Category[]>),
    ])
      .then(([crafts, cats]) => {
        const found = crafts.find((c) => c.id === params.slug);
        if (!found) { router.push('/crafts'); return; }
        setCraft(found);
        setCategories(cats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.slug, router]);

  const imageCount = craft?.images?.length || 1;

  const handleLightboxKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setLightboxOpen(false);
    if (e.key === 'ArrowLeft') setActiveIndex((prev) => (prev - 1 + imageCount) % imageCount);
    if (e.key === 'ArrowRight') setActiveIndex((prev) => (prev + 1) % imageCount);
  }, [imageCount]);

  useEffect(() => {
    if (!lightboxOpen) return;
    document.addEventListener('keydown', handleLightboxKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleLightboxKey);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, handleLightboxKey]);

  if (loading) {
    return (
      <div className="product-detail-layout">
        <div className="product-detail-grid">
          <div className="skeleton skeleton-square" />
          <div>
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (!craft) return null;

  const images: string[] =
    craft.images && craft.images.length > 0 ? craft.images : [craft.imageUrl];

  const resolveImg = (url: string) => (url.startsWith('http') ? url : publicUrl(url));

  const categoryName = categories.find((c) => c.id === craft.category)?.name[lang];

  const craftJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: craft.title[lang],
    description: craft.description[lang],
    image: images.map((img) => `https://www.oliverskifs.se${img}`),
    url: `https://www.oliverskifs.se/crafts/${craft.id}/`,
    creator: {
      '@type': 'Person',
      name: 'Oliver Skifs',
      url: 'https://www.oliverskifs.se',
    },
    material: craft.materials[lang],
    ...(craft.year ? { dateCreated: craft.year } : {}),
    ...(categoryName ? { genre: categoryName } : {}),
  };

  return (
    <div className="product-detail-layout">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(craftJsonLd) }}
      />
      <Link href="/crafts" className="back-link">
        ← {t.crafts.backToCrafts}
      </Link>

      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <button className="lightbox-close" onClick={() => setLightboxOpen(false)} aria-label="Stäng">✕</button>
          {images.length > 1 && (
            <>
              <button
                className="lightbox-nav lightbox-prev"
                onClick={(e) => { e.stopPropagation(); setActiveIndex((activeIndex - 1 + images.length) % images.length); }}
                aria-label="Föregående"
              >‹</button>
              <button
                className="lightbox-nav lightbox-next"
                onClick={(e) => { e.stopPropagation(); setActiveIndex((activeIndex + 1) % images.length); }}
                aria-label="Nästa"
              >›</button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveImg(images[activeIndex])}
            alt={craft.title[lang]}
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="product-detail-grid">
        <div>
          <div className="product-detail-mat">
            <div className="product-detail-image-wrap" onClick={() => setLightboxOpen(true)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveImg(images[activeIndex])} alt={craft.title[lang]} />
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`relative w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
                    i === activeIndex ? 'border-amber-600' : 'border-transparent hover:border-stone-300'
                  }`}
                >
                  <Image
                    src={resolveImg(img)}
                    alt={`${craft.title[lang]} – bild ${i + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-detail-info">
          {categoryName && (
            <span className="product-detail-status craft-detail-tag">{categoryName}</span>
          )}

          <h1 className="product-detail-title">{craft.title[lang]}</h1>
          <p className="product-detail-description">{craft.description[lang]}</p>

          <dl className="product-detail-meta">
            <div className="product-detail-meta-row">
              <dt className="product-detail-meta-label">{t.crafts.materials}</dt>
              <dd className="product-detail-meta-value">{craft.materials[lang]}</dd>
            </div>
            {craft.year && (
              <div className="product-detail-meta-row">
                <dt className="product-detail-meta-label">{t.crafts.year}</dt>
                <dd className="product-detail-meta-value">{craft.year}</dd>
              </div>
            )}
            {craft.dimensions && (
              <div className="product-detail-meta-row">
                <dt className="product-detail-meta-label">{t.product.dimensions}</dt>
                <dd className="product-detail-meta-value">{craft.dimensions}</dd>
              </div>
            )}
            {craft.madeFor && (
              <div className="product-detail-meta-row">
                <dt className="product-detail-meta-label">{t.crafts.madeFor}</dt>
                <dd className="product-detail-meta-value">{craft.madeFor}</dd>
              </div>
            )}
          </dl>

          <div className="craft-commission-box">
            <p className="craft-commission-text">{t.crafts.commissionText}</p>
            <Link href="/contact" className="btn-primary">
              {t.crafts.commissionCta}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
