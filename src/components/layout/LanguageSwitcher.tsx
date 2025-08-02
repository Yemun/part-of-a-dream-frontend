"use client";

import { usePathname } from "next/navigation";

export default function LanguageSwitcher() {
  const pathname = usePathname();

  // Determine actual current locale from URL
  // According to routing config: Korean (default) = no prefix, English = /en prefix
  const actualLocale = pathname.startsWith("/en") ? "en" : "ko";
  const locale = actualLocale;

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale) {
      return; // Don't switch to the same locale
    }

    const currentUrl = window.location.href;
    const url = new URL(currentUrl);

    // Get current path
    let path = url.pathname;

    // Clean the path by removing any existing locale prefix
    // With localePrefix: 'always', all locales get prefixes
    if (path.startsWith("/en/")) {
      path = path.substring(3);
    } else if (path === "/en") {
      path = "/";
    } else if (path.startsWith("/ko/")) {
      path = path.substring(3);
    } else if (path === "/ko") {
      path = "/";
    }

    // Build new URL
    let newUrl: string;
    if (newLocale === "ko") {
      // Korean gets explicit /ko prefix
      const newPath = path === "/" ? "/ko" : `/ko${path}`;
      newUrl = `${url.protocol}//${url.host}${newPath}${url.search}`;
    } else {
      // English gets /en prefix
      const newPath = path === "/" ? "/en" : `/en${path}`;
      newUrl = `${url.protocol}//${url.host}${newPath}${url.search}`;
    }

    // Navigate to new URL
    window.location.href = newUrl;
  };

  const toggleLocale = () => {
    const newLocale = locale === "ko" ? "en" : "ko";
    handleLanguageChange(newLocale);
  };

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center justify-center rounded hover:scale-120 transition-transform"
      type="button"
      title={locale === "ko" ? "Switch to English" : "한국어로 변경"}
    >
      <span className="text-3xl">{locale === "ko" ? "🇬🇧" : "🇰🇷"}</span>
    </button>
  );
}
