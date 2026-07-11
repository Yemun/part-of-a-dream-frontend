"use client";

import { useLocale } from "next-intl";
import { routing, isValidLocale, getLocalePrefix } from "@/i18n/routing";

export default function LanguageSwitcher() {
  const locale = useLocale();

  const toggleLocale = () => {
    // Read the *real* URL at click time (including the locale prefix, e.g.
    // `/en/profile`). We deliberately avoid next-intl's
    // `router.replace(pathname, { locale })`: it forces a `/ko` prefix that the
    // proxy 307-redirects to `/`, and client-side RSC navigation fails to
    // commit that redirect — leaving switching to the default locale stuck.
    const { pathname, search } = window.location;
    const segments = pathname.split("/");
    const hasPrefix = isValidLocale(segments[1]);
    const current = hasPrefix ? segments[1] : routing.defaultLocale;
    const target: "ko" | "en" = current === "ko" ? "en" : "ko";

    // Strip the existing locale prefix, keep the rest of the path.
    const rest = hasPrefix ? "/" + segments.slice(2).join("/") : pathname;
    const normalizedRest = rest === "/" ? "" : rest;

    const destination =
      `${getLocalePrefix(target)}${normalizedRest}${search}` || "/";

    // Set the locale cookie up front so `localeDetection` in the proxy doesn't
    // bounce an unprefixed (default-locale) URL back to `/en`.
    document.cookie = `NEXT_LOCALE=${target};path=/;max-age=31536000`;

    // Navigate directly to the canonical destination. A full navigation avoids
    // the fragile RSC redirect chain that breaks switching to the default
    // locale under `localePrefix: "as-needed"`.
    window.location.href = destination;
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
