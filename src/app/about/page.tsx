'use client';

import { useLanguage } from '@/components/LanguageContext';
import Link from 'next/link';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl text-stone-800 mb-3">{t.about.title}</h1>
        <p className="text-stone-500 text-lg">{t.about.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
        <div className="md:col-span-1">
          <div className="bg-amber-50 rounded-lg aspect-square flex items-center justify-center overflow-hidden">
            <div className="text-center text-amber-300 p-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-amber-600 font-serif text-sm">Oliver</p>
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="prose prose-stone max-w-none">
            {t.about.content.split('\n\n').map((para, i) => (
              <p key={i} className="text-stone-600 leading-relaxed mb-4">{para}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-amber-50 rounded-lg p-6">
          <h2 className="font-serif text-xl text-stone-800 mb-4">{t.about.exhibitions}</h2>
          <ul className="space-y-2 text-sm text-stone-600">
            <li>2024 – Galleri Konstrum, Göteborg</li>
            <li>2023 – Kulturhuset, Stockholm</li>
            <li>2022 – Konsthall Malmö</li>
            <li>2021 – Galleri 54, Göteborg</li>
          </ul>
        </div>
        <div className="bg-stone-50 rounded-lg p-6">
          <h2 className="font-serif text-xl text-stone-800 mb-4">{t.about.education}</h2>
          <ul className="space-y-2 text-sm text-stone-600">
            <li>Konstfack, Stockholm – MFA Fine Arts</li>
            <li>Göteborgs konstskola – Grundutbildning</li>
            <li>Atelier Cézanne, Aix-en-Provence</li>
          </ul>
        </div>
      </div>

      <div className="text-center">
        <Link href="/contact" className="inline-block bg-amber-700 hover:bg-amber-800 text-white px-8 py-3 rounded transition-colors font-medium">
          {t.about.contact}
        </Link>
      </div>
    </div>
  );
}
