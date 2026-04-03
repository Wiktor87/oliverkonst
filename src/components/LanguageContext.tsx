'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, Translations, getTranslations } from '@/lib/i18n';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('sv');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('language') as Language | null;
      if (stored === 'sv' || stored === 'en') {
        setLangState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('language', newLang);
    } catch {
      // ignore
    }
  };

  const t = getTranslations(lang);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
