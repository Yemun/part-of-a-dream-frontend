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
      <span className="group-hover:hidden">
        {locale === "ko" ? "ENG" : "한국어로"}
      </span>
      <span className="hidden group-hover:inline">
        {locale === "ko" ? "영어로" : "KOR"}
      </span>
    </button>
  );
}
