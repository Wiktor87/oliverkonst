'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import CuratorsNote from '@/components/CuratorsNote';
import { publicUrl, siteConfig } from '@/lib/config';
import { Exhibition, SiteContent } from '@/types';

export default function AboutClient() {
  const { t, lang } = useLanguage();
  const [pastExhibitions, setPastExhibitions] = useState<Exhibition[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    fetch(publicUrl('/data/site-content.json'))
      .then((res) => res.json())
      .then((d) => {
        if (d) setSiteContent(d);
      })
      .catch(() => {});

    fetch(`${siteConfig.basePath}/data/exhibitions.json`)
      .then((r) => r.json())
      .then((data: Exhibition[]) =>
        setPastExhibitions(
          data
            .filter((ex) => ex.status === 'past')
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
        ),
      )
      .catch(() => {});
  }, []);

  const formatYear = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).getFullYear().toString();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t.about.title}</h1>
        <p className="page-subtitle">{t.about.subtitle}</p>
      </div>

      <div className="about-layout">
        <div className="about-bio-grid">
          <div>
            <div className="about-portrait-page">
              <Image
                src={publicUrl('/img/profile-large.webp')}
                alt="Oliver"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
          <div>
            {(siteContent?.biography?.[lang] || t.about.content).split('\n\n').map((para, i) => (
              <p key={i} className="about-bio-text">{para}</p>
            ))}

            <CuratorsNote
              text={
                siteContent?.profileQuote?.[lang]
                  ? `"${siteContent.profileQuote[lang]}"`
                  : lang === 'sv'
                    ? '"Konst är inte vad du ser, utan vad du får andra att se."'
                    : '"Art is not what you see, but what you make others see."'
              }
              attribution={lang === 'sv' ? 'Oliver, om sitt konstnärskap' : 'Oliver, on his art'}
              label={lang === 'sv' ? 'Konstnärens ord' : "Artist's Words"}
            />
          </div>
        </div>

        <div className="about-info-box" style={{ marginBottom: '3rem' }}>
          <h2 className="about-info-title">{t.about.exhibitions}</h2>
          {pastExhibitions.length === 0 ? (
            <p className="about-bio-text">{t.about.noExhibitions}</p>
          ) : (
            <ul className="about-info-list">
              {pastExhibitions.map((ex) => (
                <ExhibitionItem key={ex.id} ex={ex} lang={lang} formatYear={formatYear} />
              ))}
            </ul>
          )}
        </div>

        <div className="about-cta">
          <Link href="/contact" className="btn-primary">{t.about.contact}</Link>
        </div>
      </div>
    </div>
  );
}

function ExhibitionItem({
  ex, lang, formatYear,
}: {
  ex: Exhibition;
  lang: 'sv' | 'en';
  formatYear: (d: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const description = ex.description?.[lang];

  const toggle = useCallback(() => setExpanded((v) => !v), []);

  return (
    <li>
      <div
        className="exhibition-item-header"
        role={description ? 'button' : undefined}
        tabIndex={description ? 0 : undefined}
        onClick={description ? toggle : undefined}
        onKeyDown={description ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } } : undefined}
        aria-expanded={description ? expanded : undefined}
      >
        <span>{formatYear(ex.startDate)} – {ex.title[lang]}{ex.location[lang] ? `, ${ex.location[lang]}` : ''}</span>
        {description && (
          <svg
            className={`exhibition-expand-icon ${expanded ? 'expanded' : ''}`}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </div>
      {description && expanded && (
        <p className="exhibition-item-description">{description}</p>
      )}
    </li>
  );
}
