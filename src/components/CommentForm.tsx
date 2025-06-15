"use client";

import { useState } from "react";
import { createComment } from "@/lib/strapi";

interface CommentFormProps {
  blogId: string;
  onCommentAdded: () => void;
}

export default function CommentForm({
  blogId,
  onCommentAdded,
}: CommentFormProps) {
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!author.trim() || !email.trim() || !content.trim()) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createComment({
        author: author.trim(),
        email: email.trim(),
        content: content.trim(),
        blog: blogId,
      });

      setAuthor("");
      setEmail("");
      setContent("");
      onCommentAdded();
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert("댓글 작성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-slate-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">댓글 남기기</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="author"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              닉네임
            </label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3 py-2 border bg-white border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="닉네임을 입력하세요"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              이메일
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border bg-white border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="이메일을 입력하세요"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            댓글
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border bg-white border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            placeholder="댓글을 입력하세요"
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors "
        >
          {isSubmitting ? "등록 중..." : "댓글 등록"}
        </button>
      </form>
    </div>
  );
}
