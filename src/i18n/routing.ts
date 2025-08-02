import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['ko', 'en'],

  // Used when no locale matches
  defaultLocale: 'ko',
  
  // Use 'as-needed' to avoid prefix for default locale (better performance)
  localePrefix: 'as-needed',

  // Optional: Set different pathnames based on locale
  // Removing pathnames to use the same paths for all locales
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);