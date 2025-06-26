import axios from "axios";

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
  timeout: 30000, // 30초 타임아웃으로 증가
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
    // 포스트 데이터와 모든 포스트 목록을 병렬로 가져오기 (안전한 방식)
    const [postResponse, allPostsResponse] = await Promise.all([
      strapi.get<StrapiResponse<BlogPost[]>>(
        `/api/blogs?filters[slug]=${slug}&populate=comments`
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

    // 클라이언트 측에서 안전하게 댓글 처리
    const rawComments = post.comments || [];
    const comments = rawComments
      .filter((comment) => comment.approved === true)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    const result = { post, adjacentPosts, comments };
    setCache(cacheKey, result);

    return result;
  } catch (error) {
    console.error("Error fetching post with details:", error);
    return { post: null, adjacentPosts: { previous: null, next: null }, comments: [] };
  }
};

export const getProfile = async (): Promise<Profile | null> => {
  try {
    const response = await strapi.get<{ data: Profile }>(
      "/api/profile?populate=*"
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

export const getComments = async (blogId: string): Promise<Comment[]> => {
  try {
    // 먼저 간단한 방식으로 시도
    const response = await strapi.get<{ data: BlogPost }>(
      `/api/blogs/${blogId}?populate=comments`
    );

    const blog = response.data.data;
    const comments = blog?.comments || [];

    // 클라이언트 측에서 필터링 및 정렬 (안전한 fallback)
    return comments
      .filter((comment) => comment.approved === true)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  } catch (error) {
    console.error("Error fetching comments:", error);
    
    // 실패 시 더 간단한 방식으로 재시도
    try {
      const fallbackResponse = await strapi.get<{ data: BlogPost }>(
        `/api/blogs/${blogId}`
      );
      
      // 댓글 없이도 정상 응답이면 빈 배열 반환
      if (fallbackResponse.data.data) {
        return [];
      }
    } catch (fallbackError) {
      console.error("Fallback request also failed:", fallbackError);
    }
    
    return [];
  }
};

export const createComment = async (commentData: {
  author: string;
  email: string;
  content: string;
  blog: string;
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
    
    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    return false;
  }
};

export default strapi;
