import { Language } from '@/contexts/LanguageContext';

/**
 * Helper to check if current language is Portuguese
 */
export const isPortuguese = (language: Language): boolean => {
  return language === 'pt';
};

/**
 * Helper to check if current language is English
 */
export const isEnglish = (language: Language): boolean => {
  return language === 'en';
};

/**
 * Get text based on language - Portuguese vs others
 */
export const getLocalizedText = (language: Language, ptText: string, enText: string): string => {
  return isPortuguese(language) ? ptText : enText;
};

/**
 * Get translation from a translations object
 * Automatically handles language variants and provides fallback to English
 */
export const getTranslation = <T>(language: Language, translations: { pt: T; en: T }): T => {
  return isPortuguese(language) ? translations.pt : translations.en;
};

/**
 * Migrate old localStorage language codes to new format
 */
export const migrateLanguageCode = (oldCode: string): Language => {
  if (oldCode === 'pt' || oldCode === 'pt-PT' || oldCode === 'pt-BR') return 'pt';
  if (oldCode === 'en') return 'en';
  return 'en'; // fallback
};