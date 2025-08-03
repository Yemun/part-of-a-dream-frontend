import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  // A list of all locales that are supported
  locales: ["ko", "en"],
  // Used when no locale matches
  defaultLocale: "ko",
  // Use 'as-needed' for better prefetch performance (no /ko prefix for default)
  localePrefix: "as-needed",
  localeDetection: true,
});

export const config = {
  // Match only internationalized pathnames - exclude all Next.js internals
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _vercel (Vercel internals)
     * - favicon.ico, icon.png (icons)
     * - sitemap.xml, robots.txt (SEO files)
     * - Files with extensions (.js, .css, .png, etc.)
     */
    '/((?!api/|_next/static|_next/image|_vercel|favicon.ico|icon.png|sitemap.xml|robots.txt|.*\\.[a-zA-Z0-9]+$).*)',
  ]
};
