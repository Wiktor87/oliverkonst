'use client';

import { useEffect, useState } from 'react';
import { Product, Category } from '@/types';
import { useLanguage } from '@/components/LanguageContext';
import ProductCard from '@/components/ProductCard';
import { siteConfig } from '@/lib/config';

export default function ShopPage() {
  const { lang, t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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

        {loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="no-products-msg">{t.shop.noProducts}</p>
        ) : (
          <div className="product-grid">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
