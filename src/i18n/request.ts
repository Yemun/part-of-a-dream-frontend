import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

// 운영 환경에서만 static import 사용
const isProd = process.env.NODE_ENV === 'production';

let cachedMessages: Record<string, Record<string, unknown>> | null = null;

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that the incoming locale is valid
  if (!locale || !routing.locales.includes(locale as 'ko' | 'en')) {
    locale = routing.defaultLocale;
  }

  let messages;
  
  if (isProd) {
    // 운영 환경: static import와 캐싱 사용
    if (!cachedMessages) {
      const [koMessages, enMessages] = await Promise.all([
        import('../../messages/ko.json').then(m => m.default),
        import('../../messages/en.json').then(m => m.default),
      ]);
      cachedMessages = { ko: koMessages, en: enMessages };
    }
    messages = cachedMessages[locale];
  } else {
    // 개발 환경: 동적 import 사용 (HMR 지원)
    messages = (await import(`../../messages/${locale}.json`)).default;
  }

  return {
    locale,
    messages
  };
});