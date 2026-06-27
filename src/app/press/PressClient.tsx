'use client';

import { PressItem } from '@/types';
import { useLanguage } from '@/components/LanguageContext';

/** Sort newest first; items without a date go last (keeping their order). */
function sortByDateDesc(items: PressItem[]): PressItem[] {
  return [...items].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });
}

export default function PressClient({ items }: { items: PressItem[] }) {
  const { t } = useLanguage();
  const sorted = sortByDateDesc(items);

  return (
    <div>
      <section className="section">
        <div className="section-header">
          <h1 className="section-title">{t.press.title}</h1>
          <p className="section-subtitle">{t.press.subtitle}</p>
        </div>

        {sorted.length === 0 && (
          <p className="text-center text-stone-500 py-12">{t.press.empty}</p>
        )}

        <ul className="press-list">
          {sorted.map((item, idx) => (
            <li key={`${item.url}-${idx}`} className="press-item">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="press-item-link"
              >
                <div className="press-item-meta">
                  <span className="press-item-outlet">{item.outlet}</span>
                  {item.date && <span className="press-item-date">{item.date}</span>}
                </div>
                <p className="press-item-title">{item.title}</p>
                <span className="press-item-cta">{t.press.readMore} →</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
