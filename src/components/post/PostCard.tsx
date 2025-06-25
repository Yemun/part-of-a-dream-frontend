import Link from "next/link";
import RelativeTime from "@/components/common/RelativeTime";
import { BlogPost } from "@/lib/strapi";

interface PostCardProps {
  post?: BlogPost;
  text?: string;
  opacity?: number;
}

export default function PostCard({ post, text, opacity = 1 }: PostCardProps) {
  // Placeholder 모드 (post가 없는 경우)
  if (!post) {
    return (
      <div className="flex-1 min-w-[128px]" style={{ opacity }}>
        <div className="border-b border-r flex flex-col">
          <div className="border-b-[0.5px] flex justify-center leading-7 text-sm font-semibold text-stroke-effect dot-pattern">
            {text || "-"}
          </div>
          <div className="flex justify-center items-center py-4 sm:py-3">
            <div className="w-[106px] h-[106px]"></div>
          </div>
        </div>
      </div>
    );
  }

  // Post 모드 (post가 있는 경우)
  return (
    <div className="flex-1 min-w-[128px]">
      <div className="border-b border-r flex flex-col">
        <div className="border-b-[0.5px] flex justify-center leading-7 text-sm font-semibold text-stroke-effect dot-pattern">
          <RelativeTime dateString={post.publishedAt} />
        </div>
        <div className="flex justify-center items-center py-4 sm:py-3">
          <Link
            href={`/posts/${post.slug}`}
            className="w-[106px] h-[106px] rounded-full border border-red-500 dark:border-red-400 block"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="104"
              height="104"
              viewBox="0 0 104 104"
              fill="none"
            >
              <defs>
                <path
                  id={`circle-${post.id}`}
                  d="M52 22.5C68.2924 22.5 81.5 35.7076 81.5 52C81.5 68.2924 68.2924 81.5 52 81.5C35.7076 81.5 22.5 68.2924 22.5 52C22.5 35.7076 35.7076 22.5 52 22.5Z"
                />
              </defs>
              <circle
                cx="52"
                cy="52"
                r="36"
                className="stroke-red-500 dark:stroke-red-400"
              />
              <text className="text-base font-regular stroke-white dark:stroke-black stroke-6">
                <textPath href={`#circle-${post.id}`}>
                  {post.title.length > 25
                    ? post.title.substring(0, 23) + "..."
                    : post.title}
                </textPath>
              </text>
              <text className="text-base font-regular fill-red-500 dark:fill-red-400">
                <textPath href={`#circle-${post.id}`}>
                  {post.title.length > 25
                    ? post.title.substring(0, 23) + "..."
                    : post.title}
                </textPath>
              </text>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
