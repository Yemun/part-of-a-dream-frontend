import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { BlogPost } from "@/lib/content";

type NavItem = Pick<BlogPost, "slug" | "title">;

interface PostNavigationProps {
  previous: NavItem | null;
  next: NavItem | null;
  /** 링크 경로 접두사. 블로그는 /posts, 업무는 /work */
  basePath?: string;
  /** 라벨 미지정 시 post.navigation.* 메시지를 사용 */
  previousLabel?: string;
  nextLabel?: string;
}

export default function PostNavigation({
  previous,
  next,
  basePath = "/posts",
  previousLabel,
  nextLabel,
}: PostNavigationProps) {
  const t = useTranslations("post");

  if (!previous && !next) {
    return null;
  }

  const labels = {
    previous: previousLabel ?? t("navigation.previous"),
    next: nextLabel ?? t("navigation.next"),
  };

  // next-intl Link가 현재 locale을 자동 적용한다 (locale prop을 주면 /ko/ 접두사가 붙어 리다이렉트를 탄다)

  return (
    <nav className="mt-12 py-8 border-t border-b border-gray-200 dark:border-gray-400">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          {previous && (
            <Link
              href={`${basePath}/${previous.slug}`}
              prefetch={true}
              className="group flex flex-col items-start"
            >
              <span className="text-sm text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-300 dark:text-gray-400 mb-1">
                {labels.previous}
              </span>
              <span className="text-gray-900 dark:text-white font-medium group-hover:text-blue-600 dark:group-hover:text-blue-300 ">
                {previous.title}
              </span>
            </Link>
          )}
        </div>

        <div className="flex-1">
          {next && (
            <Link
              href={`${basePath}/${next.slug}`}
              prefetch={true}
              className="group flex flex-col items-end text-right"
            >
              <span className="text-sm text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-300 dark:text-gray-400 mb-1">
                {labels.next}
              </span>
              <span className="text-gray-900 dark:text-white font-medium group-hover:text-blue-600 dark:group-hover:text-blue-300 ">
                {next.title}
              </span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
