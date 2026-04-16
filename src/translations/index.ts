import { Language } from '@/contexts/LanguageContext';

export { loginTranslations, settingsTranslations } from './login-settings';
export { dashboardTranslations } from './dashboard';

/**
 * Helper function to get translation object based on language
 * Handles Portuguese variants (pt-PT, pt-BR) automatically
 */
export const getTranslation = <T extends Record<string, any>>(
  language: Language, 
  translationObject: T
): T[keyof T] => {
  return translationObject[language] || translationObject['en'];
};

export const navTranslations = {
  'en': {
    forBusiness: 'For Business',
    shop: 'Shop',
    aboutUs: 'About Us',
    dashboard: 'Dashboard',
    logout: 'Log out',
    login: 'Log in',
    getStarted: 'Get Started',
  },
  'pt': {
    forBusiness: 'Para Empresas',
    shop: 'Loja',
    aboutUs: 'Sobre Nós',
    dashboard: 'Painel',
    logout: 'Sair',
    login: 'Entrar',
    getStarted: 'Começar',
  }
};
