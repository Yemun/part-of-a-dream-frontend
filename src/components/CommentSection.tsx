"use client";

import { useState, useEffect } from "react";
import { getComments, Comment } from "@/lib/strapi";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";

interface CommentSectionProps {
  blogId: string;
}

export default function CommentSection({ blogId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const fetchedComments = await getComments(blogId);
      setComments(fetchedComments);
    } catch (error) {
      console.error("댓글 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogId]);

  const handleCommentAdded = () => {
    fetchComments();
  };

  if (isLoading) {
    return (
      <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
        <div className="text-center text-slate-500">댓글을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
      <CommentList comments={comments} onCommentUpdated={handleCommentAdded} />
      <CommentForm blogId={blogId} onCommentAdded={handleCommentAdded} />
    </div>
  );
}
