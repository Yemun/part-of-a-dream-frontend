import { Link } from "@/i18n/routing";
import RelativeTime from "@/components/common/RelativeTime";
import { BlogPost } from "@/lib/content";
import { useMemo } from "react";

interface PostCardProps {
  post?: BlogPost;
  text?: string;
  opacity?: number;
  locale?: string; // 로케일을 props로 받기
}

// Generate stable random transform based on slug
function getStableTransform(slug: string): string {
  // Simple hash function to generate consistent random values from slug
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }

  // Use hash to generate pseudo-random but stable values
  const x = (hash % 12) - 6;
  const y = ((hash >> 8) % 12) - 6;
  const rotate = (hash >> 16) % 90;

  return `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
}

export default function PostCard({
  post,
  text,
  opacity = 1,
  locale,
}: PostCardProps) {
  // Generate stable transform from slug
  const randomTransform = useMemo(() => {
    if (!post) return "";
    return getStableTransform(post.slug);
  }, [post]);
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
          <div
            style={{
              transform: randomTransform,
            }}
          >
            <Link
              href={`/posts/${post.slug}`}
              locale={locale}
              prefetch={true}
              className="group w-[106px] h-[106px] rounded-full outline-2 outline-red-500 dark:outline-red-400 flex items-center justify-center bg-white dark:bg-black hover:bg-red-500 dark:hover:bg-red-400 transition-colors"
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
                    id={`circle-${post.slug}`}
                    d="M52 22.5C68.2924 22.5 81.5 35.7076 81.5 52C81.5 68.2924 68.2924 81.5 52 81.5C35.7076 81.5 22.5 68.2924 22.5 52C22.5 35.7076 35.7076 22.5 52 22.5Z"
                  />
                </defs>
                <circle
                  cx="52"
                  cy="52"
                  r="38"
                  className="stroke-red-500 group-hover:stroke-white group-hover:stroke-2 dark:stroke-red-400 dark:group-hover:stroke-black trasnistion-all"
                />
                <text
                  className="text-base font-semibold uppercase stroke-white dark:stroke-black stroke-6 group-hover:stroke-4 transition-all"
                  strokeLinejoin="round"
                >
                  <textPath href={`#circle-${post.slug}`}>
                    {post.title.length > 25
                      ? post.title.substring(0, 23) + "..."
                      : post.title}
                  </textPath>
                </text>
                <text className="text-base font-semibold uppercase fill-red-500 dark:fill-red-400">
                  <textPath href={`#circle-${post.slug}`}>
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
    </div>
  );
}
