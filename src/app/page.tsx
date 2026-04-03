'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Product } from '@/types';
import { useLanguage } from '@/components/LanguageContext';
import ProductCard from '@/components/ProductCard';
import { siteConfig } from '@/lib/config';

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
      <section className="relative bg-gradient-to-br from-amber-50 to-stone-100 py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl text-amber-900 mb-6">
            {t.home.hero.title}
          </h1>
          <p className="text-xl text-stone-600 mb-8 leading-relaxed">
            {t.home.hero.subtitle}
          </p>
          <Link
            href="/shop"
            className="inline-block bg-amber-700 hover:bg-amber-800 text-white px-8 py-4 rounded text-lg font-medium transition-colors"
          >
            {t.home.hero.cta}
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Featured works */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl text-stone-800 mb-3">{t.home.featured.title}</h2>
          <p className="text-stone-500">{t.home.featured.subtitle}</p>
        </div>
        {featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-stone-100 rounded-lg aspect-[4/3] animate-pulse" />
            ))}
          </div>
        )}
        <div className="text-center mt-10">
          <Link href="/shop" className="inline-block border border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-white px-8 py-3 rounded transition-colors font-medium">
            {t.home.hero.cta}
          </Link>
        </div>
      </section>

      {/* Intro about */}
      <section className="bg-amber-50 py-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="md:w-1/3">
            <div className="w-48 h-48 mx-auto rounded-full bg-amber-200 flex items-center justify-center overflow-hidden">
              <Image
                src="/images/placeholder.svg"
                alt="Oliver"
                width={192}
                height={192}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
          <div className="md:w-2/3 text-center md:text-left">
            <h2 className="font-serif text-3xl text-stone-800 mb-4">{t.home.intro.title}</h2>
            <p className="text-stone-600 leading-relaxed mb-6">{t.home.intro.text}</p>
            <Link href="/about" className="inline-block text-amber-700 hover:text-amber-900 font-medium underline underline-offset-4">
              {t.home.intro.readMore} →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
