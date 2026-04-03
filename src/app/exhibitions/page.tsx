'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Exhibition } from '@/types';
import { useLanguage } from '@/components/LanguageContext';
import { siteConfig, publicUrl } from '@/lib/config';

export default function ExhibitionsPage() {
  const { lang, t } = useLanguage();
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${siteConfig.basePath}/data/exhibitions.json`)
      .then((r) => r.json())
      .then((data: Exhibition[]) => setExhibitions(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcoming = exhibitions.filter((ex) => ex.status === 'upcoming');
  const active = exhibitions.filter((ex) => ex.status === 'active');
  const past = exhibitions.filter((ex) => ex.status === 'past');

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const statusColor = (status: Exhibition['status']) => {
    if (status === 'active') return 'bg-green-100 text-green-800';
    if (status === 'upcoming') return 'bg-blue-100 text-blue-800';
    return 'bg-stone-100 text-stone-600';
  };

  const statusText = (status: Exhibition['status']) => {
    if (status === 'active') return t.exhibitions.active;
    if (status === 'upcoming') return t.exhibitions.upcoming;
    return t.exhibitions.past;
  };

  if (loading) {
    return (
      <div className="section">
        <div className="section-header">
          <div className="skeleton skeleton-line" style={{ width: '200px', margin: '0 auto' }} />
        </div>
        <div className="product-grid">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton skeleton-card" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="section">
        <div className="section-header">
          <h1 className="section-title">{t.exhibitions.title}</h1>
          <p className="section-subtitle">{t.exhibitions.subtitle}</p>
        </div>

        {exhibitions.length === 0 && (
          <p className="text-center text-stone-500 py-12">{t.exhibitions.noExhibitions}</p>
        )}

        {/* Active exhibitions */}
        {active.length > 0 && (
          <div className="mb-12">
            <h2 className="font-serif text-xl text-stone-700 mb-6 pb-2 border-b border-stone-200">
              {t.exhibitions.active}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {active.map((ex) => (
                <ExhibitionCard key={ex.id} ex={ex} lang={lang} formatDate={formatDate} statusColor={statusColor} statusText={statusText} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming exhibitions */}
        {upcoming.length > 0 && (
          <div className="mb-12">
            <h2 className="font-serif text-xl text-stone-700 mb-6 pb-2 border-b border-stone-200">
              {t.exhibitions.upcoming}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {upcoming.map((ex) => (
                <ExhibitionCard key={ex.id} ex={ex} lang={lang} formatDate={formatDate} statusColor={statusColor} statusText={statusText} />
              ))}
            </div>
          </div>
        )}

        {/* Past exhibitions */}
        {past.length > 0 && (
          <div className="mb-12">
            <h2 className="font-serif text-xl text-stone-700 mb-6 pb-2 border-b border-stone-200">
              {t.exhibitions.past}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {past.map((ex) => (
                <ExhibitionCard key={ex.id} ex={ex} lang={lang} formatDate={formatDate} statusColor={statusColor} statusText={statusText} compact />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ExhibitionCard({
  ex, lang, formatDate, statusColor, statusText, compact = false,
}: {
  ex: Exhibition;
  lang: 'sv' | 'en';
  formatDate: (d: string) => string;
  statusColor: (s: Exhibition['status']) => string;
  statusText: (s: Exhibition['status']) => string;
  compact?: boolean;
}) {
  const imgSrc = ex.imageUrl
    ? (ex.imageUrl.startsWith('http') ? ex.imageUrl : publicUrl(ex.imageUrl))
    : null;

  return (
    <div className={`bg-white rounded-lg overflow-hidden shadow-sm border border-stone-100 ${compact ? '' : ''}`}>
      {imgSrc && (
        <div className="relative w-full" style={{ paddingBottom: compact ? '56%' : '60%' }}>
          <Image
            src={imgSrc}
            alt={ex.title[lang]}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className={`font-serif ${compact ? 'text-base' : 'text-lg'} text-stone-800`}>
            {ex.title[lang]}
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor(ex.status)}`}>
            {statusText(ex.status)}
          </span>
        </div>
        {ex.location[lang] && (
          <p className="text-sm text-stone-500 mb-1">{ex.location[lang]}</p>
        )}
        <p className="text-xs text-stone-400 mb-3">
          {formatDate(ex.startDate)} – {formatDate(ex.endDate)}
        </p>
        {!compact && ex.description[lang] && (
          <p className="text-sm text-stone-600 leading-relaxed">{ex.description[lang]}</p>
        )}
      </div>
    </div>
  );
}
