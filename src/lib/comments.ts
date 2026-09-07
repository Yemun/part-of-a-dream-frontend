import type { Comment as SupabaseComment, CommentUpdate } from "./supabase";

// 댓글 데이터 접근은 Contentlayer 와도, supabase-js 와도 분리해 둔다.
// - 댓글 UI는 클라이언트 컴포넌트라, contentlayer/generated 를 끌어오면 모든 글 본문이 클라이언트 번들에 실린다.
// - supabase-js 는 185KB 인데 여기서 필요한 건 REST(PostgREST) 호출 네 개뿐이라 fetch 로 직접 부른다.
//   (빙고는 realtime 등 SDK 기능을 쓰므로 그대로 supabase-js 를 사용한다)

export interface Comment {
  id: string;
  documentId: string;
  author: string;
  email: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const TABLE = "comments";

const getConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  return { url: `${url}/rest/v1/${TABLE}`, key };
};

// PostgREST 호출. 쓰기 요청은 Prefer 헤더로 변경된 행을 돌려받는다
const request = async <T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  query: string,
  body?: unknown,
): Promise<T> => {
  const { url, key } = getConfig();
  const response = await fetch(`${url}${query}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(method !== "GET" && { Prefer: "return=representation" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`${method} ${TABLE} failed: ${response.status} ${await response.text()}`);
  }
  return (await response.json()) as T;
};

const convertSupabaseComment = (comment: SupabaseComment): Comment => ({
  id: comment.id,
  documentId: comment.post_slug,
  author: comment.author_name,
  email: comment.author_email,
  content: comment.content,
  createdAt: comment.created_at,
  updatedAt: comment.updated_at,
});

// 특정 포스트의 댓글 가져오기
export const getComments = async (postSlug: string): Promise<Comment[]> => {
  try {
    const rows = await request<SupabaseComment[]>(
      "GET",
      `?select=*&post_slug=eq.${encodeURIComponent(postSlug)}&order=created_at.asc`,
    );
    return rows.map(convertSupabaseComment);
  } catch (error) {
    console.error("Error fetching comments:", error);
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
    const [row] = await request<SupabaseComment[]>("POST", "", {
      post_slug: commentData.postSlug,
      author_name: commentData.authorName,
      author_email: commentData.authorEmail,
      content: commentData.content,
    });
    return row ? convertSupabaseComment(row) : null;
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
    const [row] = await request<SupabaseComment[]>(
      "PATCH",
      `?id=eq.${encodeURIComponent(commentId)}`,
      updates,
    );
    return row ? convertSupabaseComment(row) : null;
  } catch (error) {
    console.error("Error updating comment:", error);
    return null;
  }
};

// 댓글 삭제 함수
export const deleteComment = async (commentId: string): Promise<boolean> => {
  try {
    await request<SupabaseComment[]>(
      "DELETE",
      `?id=eq.${encodeURIComponent(commentId)}`,
    );
    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    return false;
  }
};
