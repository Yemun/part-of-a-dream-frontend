"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="w-full max-w-5xl">
      <div className="flex flex-row items-center justify-between w-full">
        <Link
          href="/"
          className={`text-sm sm:text-base hover:text-red-600 dark:hover:text-red-300 transition-colors ${
            pathname === "/" || pathname.startsWith("/posts/")
              ? "font-semibold underline"
              : "font-normal"
          } `}
        >
          <p className="whitespace-pre">블로그</p>
        </Link>
        <Link
          href="/profile"
          className={`text-sm sm:text-base hover:text-red-600 dark:hover:text-red-300 transition-colors ${
            pathname === "/profile" ? "font-semibold underline" : "font-normal"
          } `}
        >
          <p className="whitespace-pre">프로필</p>
        </Link>
      </div>
    </nav>
  );
}
