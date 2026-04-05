'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { publicUrl } from '@/lib/config';
import type { SiteContent } from '@/types';

export default function TermsClient() {
  const { lang } = useLanguage();
  const [terms, setTerms] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(publicUrl('/data/site-content.json'))
      .then((res) => res.json())
      .then((data: SiteContent) => {
        if (data?.purchaseTerms) {
          setTerms(data.purchaseTerms[lang] || data.purchaseTerms.sv);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lang]);

  const title = lang === 'sv' ? 'Köpvillkor' : 'Terms of Purchase';
  const subtitle = lang === 'sv'
    ? 'Villkor för köp hos Oliver\'s Konst'
    : 'Terms and conditions for purchases at Oliver\'s Konst';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>

      <div className="terms-content">
        {loading ? (
          <p style={{ textAlign: 'center', color: '#999' }}>
            {lang === 'sv' ? 'Laddar...' : 'Loading...'}
          </p>
        ) : terms ? (
          terms.split('\n\n').map((paragraph, i) => (
            <p key={i} className="terms-paragraph">{paragraph}</p>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#999' }}>
            {lang === 'sv' ? 'Köpvillkor saknas.' : 'Terms not available.'}
          </p>
        )}
      </div>
    </div>
  );
}
