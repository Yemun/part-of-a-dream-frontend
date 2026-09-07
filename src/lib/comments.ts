import {
  getSupabaseClient,
  Comment as SupabaseComment,
  CommentUpdate,
} from "./supabase";

// 댓글 데이터 접근은 Contentlayer와 분리해 둔다.
// 댓글 UI는 클라이언트 컴포넌트라, 이 모듈이 contentlayer/generated를 import하면
// 모든 글 본문(compiled MDX 포함)이 클라이언트 번들에 실린다.

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
        code: error.code,
      });
      return [];
    }

    return (data as unknown as SupabaseComment[]).map(convertSupabaseComment);
  } catch (error) {
    console.error("Error fetching comments:", {
      message: error instanceof Error ? error.message : "Unknown error",
      details: error instanceof Error ? error.stack : String(error),
      hint: "Check network connectivity and Supabase configuration",
      code: "",
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
  updates: CommentUpdate,
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
