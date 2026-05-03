"use client";

import { Link, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";

interface SideProjectSubNavProps {
  bingoLabel: string;
  jangbogiLabel: string;
}

export default function SideProjectSubNav({
  bingoLabel,
  jangbogiLabel,
}: SideProjectSubNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();

  if (!pathname.startsWith("/side-project")) return null;

  const activeTab =
    searchParams.get("tab") === "jangbogi" ? "jangbogi" : "bingo";

  return (
    <div className="flex items-center gap-4 mt-3 text-sm text-zinc-600 dark:text-zinc-400">
      <Link
        href={{ pathname: "/side-project", query: { tab: "bingo" } }}
        locale={locale}
        prefetch={true}
        className={`hover:text-blue-600 dark:hover:text-blue-300 transition-colors ${
          activeTab === "bingo" ? "font-semibold underline" : "font-normal"
        } `}
      >
        <p className="whitespace-pre">{bingoLabel}</p>
      </Link>
      <Link
        href={{ pathname: "/side-project", query: { tab: "jangbogi" } }}
        locale={locale}
        prefetch={true}
        className={`hover:text-blue-600 dark:hover:text-blue-300 transition-colors ${
          activeTab === "jangbogi" ? "font-semibold underline" : "font-normal"
        } `}
      >
        <p className="whitespace-pre">{jangbogiLabel}</p>
      </Link>
    </div>
  );
}
