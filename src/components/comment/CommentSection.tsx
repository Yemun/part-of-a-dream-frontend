"use client";

import { useState, useEffect, useCallback } from "react";
import { getComments, Comment } from "@/lib/strapi";
import CommentList from "@/components/comment/CommentList";
import CommentForm from "@/components/comment/CommentForm";

interface CommentSectionProps {
  blogId: string;
  initialComments?: Comment[];
}

export default function CommentSection({
  blogId,
  initialComments = [],
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isLoading, setIsLoading] = useState(false); // 초기 댓글이 있으면 로딩하지 않음
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!blogId) return;

    try {
      setError(null);
      setIsLoading(true);
      const fetchedComments = await getComments(blogId);
      setComments(fetchedComments);
    } catch (error) {
      console.error("댓글 로딩 실패:", error);
      setError("댓글을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [blogId]);

  // 초기 댓글이 없을 때만 서버에서 가져옴
  useEffect(() => {
    if (initialComments.length === 0) {
      fetchComments();
    }
  }, [fetchComments, initialComments.length]);

  const handleCommentAdded = useCallback(() => {
    fetchComments();
  }, [fetchComments]);

  if (isLoading) {
    return (
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-500 dark:text-gray-400">
          댓글을 불러오는 중...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-red-500 dark:text-red-400">
          {error}
        </div>
        <button
          onClick={() => {
            setIsLoading(true);
            setError(null);
            fetchComments();
          }}
          className="mt-2 text-center w-full text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="pt-8">
      <CommentList comments={comments} onCommentUpdated={handleCommentAdded} />
      <CommentForm blogId={blogId} onCommentAdded={handleCommentAdded} />
    </div>
  );
}
