"use client";

import { Link, usePathname } from "@/i18n/routing";
import { groupByYear } from "@/lib/groupByYear";

export interface SideNavPost {
  slug: string;
  title: string;
  publishedAt: string;
}

interface BlogSideNavProps {
  posts: SideNavPost[];
  locale: string;
  label: string;
}

const POSTS_PREFIX = "/posts/";

/**
 * 블로그 좌측 글 목록. 데스크톱(lg 이상)에서만 sticky 세로 사이드바로 노출하고
 * 모바일·태블릿에서는 렌더하지 않는다(hidden).
 */
export default function BlogSideNav({
  posts,
  locale,
  label,
}: BlogSideNavProps) {
  const pathname = usePathname();
  const activeSlug = pathname.startsWith(POSTS_PREFIX)
    ? decodeURIComponent(pathname.slice(POSTS_PREFIX.length).split("/")[0])
    : null;

  const postsByYear = groupByYear(posts, (post) => post.publishedAt);

  return (
    <nav
      aria-label={label}
      className="hidden lg:block lg:w-52 lg:shrink-0 lg:sticky lg:top-8 lg:self-start"
    >
      <ul className="flex flex-col gap-y-5 text-sm text-zinc-600 dark:text-zinc-400">
        {postsByYear.map(([year, yearPosts]) => (
          <li key={year}>
            <span className="mb-1.5 block text-xs font-medium tracking-tighter">
              {year}
              {locale === "ko" ? "년" : ""}
            </span>
            <ul className="flex flex-col gap-y-1.5">
              {yearPosts.map((post) => {
                const isActive = post.slug === activeSlug;
                return (
                  <li key={post.slug}>
                    <Link
                      href={`/posts/${post.slug}`}
                      prefetch={true}
                      aria-current={isActive ? "page" : undefined}
                      className={`hover:text-blue-600 dark:hover:text-blue-300 transition-colors ${
                        isActive
                          ? "font-semibold underline text-black dark:text-white"
                          : "font-normal"
                      }`}
                    >
                      {post.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
