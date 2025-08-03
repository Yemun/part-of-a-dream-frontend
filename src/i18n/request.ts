import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import koMessages from '../../messages/ko.json';
import enMessages from '../../messages/en.json';

const messages = {
  ko: koMessages,
  en: enMessages,
} as const;

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that the incoming locale is valid
  if (!locale || !routing.locales.includes(locale as 'ko' | 'en')) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: messages[locale as keyof typeof messages]
  };
});