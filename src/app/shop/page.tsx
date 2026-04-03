'use client';

import { useEffect, useState } from 'react';
import { Product, Category } from '@/types';
import { useLanguage } from '@/components/LanguageContext';
import ProductCard from '@/components/ProductCard';

export default function ShopPage() {
  const { lang, t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch('/api/products'), fetch('/api/categories')])
      .then(async ([pr, cr]) => {
        const p = await pr.json();
        const c = await cr.json();
        setProducts(p);
        setCategories(c);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="font-serif text-4xl text-stone-800 mb-3">{t.shop.title}</h1>
        <p className="text-stone-500">{t.shop.subtitle}</p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-amber-700 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-amber-100'
          }`}
        >
          {t.shop.filter.all}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-amber-700 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-amber-100'
            }`}
          >
            {cat.name[lang]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-stone-100 rounded-lg aspect-[4/3] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-stone-500 py-16">{t.shop.noProducts}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
