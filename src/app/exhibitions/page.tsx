'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Exhibition } from '@/types';
import { useLanguage } from '@/components/LanguageContext';
import { siteConfig, publicUrl } from '@/lib/config';

/** Convert plain-text URLs in a string into clickable <a> elements. */
function renderWithLinks(text: string): React.ReactNode[] {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const url = match[0];
    parts.push(
      <a key={match.index} href={url} target="_blank" rel="noopener noreferrer" className="exhibition-link">
        {url}
      </a>,
    );
    last = match.index + url.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/**
 * Convert a Google Maps share URL to an embeddable src URL.
 * Returns null if the URL cannot be embedded.
 */
function toEmbedUrl(mapUrl: string): string | null {
  if (!mapUrl) return null;
  // Already an embed URL
  if (mapUrl.includes('/maps/embed')) return mapUrl;
  if (mapUrl.includes('output=embed')) return mapUrl;
  try {
    const u = new URL(mapUrl);
    const q = u.searchParams.get('q');
    if (q) return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
    const placeMatch = u.pathname.match(/\/maps\/(?:place|search)\/([^/@?]+)/);
    if (placeMatch) return `https://www.google.com/maps?q=${placeMatch[1]}&output=embed`;
    return null;
  } catch {
    // Treat plain text as a search query
    return `https://www.google.com/maps?q=${encodeURIComponent(mapUrl)}&output=embed`;
  }
}

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
          <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">
            {renderWithLinks(ex.description[lang])}
          </p>
        )}
        {!compact && ex.mapUrl && (() => {
          const embedUrl = toEmbedUrl(ex.mapUrl!);
          return (
            <div className="exhibition-map-wrap">
              {embedUrl && (
                <iframe
                  src={embedUrl}
                  width="100%"
                  height="180"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="exhibition-map"
                  title={lang === 'sv' ? 'Plats på karta' : 'Location map'}
                />
              )}
              <a
                href={ex.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="exhibition-map-link"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {lang === 'sv' ? 'Öppna i Google Maps' : 'Open in Google Maps'}
              </a>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
