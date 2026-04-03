import svTranslations from '../../locales/sv.json';
import enTranslations from '../../locales/en.json';

export type Language = 'sv' | 'en';

export type Translations = typeof svTranslations;

const translations: Record<Language, Translations> = {
  sv: svTranslations,
  en: enTranslations as Translations,
};

export function getTranslations(lang: Language): Translations {
  return translations[lang];
}
