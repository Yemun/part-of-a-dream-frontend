import Link from "next/link";
import { BlogPost } from "@/lib/strapi";

interface PostNavigationProps {
  previous: BlogPost | null;
  next: BlogPost | null;
}

export default function PostNavigation({ previous, next }: PostNavigationProps) {
  if (!previous && !next) {
    return null;
  }

  return (
    <nav className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          {previous && (
            <Link
              href={`/posts/${previous.slug}`}
              className="group flex flex-col items-start p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                이전 글
              </span>
              <span className="text-slate-900 dark:text-white font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {previous.title}
              </span>
            </Link>
          )}
        </div>
        
        <div className="flex-1">
          {next && (
            <Link
              href={`/posts/${next.slug}`}
              className="group flex flex-col items-end p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-right"
            >
              <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                다음 글
              </span>
              <span className="text-slate-900 dark:text-white font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {next.title}
              </span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}