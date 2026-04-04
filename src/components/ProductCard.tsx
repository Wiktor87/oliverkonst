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

  const imageSrc = product.imageUrl.startsWith('http') ? product.imageUrl : publicUrl(product.imageUrl);

  return (
    <Link href={`/shop/${product.id}`} className="product-card">
      <div className="product-card-mat">
        <div className="product-card-image-wrap">
          <div className="product-card-image-inner">
            <Image
              src={imageSrc}
              alt={product.title[lang]}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <span className={`product-card-status ${statusClass[product.status]}`}>
            {statusLabel[product.status]}
          </span>
          {product.status === 'sold' && (
            <div className="product-card-sold-stamp">
              <Image
                src={publicUrl('/images/sold.webp')}
                alt={t.product.sold}
                width={55}
                height={55}
                unoptimized
              />
            </div>
          )}
        </div>
      </div>
      <div className="product-card-body">
        <h3 className="product-card-title">{product.title[lang]}</h3>
        <p className="product-card-dims">{product.dimensions}</p>
        <div className="product-card-footer">
          {product.status === 'sold' ? (
            <span className="product-card-price-sold">
              <span className="price-strikethrough">
                {product.price.toLocaleString('sv-SE')} {t.common.currency}
              </span>
              <span className="sold-label">{t.product.sold}</span>
            </span>
          ) : (
            <span className="product-card-price">
              {product.price.toLocaleString('sv-SE')} {t.common.currency}
            </span>
          )}
          {product.status === 'available' && (
            <button onClick={handleAddToCart} className="product-card-add">
              {t.shop.addToCart}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
