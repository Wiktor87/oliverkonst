'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { useLanguage } from '@/components/LanguageContext';
import { useCart } from '@/components/CartContext';
import { siteConfig, publicUrl } from '@/lib/config';

export default function ProductDetailClient() {
  const params = useParams();
  const router = useRouter();
  const { lang, t } = useLanguage();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    fetch(`${siteConfig.basePath}/data/products.json`)
      .then(async (r) => {
        const products: Product[] = await r.json();
        const found = products.find((p) => p.id === params.id);
        if (!found) { router.push('/shop'); return; }
        setProduct(found);
      })
      .finally(() => setLoading(false));
  }, [params.id, router]);

  const handleLightboxKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setLightboxOpen(false);
    if (e.key === 'ArrowLeft') setActiveIndex((prev) => (prev - 1 + (product?.images?.length || 1)) % (product?.images?.length || 1));
    if (e.key === 'ArrowRight') setActiveIndex((prev) => (prev + 1) % (product?.images?.length || 1));
  }, [product]);

  useEffect(() => {
    if (!lightboxOpen) return;
    document.addEventListener('keydown', handleLightboxKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleLightboxKey);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, handleLightboxKey]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      quantity: 1,
      price: product.price,
      shippingCost: product.shippingCost || 0,
      title: product.title,
      imageUrl: product.imageUrl,
      productType: product.productType,
      stripePaymentLink: product.stripePaymentLink,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

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

  if (!product) return null;

  const images: string[] =
    product.images && product.images.length > 0
      ? product.images
      : [product.imageUrl];

  const resolveImg = (url: string) =>
    url.startsWith('http') ? url : publicUrl(url);

  const statusClass = {
    available: 'status-available',
    sold: 'status-sold',
    reserved: 'status-reserved',
  };

  const statusLabel = {
    available: t.product.available,
    sold: t.product.sold,
    reserved: t.product.reserved,
  };

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: product.title[lang],
    description: product.description[lang],
    image: images.map(resolveImg),
    artist: {
      '@type': 'Person',
      name: 'Oliver Skifs',
      url: 'https://www.oliverskifs.se',
    },
    artform: 'Painting',
    artMedium: product.technique[lang],
    width: product.dimensions,
    offers: {
      '@type': 'Offer',
      url: `https://www.oliverskifs.se/shop/${product.id}/`,
      priceCurrency: 'SEK',
      price: product.price,
      availability:
        product.status === 'available'
          ? 'https://schema.org/InStock'
          : product.status === 'sold'
            ? 'https://schema.org/SoldOut'
            : 'https://schema.org/LimitedAvailability',
    },
  };

  return (
    <div className="product-detail-layout">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Link href="/shop" className="back-link">
        ← {t.product.backToShop}
      </Link>

      {/* Lightbox modal */}
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
            alt={product.title[lang]}
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="product-detail-grid">
        {/* Image gallery */}
        <div>
          <div className="product-detail-mat">
            <div className="product-detail-image-wrap" onClick={() => setLightboxOpen(true)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImg(images[activeIndex])}
                alt={product.title[lang]}
              />
              {product.status === 'sold' && (
                <div className="product-detail-sold-stamp">
                  <Image
                    src={publicUrl('/images/sold.webp')}
                    alt={t.product.sold}
                    width={73}
                    height={73}
                    unoptimized
                  />
                </div>
              )}
            </div>
          </div>

          {/* Thumbnails — only shown when there are multiple images */}
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
                    alt={`${product.title[lang]} – bild ${i + 1}`}
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
          <span className={`product-detail-status ${statusClass[product.status]}`}>
            {statusLabel[product.status]}
          </span>

          <h1 className="product-detail-title">{product.title[lang]}</h1>
          <p className="product-detail-description">{product.description[lang]}</p>

          <dl className="product-detail-meta">
            <div className="product-detail-meta-row">
              <dt className="product-detail-meta-label">{t.product.dimensions}</dt>
              <dd className="product-detail-meta-value">{product.dimensions}</dd>
            </div>
            <div className="product-detail-meta-row">
              <dt className="product-detail-meta-label">{t.product.technique}</dt>
              <dd className="product-detail-meta-value">{product.technique[lang]}</dd>
            </div>
          </dl>

          {product.status === 'sold' ? (
            <p className="product-detail-price-sold">
              <span className="price-strikethrough">
                {product.price.toLocaleString('sv-SE')} {t.common.currency}
              </span>
              <span className="sold-label">{t.product.sold}</span>
            </p>
          ) : (
            <p className="product-detail-price">
              {product.price.toLocaleString('sv-SE')} {t.common.currency}
            </p>
          )}

          {product.status === 'available' && (
            <button
              onClick={handleAddToCart}
              className={`btn-primary${added ? ' btn-success' : ''}`}
            >
              {added ? '✓ ' + t.product.added : t.product.addToCart}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

