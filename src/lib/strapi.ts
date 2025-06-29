import axios from "axios";
import { revalidatePostPages } from "./actions";

// 간단한 메모리 캐시 (서버 사이드 렌더링용)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5분 캐시

const getCached = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  cache.delete(key);
  return null;
};

const setCache = <T>(key: string, data: T): void => {
  cache.set(key, { data: data as unknown, timestamp: Date.now() });
};

const strapi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337",
  timeout: 10000, // 10초 타임아웃으로 단축 (30초 → 10초)
  headers: {
    "Content-Type": "application/json",
  },
});

export interface BlogPost {
  id: number;
  documentId: string;
  slug: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  comments?: Comment[];
}

export interface Profile {
  id: number;
  documentId: string;
  title: string;
  biography: string;
  career: string;
  contact:
    | {
        email?: string;
        linkedin?: string;
        instagram?: string;
        github?: string;
        [key: string]: string | undefined;
      }
    | string
    | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Comment {
  id: number;
  documentId: string;
  author: string;
  email: string;
  content: string;
  blog: BlogPost;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  const cacheKey = "blog-posts";
  const cached = getCached<BlogPost[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await strapi.get<StrapiResponse<BlogPost[]>>(
      "/api/blogs?populate=*"
    );
    const posts = response.data.data;
    setCache(cacheKey, posts);
    return posts;
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
};

// 통합 API 호출로 포스트, 인접 포스트, 코멘트를 한 번에 가져오기
export const getPostWithDetails = async (
  slug: string
): Promise<{
  post: BlogPost | null;
  adjacentPosts: { previous: BlogPost | null; next: BlogPost | null };
  comments: Comment[];
}> => {
  const cacheKey = `post-details-${slug}`;
  const cached = getCached<{
    post: BlogPost | null;
    adjacentPosts: { previous: BlogPost | null; next: BlogPost | null };
    comments: Comment[];
  }>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // 포스트 데이터와 모든 포스트 목록을 병렬로 가져오기
    const [postResponse, allPostsResponse] = await Promise.all([
      strapi.get<StrapiResponse<BlogPost[]>>(
        `/api/blogs?filters[slug]=${slug}`
      ),
      strapi.get<StrapiResponse<BlogPost[]>>(
        "/api/blogs?fields[0]=id&fields[1]=slug&fields[2]=title&fields[3]=publishedAt&sort[0]=publishedAt:desc"
      ),
    ]);

    const post = postResponse.data.data[0] || null;
    const allPosts = allPostsResponse.data.data;

    if (!post) {
      const result = { post: null, adjacentPosts: { previous: null, next: null }, comments: [] };
      setCache(cacheKey, result);
      return result;
    }

    // 인접 포스트 찾기
    const currentIndex = allPosts.findIndex((p) => p.slug === slug);
    const adjacentPosts = {
      previous: currentIndex > 0 ? allPosts[currentIndex - 1] : null,
      next: currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null,
    };

    // 서버에서 댓글도 함께 가져오기 (API 비용 최적화)
    const comments = await getComments(post.documentId);

    const result = { post, adjacentPosts, comments };
    setCache(cacheKey, result);

    return result;
  } catch (error) {
    console.error("Error fetching post with details:", error);
    return { post: null, adjacentPosts: { previous: null, next: null }, comments: [] };
  }
};

export const getProfile = async (): Promise<Profile | null> => {
  const cacheKey = "profile";
  const cached = getCached<Profile>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await strapi.get<{ data: Profile }>(
      "/api/profile?populate=*",
      { timeout: 5000 } // 5초 타임아웃
    );
    const profile = response.data.data;
    setCache(cacheKey, profile);
    return profile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    // 캐시된 데이터가 있더라도 만료되었다면 null 반환
    return null;
  }
};

export const getComments = async (blogId: string): Promise<Comment[]> => {
  const cacheKey = `comments-${blogId}`;
  const cached = getCached<Comment[]>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    // Blog relation을 통해 댓글 가져오기 (5초 타임아웃)
    const response = await strapi.get<{ data: BlogPost }>(
      `/api/blogs/${blogId}?populate[comments][fields][0]=id&populate[comments][fields][1]=author&populate[comments][fields][2]=email&populate[comments][fields][3]=content&populate[comments][fields][4]=createdAt&populate[comments][fields][5]=approved&populate[comments][sort][0]=createdAt:desc`,
      { timeout: 5000 }
    );

    const blog = response.data.data;
    const comments = (blog?.comments || [])
      .filter((comment) => comment.approved === true)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
    setCache(cacheKey, comments);
    return comments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    // 에러 시 빈 배열 반환 (댓글 없음 상태)
    return [];
  }
};

