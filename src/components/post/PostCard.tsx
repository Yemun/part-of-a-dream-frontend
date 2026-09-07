"use client";

import { Link } from "@/i18n/routing";
import RelativeTime from "@/components/common/RelativeTime";
import type { BlogPost } from "@/lib/content";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePostCardAnimation } from "./PostCardAnimationProvider";

interface PostCardProps {
  post: Pick<BlogPost, "slug" | "title" | "publishedAt">;
  /** 링크 대상. 기본값은 블로그 글(`/posts/[slug]`) */
  href?: string;
  /** 원 위에 표시할 라벨. 기본값은 발행일(RelativeTime) */
  dateLabel?: ReactNode;
  index?: number;
}

const CIRCLE_SIZE = 96; // w-24
const LOAD_MS = 2000; // 첫 진입: 가운데에서 제자리로 굴러간다
const HOVER_MS = 1400; // PC hover: 새 랜덤 자리로. 천천히 굴러가야 쫓아가서 다시 잡을 수 있다
const EASE = "cubic-bezier(0.215, 0.61, 0.355, 1)";

// [-range, range] 안의 랜덤 x. avoid 를 주면 그 근처는 피해 눈에 띄게 움직이도록 한다
function randomX(range: number, avoid?: number) {
  let x = 0;
  for (let i = 0; i < 6; i++) {
    x = Math.round(Math.random() * range * 2 - range);
    if (avoid === undefined || Math.abs(x - avoid) >= range * 0.5) break;
  }
  return x;
}

export default function PostCard({
  post,
  href,
  dateLabel,
  index = 0,
}: PostCardProps) {
  const linkHref = href ?? `/posts/${post.slug}`;
  const { getX, setX } = usePostCardAnimation();
  const [circleX, setCircleX] = useState(0);
  const [labelX, setLabelX] = useState(0);
  const [transitionMs, setTransitionMs] = useState(LOAD_MS);
  const circleRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  // 첫 진입 굴림을 시작시키는 타이머. 시작 전에 hover 되면 취소하고 hover 이동으로 대체한다
  const loadTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // 원이 움직일 수 있는 최대 거리. transform 의 영향을 받지 않도록 layout 폭을 쓴다
  const measureRange = useCallback(() => {
    const el = circleRef.current;
    const parent = el?.parentElement;
    if (!el || !parent) return 0;
    return Math.max(0, (parent.clientWidth - el.offsetWidth) / 2);
  }, []);

  // 지금 화면에 보이는 x. 이동 중이면 목표 자리가 아니라 중간 지점을 돌려준다
  const visibleX = useCallback(() => {
    const el = circleRef.current;
    if (!el) return 0;
    const transform = getComputedStyle(el).transform;
    return transform === "none" ? 0 : new DOMMatrix(transform).m41;
  }, []);

  const moveTo = useCallback((x: number, ms: number) => {
    setTransitionMs(ms);
    setCircleX(x);

    // 라벨은 원(96px)보다 훨씬 넓어서 원과 같은 x를 그대로 쓰면
    // 카드 밖(연도 레일)까지 삐져나온다. 라벨 자신의 폭 기준으로 다시 가둔다.
    const label = labelRef.current;
    const card = cardRef.current;
    if (!label || !card) {
      setLabelX(x);
      return;
    }
    const max = (card.clientWidth - label.offsetWidth) / 2;
    setLabelX(max <= 0 ? 0 : Math.max(-max, Math.min(max, x)));
  }, []);

  // 마운트: 저장된 자리가 있으면 거기로, 없으면 랜덤 자리로 굴러간다
  useEffect(() => {
    const saved = getX(linkHref);
    const x = saved ?? randomX(measureRange());
    if (saved === undefined) setX(linkHref, x);

    const delay = saved === undefined ? index * 100 : 0;
    loadTimeout.current = setTimeout(() => {
      requestAnimationFrame(() => moveTo(x, LOAD_MS));
    }, delay);
    return () => clearTimeout(loadTimeout.current);
  }, [linkHref, index, getX, setX, measureRange, moveTo]);

  // PC: 원 위에 커서가 올라오면 새 랜덤 자리로 달아난다.
  // 굴러가는 도중에 다시 잡혀도 그 자리에서 방향을 바꿔 또 달아난다
  const handleMouseEnter = () => {
    // 터치 기기의 탭은 hover 를 흉내내므로 마우스 환경에서만
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    clearTimeout(loadTimeout.current);
    // 피할 기준은 목표 자리가 아니라 지금 보이는 자리 (커서가 거기에 있다)
    const x = randomX(measureRange(), Math.round(visibleX()));
    setX(linkHref, x);
    moveTo(x, HOVER_MS);
  };

  // 이동 거리만큼 굴러간 것처럼 보이도록 회전 (둘레 = π × 지름)
  const rotate = Math.round((circleX / (Math.PI * CIRCLE_SIZE)) * 360);
  const transition = `transform ${transitionMs}ms ${EASE}`;

  return (
    <div ref={cardRef} className="-ml-px -mt-px border">
      <div
        className="text-sm text-center font-medium"
        style={{ transform: `translateX(${labelX}px)`, transition }}
      >
        <span ref={labelRef} className="inline-block">
          {dateLabel ?? <RelativeTime dateString={post.publishedAt} />}
        </span>
      </div>
      <Link
        href={linkHref}
        prefetch={true}
        className="group flex justify-center items-center p-2.5 border-t-[0.5px]"
      >
        <div
          ref={circleRef}
          onMouseEnter={handleMouseEnter}
          style={{
            transform: `translate(${circleX}px, 0px) rotate(${rotate}deg)`,
            transition,
          }}
        >
          <div className="w-24 h-24 rounded-full outline-2 outline-red-500 dark:outline-red-400 flex items-center justify-center bg-white dark:bg-black group-hover:bg-red-500 dark:group-hover:bg-red-400 transition-colors">
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
                      className="text-base font-semibold tracking-tight uppercase stroke-white dark:stroke-black stroke-6 group-hover:stroke-4 transition-all"
                      strokeLinejoin="round"
                    >
                      <textPath href={`#circle-${post.slug}`}>
                        {displayTitle}
                      </textPath>
                    </text>
                    <text className="text-base font-semibold tracking-tight uppercase fill-red-500 dark:fill-red-400">
                      <textPath href={`#circle-${post.slug}`}>
                        {displayTitle}
                      </textPath>
                    </text>
                  </>
                );
              })()}
            </svg>
          </div>
        </div>
      </Link>
    </div>
  );
}
