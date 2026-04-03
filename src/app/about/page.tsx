'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import CuratorsNote from '@/components/CuratorsNote';
import { publicUrl } from '@/lib/config';

export default function AboutPage() {
  const { t, lang } = useLanguage();

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

        <div className="about-info-grid">
          <div className="about-info-box">
            <h2 className="about-info-title">{t.about.exhibitions}</h2>
            <ul className="about-info-list">
              <li>2024 – Galleri Konstrum, Göteborg</li>
              <li>2023 – Kulturhuset, Stockholm</li>
              <li>2022 – Konsthall Malmö</li>
              <li>2021 – Galleri 54, Göteborg</li>
            </ul>
          </div>
          <div className="about-info-box">
            <h2 className="about-info-title">{t.about.education}</h2>
            <ul className="about-info-list">
              <li>Konstfack, Stockholm – MFA Fine Arts</li>
              <li>Göteborgs konstskola – Grundutbildning</li>
              <li>Atelier Cézanne, Aix-en-Provence</li>
            </ul>
          </div>
        </div>

        <div className="about-cta">
          <Link href="/contact" className="btn-primary">{t.about.contact}</Link>
        </div>
      </div>
    </div>
  );
}
