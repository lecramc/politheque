import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

import en from '@/locales/en/translation.json';
import fr from '@/locales/fr/translation.json';

const defaultLocale = 'fr';

const i18n = new I18n();
i18n.defaultLocale = defaultLocale;
i18n.enableFallback = true;

export let translate = (key: string, options?: object) => {
  return key;
};
export let locale = defaultLocale;

const translationMap: Record<string, any> = {
  fr,
  en,
};

export const initI18n = async () => {
  const detectedLocale = getLocales()[0]?.languageCode || defaultLocale;

  const translations = translationMap[detectedLocale] || translationMap[defaultLocale];

  i18n.translations = {
    [detectedLocale]: translations,
  };
  i18n.locale = detectedLocale;
  locale = detectedLocale;

  translate = i18n.translate.bind(i18n);
};
