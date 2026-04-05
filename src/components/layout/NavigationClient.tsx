"use client";

import { Link, usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";

interface NavigationClientProps {
  blogText: string;
  profileText: string;
  sideProjectText: string;
}

export default function NavigationClient({
  blogText,
  profileText,
  sideProjectText,
}: NavigationClientProps) {
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/"
        locale={locale}
        prefetch={true}
        className={`hover:text-blue-600 dark:hover:text-blue-300 transition-colors ${
          pathname === "/" || pathname.startsWith("/posts/")
            ? "font-semibold underline"
            : "font-normal"
        } `}
      >
        <p className="whitespace-pre">{blogText}</p>
      </Link>
      <Link
        href="/profile"
        locale={locale}
        prefetch={true}
        className={`hover:text-blue-600 dark:hover:text-blue-300 transition-colors ${
          pathname === "/profile" ? "font-semibold underline" : "font-normal"
        } `}
      >
        <p className="whitespace-pre">{profileText}</p>
      </Link>
      <Link
        href="/side-project/bingo"
        locale={locale}
        prefetch={true}
        className={`hover:text-blue-600 dark:hover:text-blue-300 transition-colors ${
          pathname.startsWith("/side-project/bingo")
            ? "font-semibold underline"
            : "font-normal"
        } `}
      >
        <p className="whitespace-pre">{sideProjectText}</p>
      </Link>
    </div>
  );
}
