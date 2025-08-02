import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // More specific matcher for production performance
  matcher: [
    // Match root
    '/',
    // Match specific routes only (avoid processing static files)
    '/(ko|en)/:path*',
    // Match non-localized routes that need processing
    '/((?!api|_next|_vercel|favicon|icon|sitemap|robots|.*\\.).*)'
  ]
};