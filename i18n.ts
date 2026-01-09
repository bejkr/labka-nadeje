import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import sk from './locales/sk.json';
import en from './locales/en.json';
import de from './locales/de.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            sk: { translation: sk },
            en: { translation: en },
            de: { translation: de },
        },
        fallbackLng: 'sk',
        debug: true,
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        detection: {
            order: ['localStorage'], // REMOVED 'navigator' to force default SK on first visit
            caches: ['localStorage'],
        },
    });

export default i18n;