export const createComment = async (commentData: {
  author: string;
  email: string;
  content: string;
  blog: string; // documentId를 받음
}): Promise<Comment | null> => {
  try {
    console.log("Creating comment with data:", commentData);
    
    // 여러 방식으로 관계 설정 시도
    let response;
    try {
      // 방법 1: documentId로 관계 설정
      response = await strapi.post<{ data: Comment }>("/api/comments", {
        data: {
          author: commentData.author,
          email: commentData.email,
          content: commentData.content,
          blog: {
            connect: [commentData.blog]
          },
          approved: true,
        },
      });
    } catch (connectError) {
      console.log("Connect method failed, trying direct reference:", connectError);
      
      // 방법 2: 직접 참조
      response = await strapi.post<{ data: Comment }>("/api/comments", {
        data: {
          author: commentData.author,
          email: commentData.email,
          content: commentData.content,
          blog: commentData.blog,
          approved: true,
        },
      });
    }
    
    const createdComment = response.data.data;
    console.log("Comment created successfully:", createdComment);
    
    // 캐시 무효화 - 관련된 캐시 키들을 삭제
    const cacheKeysToDelete = [];
    for (const [key] of cache) {
      if (key.includes(`post-details-`) || key === 'blog-posts') {
        cacheKeysToDelete.push(key);
      }
    }
    cacheKeysToDelete.forEach(key => cache.delete(key));
    console.log("Invalidated cache keys:", cacheKeysToDelete);
    
    // Next.js 캐시 재검증 - 모든 포스트 페이지와 홈페이지
    await revalidatePostPages();
    
    return createdComment;
  } catch (error) {
    console.error("Error creating comment:", error);
    if (error && typeof error === 'object' && 'response' in error) {
      console.error("API response error:", (error as unknown as { response?: { data: unknown } }).response?.data);
    }
    return null;
  }
};

export const updateComment = async (
  comment: Comment,
  commentData: {
    author: string;
    email: string;
    content: string;
  }
): Promise<Comment | null> => {
  try {
    // Try with documentId first (Strapi v4.6+)
    let response;
    try {
      response = await strapi.put<{ data: Comment }>(
        `/api/comments/${comment.documentId}`,
        {
          data: commentData,
        }
      );
    } catch (error: unknown) {
      // Fallback to id if documentId fails
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { status?: number } }).response?.status === 404
      ) {
        response = await strapi.put<{ data: Comment }>(
          `/api/comments/${comment.id}`,
          {
            data: commentData,
          }
        );
      } else {
        throw error;
      }
    }
    
    // 캐시 무효화
    const cacheKeysToDelete = [];
    for (const [key] of cache) {
      if (key.includes(`post-details-`) || key === 'blog-posts') {
        cacheKeysToDelete.push(key);
      }
    }
    cacheKeysToDelete.forEach(key => cache.delete(key));
    
    // Next.js 캐시 재검증
    await revalidatePostPages();
    
    return response.data.data;
  } catch (error) {
    console.error("Error updating comment:", error);
    return null;
  }
};

export const deleteComment = async (comment: Comment): Promise<boolean> => {
  try {
    // Try with documentId first (Strapi v4.6+)
    try {
      await strapi.delete(`/api/comments/${comment.documentId}`);
    } catch (error: unknown) {
      // Fallback to id if documentId fails
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { status?: number } }).response?.status === 404
      ) {
        await strapi.delete(`/api/comments/${comment.id}`);
      } else {
        throw error;
      }
    }
    
    // 캐시 무효화
    const cacheKeysToDelete = [];
    for (const [key] of cache) {
      if (key.includes(`post-details-`) || key === 'blog-posts') {
        cacheKeysToDelete.push(key);
      }
    }
    cacheKeysToDelete.forEach(key => cache.delete(key));
    
    // Next.js 캐시 재검증
    await revalidatePostPages();
    
    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    return false;
  }
};

export default strapi;
