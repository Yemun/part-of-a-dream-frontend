"use client";

import { Link, usePathname } from "@/i18n/routing";

interface NavigationClientProps {
  blogText: string;
  profileText: string;
}

export default function NavigationClient({ blogText, profileText }: NavigationClientProps) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-6">
      <Link
        href="/"
        className={`text-sm sm:text-base hover:text-red-600 dark:hover:text-red-300 transition-colors ${
          pathname === "/" || pathname.startsWith("/posts/")
            ? "font-semibold underline"
            : "font-normal"
        } `}
      >
        <p className="whitespace-pre">{blogText}</p>
      </Link>
      <Link
        href="/profile"
        className={`text-sm sm:text-base hover:text-red-600 dark:hover:text-red-300 transition-colors ${
          pathname === "/profile" ? "font-semibold underline" : "font-normal"
        } `}
      >
        <p className="whitespace-pre">{profileText}</p>
      </Link>
    </div>
  );
}