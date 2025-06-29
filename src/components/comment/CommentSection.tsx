"use client";

import { useState, useEffect, useCallback } from "react";
import { Comment } from "@/lib/strapi";
import CommentList from "@/components/comment/CommentList";
import CommentForm from "@/components/comment/CommentForm";
import CommentSkeleton from "@/components/comment/CommentSkeleton";

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

      // 새로운 API 엔드포인트 사용 (더 빠름)
      const response = await fetch(`/api/comments/${blogId}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const fetchedComments = data.comments || [];

      setComments(fetchedComments);
      setLastFetchTime(Date.now());
      console.log(
        `Fetched ${
          fetchedComments.length
        } comments at ${new Date().toLocaleTimeString()}`
      );
    } catch (error) {
      console.error("댓글 로딩 실패:", error);
      setError("댓글을 불러오는 중 오류가 발생했습니다.");
      // Fallback 제거 - 빠른 실패로 사용자 경험 향상
    } finally {
      setIsLoading(false);
    }
  }, [blogId]);

  // 컴포넌트 마운트 시 댓글 로드 (초기 데이터가 없으므로)
  useEffect(() => {
    if (initialComments.length === 0) {
      // 초기 데이터가 없으면 즉시 로드
      fetchComments();
    } else {
      // 초기 데이터가 있으면 조금 지연 후 업데이트 확인
      const timer = setTimeout(() => {
        fetchComments();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [fetchComments, initialComments.length]);

  const handleCommentAdded = useCallback(() => {
    fetchComments();
  }, [fetchComments]);

  if (isLoading) {
    return (
      <div className="pt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          댓글
        </h3>
        <CommentSkeleton />
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
