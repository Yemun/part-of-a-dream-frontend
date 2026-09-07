"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Comment, getComments } from "@/lib/comments";
import CommentList from "@/components/comment/CommentList";
import CommentForm from "@/components/comment/CommentForm";
import CommentSkeleton from "@/components/comment/CommentSkeleton";

interface CommentSectionProps {
  postSlug: string;
  initialComments?: Comment[];
}

export default function CommentSection({
  postSlug,
  initialComments = [],
}: CommentSectionProps) {
  const t = useTranslations('comments');
  const tCommon = useTranslations('common');
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!postSlug) return;

    try {
      setError(null);
      setIsLoading(true);

      const fetchedComments = await getComments(postSlug);
      setComments(fetchedComments);
    } catch (error) {
      console.error("댓글 로딩 실패:", error);
      setError(t('errorLoadingComments'));
    } finally {
      setIsLoading(false);
    }
  }, [postSlug, t]);

  // 초기화는 한 번만 실행 - 중복 API 호출 방지
  useEffect(() => {
    if (hasInitialized) return;
    setHasInitialized(true);

    // 페이지가 정적 생성되므로 initialComments는 빌드 시점 스냅샷이다.
    // 첫 페인트는 그 값으로 즉시 그리고, 마운트 후 백그라운드로 최신 목록을 받아온다.
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postSlug]); // 의도적으로 의존성 제거하여 중복 API 호출 방지

  // 낙관적 업데이트를 위한 댓글 추가 핸들러
  const handleCommentAdded = useCallback((newComment?: Comment) => {
    if (newComment) {
      // 낙관적 업데이트: 즉시 UI에 반영
      setComments(prev => [...prev, newComment]);
    } else {
      // fallback: API 재호출 (에러 발생 시)
      fetchComments();
    }
  }, [fetchComments]);

  // 댓글 업데이트 핸들러 (수정/삭제 후)
  const handleCommentUpdated = useCallback(() => {
    fetchComments();
  }, [fetchComments]);

  // 보여줄 댓글이 이미 있으면 갱신 중에도 기존 목록을 유지한다
  if (isLoading && comments.length === 0) {
    return (
      <div className="pt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          {t('title')}
        </h3>
        <CommentSkeleton />
      </div>
    );
  }

  if (error && comments.length === 0) {
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
          {tCommon('retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="pt-8">
      <CommentList comments={comments} onCommentUpdated={handleCommentUpdated} />
      <CommentForm postSlug={postSlug} onCommentAdded={handleCommentAdded} />
    </div>
  );
}
