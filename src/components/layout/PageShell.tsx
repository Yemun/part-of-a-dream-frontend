"use client";

import { usePathname } from "@/i18n/routing";
import Navigation from "./Navigation";

const FULL_BLEED_PATHS = ["/side-project/bingo"];

export default function PageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const fullBleed = FULL_BLEED_PATHS.some((p) => pathname.startsWith(p));

  if (fullBleed) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col gap-12 sm:gap-14 items-center justify-start px-4 sm:px-8 lg:px-16 pt-8 pb-22 sm:pt-12 sm:pb-24 lg:pt-20 lg:pb-26 w-full">
        <Navigation />
        <div className="max-w-5xl w-full">{children}</div>
      </div>
    </div>
  );
}
