"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="w-full">
      <div className="flex flex-row items-center justify-between w-full">
        <Link
          href="/"
          className={`text-sm sm:text-base leading-5 sm:leading-6 hover:opacity-80 transition-opacity ${
            pathname === "/" || pathname.startsWith("/posts/")
              ? "font-semibold underline"
              : "font-normal"
          } `}
        >
          <p className="whitespace-pre">블로그</p>
        </Link>
        <Link
          href="/profile"
          className={`text-sm sm:text-base leading-5 sm:leading-6 hover:opacity-80 transition-opacity ${
            pathname === "/profile" ? "font-semibold underline" : "font-normal"
          } `}
        >
          <p className="whitespace-pre">프로필</p>
        </Link>
      </div>
    </nav>
  );
}
