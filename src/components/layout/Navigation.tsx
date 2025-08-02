"use client";

import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navigation() {
  const pathname = usePathname();
  const t = useTranslations('navigation');

  return (
    <nav className="w-full max-w-5xl">
      <div className="flex flex-row items-center justify-between w-full">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm sm:text-base hover:text-red-600 dark:hover:text-red-300 transition-colors ${
              pathname === "/" || pathname.startsWith("/posts/")
                ? "font-semibold underline"
                : "font-normal"
            } `}
          >
            <p className="whitespace-pre">{t('blog')}</p>
          </Link>
          <Link
            href="/profile"
            className={`text-sm sm:text-base hover:text-red-600 dark:hover:text-red-300 transition-colors ${
              pathname === "/profile" ? "font-semibold underline" : "font-normal"
            } `}
          >
            <p className="whitespace-pre">{t('profile')}</p>
          </Link>
        </div>
        <LanguageSwitcher />
      </div>
    </nav>
  );
}
