"use client";

import { usePathname } from "next/navigation";

export default function LanguageSwitcher() {
  const pathname = usePathname();

  // Determine actual current locale from URL
  // With localePrefix: "always", both locales have prefixes: /ko and /en
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
    // With localePrefix: 'always', both locales have prefixes (/ko and /en)
    if (path.startsWith("/ko/")) {
      path = path.substring(3);
    } else if (path.startsWith("/en/")) {
      path = path.substring(3);
    } else if (path === "/ko" || path === "/en") {
      path = "/";
    }

    // Build new URL with explicit host handling for production
    // Both locales now get prefixes
    const newPath = path === "/" ? `/${newLocale}` : `/${newLocale}${path}`;
    const newUrl = `${url.protocol}//${url.host}${newPath}${url.search}`;

    // Use location.replace for better reliability
    window.location.replace(newUrl);
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
