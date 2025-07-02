"use client";

import { useState } from "react";
import { createComment, Comment } from "@/lib/content";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";

interface CommentFormProps {
  postSlug: string;
  onCommentAdded: (newComment?: Comment) => void;
}

export default function CommentForm({
  postSlug,
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
      const comment = await createComment({
        postSlug,
        authorName: author.trim(),
        authorEmail: email.trim(),
        content: content.trim(),
      });

      if (comment) {
        setAuthor("");
        setEmail("");
        setContent("");
        onCommentAdded(comment); // 생성된 댓글 객체를 전달하여 낙관적 업데이트
        alert("댓글이 성공적으로 등록되었습니다!");
      } else {
        alert("댓글 등록에 실패했습니다. 다시 시도해주세요.");
        onCommentAdded(); // 실패 시 전체 리페치
      }
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert("댓글 작성에 실패했습니다. 다시 시도해주세요.");
      onCommentAdded(); // 에러 시에도 전체 리페치
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 p-6 rounded-2xl border border-black dot-pattern dark:border-white">
      <h3 className="text-lg font-semibold mb-4 text-stroke-effect dark:text-white">
        댓글 남기기
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="text"
            id="author"
            // label="닉네임"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="닉네임을 입력하세요"
            disabled={isSubmitting}
          />
          <Input
            type="email"
            id="email"
            // label="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력하세요"
            disabled={isSubmitting}
          />
        </div>
        <Textarea
          id="content"
          // label="댓글"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="댓글을 입력하세요"
          disabled={isSubmitting}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? "등록 중..." : "댓글 등록"}
          </Button>
        </div>
      </form>
    </div>
  );
}
