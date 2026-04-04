'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import CuratorsNote from '@/components/CuratorsNote';
import { publicUrl, siteConfig } from '@/lib/config';
import { Exhibition } from '@/types';

export default function AboutClient() {
  const { t, lang } = useLanguage();
  const [pastExhibitions, setPastExhibitions] = useState<Exhibition[]>([]);

  useEffect(() => {
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
                src={publicUrl('/images/oliver-profil.webp')}
                alt="Oliver"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
          <div>
            {t.about.content.split('\n\n').map((para, i) => (
              <p key={i} className="about-bio-text">{para}</p>
            ))}

            <CuratorsNote
              text={
                lang === 'sv'
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
                <li key={ex.id}>
                  {formatYear(ex.startDate)} – {ex.title[lang]}{ex.location[lang] ? `, ${ex.location[lang]}` : ''}
                </li>
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
