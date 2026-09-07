import {
  allBlogPosts,
  allWorks,
  BlogPost as ContentlayerBlogPost,
  Work as ContentlayerWork,
} from "contentlayer/generated";
import { getComments, type Comment } from "./comments";

// 댓글 API는 ./comments 로 옮겼다 (클라이언트 번들에서 Contentlayer를 떼어내기 위함).
// 기존 import 경로 호환을 위해 서버 측에서 쓰이던 이름은 그대로 재노출한다.
export type { Comment } from "./comments";
export {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "./comments";

// BlogPost 인터페이스를 Contentlayer에 맞게 조정
export interface BlogPost {
  documentId: string;
  slug: string;
  title: string;
  content: string;
  publishedAt: string;
  description?: string;
  tags?: string[];
  locale?: string;
  comments?: Comment[];
  body: {
    raw: string;
    code: string;
  };
}

// Contentlayer 데이터를 우리 인터페이스에 맞게 변환하는 함수
const convertContentlayerPost = (post: ContentlayerBlogPost): BlogPost => {
  return {
    documentId: post.slug,
    slug: post.slug,
    title: post.title,
    content: post.body.raw,
    publishedAt: post.publishedAt,
    description: post.description,
    tags: post.tags,
    locale: post.locale || "ko", // 기본값은 한국어
    body: post.body,
    comments: [], // 댓글은 별도 처리
  };
};

export const getBlogPosts = async (locale?: string): Promise<BlogPost[]> => {
  try {
    let posts = allBlogPosts
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
      .map(convertContentlayerPost);

    // locale이 지정된 경우 해당 locale의 포스트만 필터링
    if (locale) {
      posts = posts.filter((post) => post.locale === locale);
    }

    return posts;
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
};

// ---------------------------------------------------------------------------
// Work (포트폴리오)
// ---------------------------------------------------------------------------

export interface WorkItem {
  slug: string;
  title: string;
  description?: string;
  category?: string;
  company?: string;
  role?: string;
  startDate: string;
  endDate: string | null;
  problem?: string[];
  impact?: string[];
  tags?: string[];
  product?: string;
  productDescription?: string;
  locale: string;
  content: string;
  body: {
    raw: string;
    code: string;
  };
}

// Obsidian에서 붙어오는 꼬리 공백(NBSP 포함) 제거
const trimList = (list?: string[]): string[] | undefined =>
  list?.map((item) => item.trim()).filter(Boolean);

const convertContentlayerWork = (work: ContentlayerWork): WorkItem => ({
  slug: work.slug,
  title: work.title,
  description: work.description,
  category: work.category,
  company: work.company,
  role: work.role,
  startDate: work.startDate,
  endDate: work.endDate ?? null,
  problem: trimList(work.problem),
  impact: trimList(work.impact),
  tags: trimList(work.tags),
  product: work.product,
  productDescription: work.productDescription,
  locale: work.locale || "ko",
  content: work.body.raw,
  body: work.body,
});

// 종료일 기준. 진행 중(endDate 없음)은 오늘로 간주해 맨 앞에 온다.
export const getWorkEndDate = (work: Pick<WorkItem, "endDate">): string =>
  work.endDate ?? new Date().toISOString();

const sortWorksByEnd = (works: WorkItem[]) =>
  works.sort((a, b) => {
    const byEnd =
      new Date(getWorkEndDate(b)).getTime() -
      new Date(getWorkEndDate(a)).getTime();
    if (byEnd !== 0) return byEnd;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

export const getWorks = async (locale?: string): Promise<WorkItem[]> => {
  try {
    const works = sortWorksByEnd(allWorks.map(convertContentlayerWork));
    if (!locale) return works;

    const localized = works.filter((work) => work.locale === locale);
    // 해당 locale 문서가 없으면 전체로 폴백 (영문 문서 미작성 시 /en 홈이 비지 않도록)
    return localized.length > 0 ? localized : works;
  } catch (error) {
    console.error("Error fetching works:", error);
    return [];
  }
};

export const getWorkBySlug = async (
  slug: string,
  locale?: string,
): Promise<WorkItem | null> => {
  try {
    const works = allWorks.map(convertContentlayerWork);
    const localized = locale
      ? works.find((work) => work.slug === slug && work.locale === locale)
      : undefined;
    return localized ?? works.find((work) => work.slug === slug) ?? null;
  } catch (error) {
    console.error("Error fetching work:", error);
    return null;
  }
};

export const getPostWithDetails = async (
  slug: string,
  locale?: string
): Promise<{
  post: BlogPost | null;
  adjacentPosts: { previous: BlogPost | null; next: BlogPost | null };
  comments: Comment[];
}> => {
  try {
    // Contentlayer에서 포스트 찾기 - locale이 지정된 경우 해당 locale의 포스트 우선 선택
    let contentlayerPost;
    if (locale) {
      contentlayerPost = allBlogPosts.find(
        (post) => post.slug === slug && (post.locale || "ko") === locale
      );
    }
    // locale이 지정되지 않았거나 해당 locale의 포스트가 없으면 첫 번째 포스트 선택
    if (!contentlayerPost) {
      contentlayerPost = allBlogPosts.find((post) => post.slug === slug);
    }

    if (!contentlayerPost) {
      return {
        post: null,
        adjacentPosts: { previous: null, next: null },
        comments: [],
      };
    }

    const post = convertContentlayerPost(contentlayerPost);

    // 동일한 locale의 포스트들만 필터링하여 날짜순 정렬
    const postsForAdjacent = await getBlogPosts(locale);

    // 인접 포스트 찾기 (같은 locale 내에서)
    const currentIndex = postsForAdjacent.findIndex((p) => p.slug === slug);
    const adjacentPosts = {
      previous: currentIndex > 0 ? postsForAdjacent[currentIndex - 1] : null,
      next:
        currentIndex < postsForAdjacent.length - 1
          ? postsForAdjacent[currentIndex + 1]
          : null,
    };

    // Supabase에서 댓글 가져오기 (환경 변수가 있을 때만)
    let comments: Comment[] = [];
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      try {
        comments = await getComments(slug);
      } catch (error) {
        console.error("Error loading comments:", error);
        comments = [];
      }
    } else {
      console.log("Supabase not configured, skipping comment loading");
    }

    return { post, adjacentPosts, comments };
  } catch (error) {
    console.error("Error fetching post with details:", error);
    return {
      post: null,
      adjacentPosts: { previous: null, next: null },
      comments: [],
    };
  }
};
