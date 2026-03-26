"use client";

import { usePathname } from "@/i18n/routing";

const HIDDEN_PATHS = ["/side-project/bingo"];

export default function NavigationVisibility({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null;
  return <>{children}</>;
}
