"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  // 포스트 상세 페이지인지 확인
  const isPostPage = pathname.startsWith("/posts/");

  if (isPostPage) {
    return (
      <nav className="w-full">
        <div className="flex flex-row items-center justify-between w-full">
          <button
            onClick={() => router.back()}
            className="text-sm sm:text-base leading-5 sm:leading-6 hover:opacity-80 transition-opacity font-normal text-slate-950 cursor-pointer"
          >
            <p className="whitespace-pre">
              ← <span className="underline">뒤로가기</span>
            </p>
          </button>
          <Link
            href="/profile"
            className="text-sm sm:text-base leading-5 sm:leading-6 hover:opacity-80 transition-opacity font-normal text-slate-950"
          >
            <p className="whitespace-pre">프로필</p>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-full">
      <div className="flex flex-row items-center justify-between w-full">
        <Link
          href="/"
          className={`text-sm sm:text-base leading-5 sm:leading-6 hover:opacity-80 transition-opacity ${
            pathname === "/" ? "font-semibold underline" : "font-normal"
          } text-slate-950`}
        >
          <p className="whitespace-pre">블로그</p>
        </Link>
        <Link
          href="/profile"
          className={`text-sm sm:text-base leading-5 sm:leading-6 hover:opacity-80 transition-opacity ${
            pathname === "/profile" ? "font-semibold underline" : "font-normal"
          } text-slate-950`}
        >
          <p className="whitespace-pre">프로필</p>
        </Link>
      </div>
    </nav>
  );
}
