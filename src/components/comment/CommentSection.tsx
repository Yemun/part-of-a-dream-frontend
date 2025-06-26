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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLastFetchTime] = useState<number>(Date.now());

  const fetchComments = useCallback(async () => {
    if (!blogId) return;

    try {
      setError(null);
      setIsLoading(true);
      const fetchedComments = await getComments(blogId);
      setComments(fetchedComments);
      setLastFetchTime(Date.now());
      console.log(`Fetched ${fetchedComments.length} comments at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error("댓글 로딩 실패:", error);
      setError("댓글을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [blogId]);

  // 컴포넌트 마운트 시 항상 최신 댓글 확인 (SSR 데이터가 오래될 수 있음)
  useEffect(() => {
    // 초기 댓글이 있어도 클라이언트에서 한번 더 확인
    const timer = setTimeout(() => {
      fetchComments();
    }, 100); // 짧은 지연으로 SSR 데이터를 먼저 보여준 후 업데이트
    
    return () => clearTimeout(timer);
  }, [fetchComments]);

  const handleCommentAdded = useCallback(() => {
    fetchComments();
  }, [fetchComments]);

  if (isLoading) {
    return (
      <div className="pt-8">
        <div className="text-center text-gray-500 dark:text-gray-400">
          댓글을 불러오는 중...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-8">
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
