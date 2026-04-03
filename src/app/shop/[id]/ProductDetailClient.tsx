'use client';

import { useEffect, useState } from 'react';
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

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      quantity: 1,
      price: product.price,
      title: product.title,
      imageUrl: product.imageUrl,
      productType: product.productType,
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

  return (
    <div className="product-detail-layout">
      <Link href="/shop" className="back-link">
        ← {t.product.backToShop}
      </Link>

      <div className="product-detail-grid">
        {/* Image gallery */}
        <div>
          <div className="product-detail-mat">
            <div className="product-detail-image-wrap">
              <Image
                src={resolveImg(images[activeIndex])}
                alt={product.title[lang]}
                fill
                className="object-cover"
                priority
                unoptimized
              />
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

          <p className="product-detail-price">
            {product.price.toLocaleString('sv-SE')} {t.common.currency}
          </p>

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

