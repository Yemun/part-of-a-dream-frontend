"use client";

import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();

  const toggleLocale = () => {
    const newLocale: "ko" | "en" = locale === "ko" ? "en" : "ko";
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center justify-center cursor-pointer group"
      type="button"
      title={locale === "ko" ? "Switch to English" : "한국어로 변경"}
    >
      <span className="text-3xl">
        <span className="group-hover:hidden">
          {locale === "ko" ? "🇰🇷" : "🇬🇧"}
        </span>
        <span className="hidden group-hover:inline">
          {locale === "ko" ? "🇬🇧" : "🇰🇷"}
        </span>
      </span>
    </button>
  );
}
