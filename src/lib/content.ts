import {
  allBlogPosts,
  BlogPost as ContentlayerBlogPost,
} from "contentlayer/generated";
import {
  getSupabaseClient,
  Comment as SupabaseComment,
  CommentUpdate,
} from "./supabase";

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

// Supabase Comment 인터페이스를 기존 Comment와 호환되도록 조정
export interface Comment {
  id: string;
  documentId: string;
  author: string;
  email: string;
  content: string;
  createdAt: string;
  updatedAt: string;
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
    let postsForAdjacent = allBlogPosts
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
      .map(convertContentlayerPost);

    // locale이 지정된 경우 해당 locale의 포스트만 사용
    if (locale) {
      postsForAdjacent = postsForAdjacent.filter((p) => p.locale === locale);
    }

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

// Supabase Comment 변환 함수
const convertSupabaseComment = (comment: SupabaseComment): Comment => {
  return {
    id: comment.id,
    documentId: comment.post_slug,
    author: comment.author_name,
    email: comment.author_email,
    content: comment.content,
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
  };
};

// 특정 포스트의 댓글 가져오기
export const getComments = async (postSlug: string): Promise<Comment[]> => {
  try {
    const supabase = getSupabaseClient();
    
    // Environment variables check
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Missing Supabase environment variables");
      return [];
    }
    
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_slug", postSlug)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase error fetching comments:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return [];
    }

    return (data as unknown as SupabaseComment[]).map(convertSupabaseComment);
  } catch (error) {
    console.error("Error fetching comments:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : String(error),
      hint: 'Check network connectivity and Supabase configuration',
      code: ''
    });
    return [];
  }
};

// 댓글 생성 함수
export const createComment = async (commentData: {
  postSlug: string;
  authorName: string;
  authorEmail: string;
  content: string;
}): Promise<Comment | null> => {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_slug: commentData.postSlug,
        author_name: commentData.authorName,
        author_email: commentData.authorEmail,
        content: commentData.content,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating comment:", error);
      return null;
    }

    return convertSupabaseComment(data as unknown as SupabaseComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return null;
  }
};

// 댓글 업데이트 함수
export const updateComment = async (
  commentId: string,
  updates: CommentUpdate
): Promise<Comment | null> => {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("comments")
      .update(updates)
      .eq("id", commentId)
      .select()
      .single();

    if (error) {
      console.error("Error updating comment:", error);
      return null;
    }

    return convertSupabaseComment(data as unknown as SupabaseComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return null;
  }
};

// 댓글 삭제 함수
export const deleteComment = async (commentId: string): Promise<boolean> => {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error("Error deleting comment:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    return false;
  }
};
