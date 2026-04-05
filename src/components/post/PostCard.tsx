"use client";

import { Link } from "@/i18n/routing";
import RelativeTime from "@/components/common/RelativeTime";
import { BlogPost } from "@/lib/content";
import { useState, useEffect, useRef } from "react";

interface PostCardProps {
  post: BlogPost;
  locale?: string;
  index?: number;
}

let hasAnimatedPostCards = false;
const savedTransforms = new Map<string, { transform: string; x: number }>();

export default function PostCard({ post, locale, index = 0 }: PostCardProps) {
  const [randomTransform, setRandomTransform] = useState("");
  const [translateX, setTranslateX] = useState(0);
  const isFirstLoad = useRef(!hasAnimatedPostCards);
  const circleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hasAnimatedPostCards = true;
  }, []);

  useEffect(() => {
    const saved = savedTransforms.get(post.slug);
    if (saved) {
      setRandomTransform(saved.transform);
      setTranslateX(saved.x);
      return;
    }

    const el = circleRef.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    const parentRect = parent.getBoundingClientRect();
    const circleRect = el.getBoundingClientRect();
    const maxX = (parentRect.width - circleRect.width) / 2;
    const x = Math.round(Math.random() * maxX * 2 - maxX);
    const radius = circleRect.width / 2;
    const rotate = Math.round((x / (2 * Math.PI * radius)) * 360);
    const transform = `translate(${x}px, 0px) rotate(${rotate}deg)`;
    savedTransforms.set(post.slug, { transform, x });

    if (isFirstLoad.current) {
      const delay = index * 100;
      setTimeout(() => {
        requestAnimationFrame(() => {
          setTranslateX(x);
          setRandomTransform(transform);
        });
      }, delay);
    } else {
      setTranslateX(x);
      setRandomTransform(transform);
    }
  }, [post]);

  return (
    <div className="-ml-px -mt-px border">
      <div
        className="text-sm text-center font-medium"
        style={{
          transform: `translateX(${translateX}px)`,
          ...(isFirstLoad.current && {
            transition: "transform 2s cubic-bezier(0.215, 0.61, 0.355, 1)",
          }),
        }}
      >
        <RelativeTime dateString={post.publishedAt} />
      </div>
      <div className="flex justify-center items-center p-2.5 border-t-[0.5px]">
        <div
          ref={circleRef}
          style={{
            transform: randomTransform || "translate(0px, 0px) rotate(0deg)",
            ...(isFirstLoad.current && {
              transition: "transform 2s cubic-bezier(0.215, 0.61, 0.355, 1)",
            }),
          }}
        >
          <Link
            href={`/posts/${post.slug}`}
            locale={locale}
            prefetch={true}
            className="group w-24 h-24 rounded-full outline-2 outline-red-500 dark:outline-red-400 flex items-center justify-center bg-white dark:bg-black hover:bg-red-500 dark:hover:bg-red-400 transition-colors"
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
                className="stroke-red-500 group-hover:stroke-white group-hover:stroke-2 dark:stroke-red-400 dark:group-hover:stroke-black transition-all"
              />
              {(() => {
                const displayTitle =
                  post.title.length > 25
                    ? post.title.substring(0, 23) + "..."
                    : post.title;
                return (
                  <>
                    <text
                      className="text-base font-semibold uppercase stroke-white dark:stroke-black stroke-6 group-hover:stroke-4 transition-all"
                      strokeLinejoin="round"
                    >
                      <textPath href={`#circle-${post.slug}`}>
                        {displayTitle}
                      </textPath>
                    </text>
                    <text className="text-base font-semibold uppercase fill-red-500 dark:fill-red-400">
                      <textPath href={`#circle-${post.slug}`}>
                        {displayTitle}
                      </textPath>
                    </text>
                  </>
                );
              })()}
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
