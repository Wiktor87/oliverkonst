'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Craft } from '@/types';
import { useLanguage } from './LanguageContext';
import { publicUrl } from '@/lib/config';

interface CraftCardProps {
  craft: Craft;
  categoryName?: string;
}

export default function CraftCard({ craft, categoryName }: CraftCardProps) {
  const { lang } = useLanguage();
  const imageSrc = craft.imageUrl.startsWith('http')
    ? craft.imageUrl
    : publicUrl(craft.imageUrl);

  return (
    <Link href={`/crafts/${craft.id}`} className="product-card">
      <div className="product-card-mat">
        <div className="product-card-image-wrap">
          <div className="product-card-image-inner">
            <Image
              src={imageSrc}
              alt={craft.title[lang]}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          {categoryName && (
            <span className="craft-card-tag">{categoryName}</span>
          )}
        </div>
      </div>
      <div className="product-card-body">
        <h3 className="product-card-title">{craft.title[lang]}</h3>
        <p className="product-card-dims">
          {[craft.materials[lang], craft.year].filter(Boolean).join(' · ')}
        </p>
      </div>
    </Link>
  );
}
