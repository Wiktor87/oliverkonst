'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';

export default function ClassesClient() {
  const { t } = useLanguage();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t.classes.title}</h1>
        <p className="page-subtitle">{t.classes.subtitle}</p>
      </div>

      <div className="section">
        <div className="about-layout">
          <p className="about-bio-text">{t.classes.intro}</p>

          <div className="about-info-box" style={{ marginBottom: '3rem' }}>
            <p className="about-bio-text">{t.classes.noClasses}</p>
          </div>

          <div className="about-cta">
            <Link href="/contact" className="btn-primary">{t.classes.contact}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
