import Link from "next/link";
import { BlogPost } from "@/lib/strapi";

interface PostNavigationProps {
  previous: BlogPost | null;
  next: BlogPost | null;
}

export default function PostNavigation({
  previous,
  next,
}: PostNavigationProps) {
  if (!previous && !next) {
    return null;
  }

  return (
    <nav className="mt-12 py-8 border-t border-b border-gray-200 dark:border-gray-400">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          {previous && (
            <Link
              href={`/posts/${previous.slug}`}
              className="group flex flex-col items-start px-2 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                이전 글
              </span>
              <span className="text-gray-900 dark:text-white font-medium group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                {previous.title}
              </span>
            </Link>
          )}
        </div>

        <div className="flex-1">
          {next && (
            <Link
              href={`/posts/${next.slug}`}
              className="group flex flex-col items-end px-2 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-right"
            >
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                다음 글
              </span>
              <span className="text-gray-900 dark:text-white font-medium group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                {next.title}
              </span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
