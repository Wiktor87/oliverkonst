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
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-stone-100 aspect-square rounded-lg animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-stone-100 rounded animate-pulse" />
            <div className="h-4 bg-stone-100 rounded w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    sold: 'bg-red-100 text-red-800',
    reserved: 'bg-amber-100 text-amber-800',
  };

  const statusLabel = {
    available: t.product.available,
    sold: t.product.sold,
    reserved: t.product.reserved,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link href="/shop" className="inline-flex items-center text-amber-700 hover:text-amber-900 mb-8 text-sm font-medium">
        ← {t.product.backToShop}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        <div className="relative aspect-square rounded-lg overflow-hidden shadow-md bg-stone-50">
          <Image
            src={product.imageUrl.startsWith('http') ? product.imageUrl : publicUrl(product.imageUrl)}
            alt={product.title[lang]}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>

        <div className="flex flex-col justify-center">
          <span className={`inline-block self-start text-xs font-medium px-2 py-1 rounded-full mb-4 ${statusColors[product.status]}`}>
            {statusLabel[product.status]}
          </span>

          <h1 className="font-serif text-4xl text-stone-900 mb-4">{product.title[lang]}</h1>
          <p className="text-stone-600 leading-relaxed mb-6">{product.description[lang]}</p>

          <dl className="space-y-3 mb-8">
            <div className="flex">
              <dt className="w-32 text-sm font-medium text-stone-500">{t.product.dimensions}</dt>
              <dd className="text-sm text-stone-700">{product.dimensions}</dd>
            </div>
            <div className="flex">
              <dt className="w-32 text-sm font-medium text-stone-500">{t.product.technique}</dt>
              <dd className="text-sm text-stone-700">{product.technique[lang]}</dd>
            </div>
            <div className="flex">
              <dt className="w-32 text-sm font-medium text-stone-500">{t.product.price}</dt>
              <dd className="text-lg font-semibold text-amber-800">
                {product.price.toLocaleString('sv-SE')} {t.common.currency}
              </dd>
            </div>
          </dl>

          {product.status === 'available' && (
            <button
              onClick={handleAddToCart}
              className={`btn-primary text-center transition-all ${added ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              {added ? '✓ ' + t.product.added : t.product.addToCart}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
