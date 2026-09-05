"use client";

import { Link, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";

interface SideProjectSubNavProps {
  bingoLabel: string;
  jangbogiLabel: string;
  paletteLabel: string;
}

export default function SideProjectSubNav({
  jangbogiLabel,
  bingoLabel,
  paletteLabel,
}: SideProjectSubNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();

  if (!pathname.startsWith("/side-project")) return null;

  const tabParam = searchParams.get("tab");
  const activeTab =
    tabParam === "bingo" || tabParam === "palette" ? tabParam : "jangbogi";

  const tabs = [
    { tab: "jangbogi", label: jangbogiLabel },
    { tab: "bingo", label: bingoLabel },
    { tab: "palette", label: paletteLabel },
  ];

  return (
    <div className="flex items-center gap-4 mt-3 text-sm text-zinc-600 dark:text-zinc-400">
      {tabs.map(({ tab, label }) => (
        <Link
          key={tab}
          href={{ pathname: "/side-project", query: { tab } }}
          locale={locale}
          prefetch={true}
          className={`hover:text-blue-600 dark:hover:text-blue-300 transition-colors ${
            activeTab === tab ? "font-semibold underline" : "font-normal"
          } `}
        >
          <p className="whitespace-pre">{label}</p>
        </Link>
      ))}
    </div>
  );
}
