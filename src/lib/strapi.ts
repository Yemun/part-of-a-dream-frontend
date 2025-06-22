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

export const getBlogPost = async (slug: string): Promise<BlogPost | null> => {
  try {
    const response = await strapi.get<StrapiResponse<BlogPost[]>>(
      `/api/blogs?filters[slug]=${slug}&populate=*`
    );
    return response.data.data[0] || null;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
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
        `/api/blogs?filters[slug]=${slug}&populate[comments][filters][approved][$eq]=true&populate[comments][sort][0]=createdAt:desc`
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

    const comments = post.comments || [];
    const result = { post, adjacentPosts, comments };
    setCache(cacheKey, result);

    return result;
  } catch (error) {
    console.error("Error fetching post with details:", error);
    return { post: null, adjacentPosts: { previous: null, next: null }, comments: [] };
  }
};

export const getAdjacentPosts = async (
  currentSlug: string
): Promise<{ previous: BlogPost | null; next: BlogPost | null }> => {
  try {
    const posts = await getBlogPosts();
    const sortedPosts = posts.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    const currentIndex = sortedPosts.findIndex(
      (post) => post.slug === currentSlug
    );

    return {
      previous: currentIndex > 0 ? sortedPosts[currentIndex - 1] : null,
      next:
        currentIndex < sortedPosts.length - 1
          ? sortedPosts[currentIndex + 1]
          : null,
    };
  } catch (error) {
    console.error("Error fetching adjacent posts:", error);
    return { previous: null, next: null };
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

export const getCommentsCount = async (blogId: string): Promise<number> => {
  try {
    // Lightweight API call to check comment count without fetching full data
    const response = await strapi.get<{ data: BlogPost }>(
      `/api/blogs/${blogId}?fields[0]=id&populate[comments][fields][0]=id&populate[comments][filters][approved][$eq]=true`
    );

    const blog = response.data.data;
    return blog?.comments?.length || 0;
  } catch (error) {
    console.error("Error fetching comments count:", error);
    return 0;
  }
};

export const getComments = async (blogId: string): Promise<Comment[]> => {
  try {
    // First check if there are any comments to avoid unnecessary data fetching
    const commentCount = await getCommentsCount(blogId);
    
    if (commentCount === 0) {
      return [];
    }

    // Only fetch full comment data if comments exist
    const response = await strapi.get<{ data: BlogPost }>(
      `/api/blogs/${blogId}?populate[comments][filters][approved][$eq]=true&populate[comments][sort][0]=createdAt:desc`
    );

    const blog = response.data.data;
    return blog?.comments || [];
  } catch (error) {
    console.error("Error fetching comments:", error);
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
    const response = await strapi.post<{ data: Comment }>("/api/comments", {
      data: {
        author: commentData.author,
        email: commentData.email,
        content: commentData.content,
        blog: commentData.blog,
        approved: true,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error creating comment:", error);
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
    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    return false;
  }
};

export default strapi;
