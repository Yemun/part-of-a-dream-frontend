"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations('comments');
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!author.trim() || !email.trim() || !content.trim()) {
      alert(t('emailRequired'));
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
        alert(t('commentPosted'));
      } else {
        alert(t('commentPosted'));
        onCommentAdded(); // 실패 시 전체 리페치
      }
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert(t('commentPosted'));
      onCommentAdded(); // 에러 시에도 전체 리페치
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 p-6 rounded-2xl border border-black dot-pattern texture-filter dark:border-white">
      <h3 className="text-lg font-semibold mb-4 text-stroke-effect dark:text-white">
        {t('writeComment')}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder={t('name')}
            disabled={isSubmitting}
          />
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('email')}
            disabled={isSubmitting}
          />
        </div>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder={t('message')}
          disabled={isSubmitting}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? t('submit') + '...' : t('submit')}
          </Button>
        </div>
      </form>
    </div>
  );
}
