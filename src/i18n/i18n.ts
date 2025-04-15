import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from './translations';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translations.en },
      ar: { translation: translations.ar }
    },
    lng: localStorage.getItem('i18nextLng') || 'en', // Read language from localStorage or default to 'en'
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
