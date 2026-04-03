'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useLanguage } from './LanguageContext';
import { useCart } from './CartContext';
import { publicUrl } from '@/lib/config';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { lang, t } = useLanguage();
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      quantity: 1,
      price: product.price,
      title: product.title,
      imageUrl: product.imageUrl,
      productType: product.productType,
    });
  };

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

  const imageSrc = product.imageUrl.startsWith('http') ? product.imageUrl : publicUrl(product.imageUrl);

  return (
    <Link href={`/shop/${product.id}`} className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-stone-100">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-50">
        <Image
          src={imageSrc}
          alt={product.title[lang]}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized
        />
        <span className={`absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded-full ${statusColors[product.status]}`}>
          {statusLabel[product.status]}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-serif text-lg text-stone-800 mb-1 truncate">{product.title[lang]}</h3>
        <p className="text-sm text-stone-500 mb-2">{product.dimensions}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-semibold text-amber-800">
            {product.price.toLocaleString('sv-SE')} {t.common.currency}
          </span>
          {product.status === 'available' && (
            <button
              onClick={handleAddToCart}
              className="text-sm bg-amber-700 hover:bg-amber-800 text-white px-3 py-1.5 rounded transition-colors"
            >
              {t.shop.addToCart}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
