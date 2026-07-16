'use client';

import { useEffect, useState } from 'react';
import { Craft, Category } from '@/types';
import { useLanguage } from '@/components/LanguageContext';
import CraftCard from '@/components/CraftCard';
import { siteConfig } from '@/lib/config';

export default function CraftsClient() {
  const { lang, t } = useLanguage();
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${siteConfig.basePath}/data/crafts.json`),
      fetch(`${siteConfig.basePath}/data/craft-categories.json`),
    ])
      .then(async ([cr, catr]) => {
        setCrafts(await cr.json());
        setCategories(await catr.json());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    selectedCategory === 'all'
      ? crafts
      : crafts.filter((c) => c.category === selectedCategory);

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Only show filters for categories that actually have pieces
  const usedCategories = categories.filter((cat) =>
    crafts.some((c) => c.category === cat.id),
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t.crafts.title}</h1>
        <p className="page-subtitle">{t.crafts.subtitle}</p>
      </div>

      <div className="section">
        {usedCategories.length > 1 && (
          <div className="filter-bar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`filter-btn${selectedCategory === 'all' ? ' active' : ''}`}
            >
              {t.crafts.filterAll}
            </button>
            {usedCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`filter-btn${selectedCategory === cat.id ? ' active' : ''}`}
              >
                {cat.name[lang]}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <p className="no-products-msg">{t.crafts.empty}</p>
        ) : (
          <div className="product-grid">
            {sorted.map((craft) => (
              <CraftCard
                key={craft.id}
                craft={craft}
                categoryName={
                  categories.find((cat) => cat.id === craft.category)?.name[lang]
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
