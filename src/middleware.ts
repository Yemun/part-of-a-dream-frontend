import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames - more specific patterns
  matcher: [
    // Match root
    "/",
    // Match locale-specific routes only
    "/(ko|en)/:path*",
    // Match direct paths that need locale handling
    "/((?!api|_next|favicon.ico|icon.png|sitemap.xml|robots.txt).*)",
  ],
};
