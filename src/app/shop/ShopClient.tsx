'use client';

import { useEffect, useState } from 'react';
import { Product, Category } from '@/types';
import { useLanguage } from '@/components/LanguageContext';
import ProductCard from '@/components/ProductCard';
import { siteConfig } from '@/lib/config';

export default function ShopClient() {
  const { lang, t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${siteConfig.basePath}/data/products.json`),
      fetch(`${siteConfig.basePath}/data/categories.json`),
    ])
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

  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === 'asc') return a.price - b.price;
    if (sortOrder === 'desc') return b.price - a.price;
    return 0;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t.shop.title}</h1>
        <p className="page-subtitle">{t.shop.subtitle}</p>
      </div>

      <div className="section">
        <div className="filter-bar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`filter-btn${selectedCategory === 'all' ? ' active' : ''}`}
          >
            {t.shop.filter.all}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`filter-btn${selectedCategory === cat.id ? ' active' : ''}`}
            >
              {cat.name[lang]}
            </button>
          ))}
        </div>

        <div className="filter-bar">
          <span className="sort-label">{t.shop.sortByPrice}:</span>
          <button
            onClick={() => setSortOrder('asc')}
            className={`filter-btn${sortOrder === 'asc' ? ' active' : ''}`}
          >
            {t.shop.priceAsc}
          </button>
          <button
            onClick={() => setSortOrder('desc')}
            className={`filter-btn${sortOrder === 'desc' ? ' active' : ''}`}
          >
            {t.shop.priceDesc}
          </button>
        </div>

        {loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <p className="no-products-msg">{t.shop.noProducts}</p>
        ) : (
          <div className="product-grid">
            {sorted.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
