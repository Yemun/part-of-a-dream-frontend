"use client";

import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();

  const handleLanguageChange = (newLocale: "ko" | "en") => {
    if (newLocale === locale) {
      return; // Don't switch to the same locale
    }

    // Use next-intl's router for proper locale switching
    // This handles the as-needed prefix logic automatically
    router.replace(pathname, { locale: newLocale });
  };

  const toggleLocale = () => {
    const newLocale: "ko" | "en" = locale === "ko" ? "en" : "ko";
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
