"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Comment, updateComment, deleteComment } from "@/lib/content";
import RelativeTime from "@/components/common/RelativeTime";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";

interface CommentListProps {
  comments: Comment[];
  onCommentUpdated: () => void;
}

export default function CommentList({
  comments,
  onCommentUpdated,
}: CommentListProps) {
  const t = useTranslations('comments');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [showAuthModal, setShowAuthModal] = useState<{
    commentId: string;
    action: "edit" | "delete";
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAuthSubmit = async (
    commentId: string,
    action: "edit" | "delete"
  ) => {
    const comment = comments.find((c) => c.id === commentId);
    if (!comment || !authEmail) return;
    
    if (comment.email !== authEmail) {
      alert(t('emailRequired'));
      return;
    }

    setShowAuthModal(null);
    setAuthEmail("");

    if (action === "edit") {
      setEditingComment(commentId);
      setEditContent(comment.content);
      setEditAuthor(comment.author);
      setEditEmail(comment.email);
    } else if (action === "delete") {
      if (confirm(t('confirmDelete'))) {
        setIsProcessing(true);
        const success = await deleteComment(commentId);
        if (success) {
          onCommentUpdated();
          alert(t('commentDeleted'));
        } else {
          alert(t('commentDeleted'));
        }
        setIsProcessing(false);
      }
    }
  };

  const handleEditSubmit = async (commentId: string) => {
    if (!editContent.trim() || !editAuthor.trim() || !editEmail.trim()) {
      alert(t('emailRequired'));
      return;
    }

    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return;

    setIsProcessing(true);
    const updatedComment = await updateComment(commentId, {
      author_name: editAuthor.trim(),
      author_email: editEmail.trim(),
      content: editContent.trim(),
    });

    if (updatedComment) {
      setEditingComment(null);
      setEditContent("");
      setEditAuthor("");
      setEditEmail("");
      onCommentUpdated();
    } else {
      alert(t('commentUpdated'));
    }
    setIsProcessing(false);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent("");
    setEditAuthor("");
    setEditEmail("");
  };

  const handleModalBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowAuthModal(null);
      setAuthEmail("");
    }
  };

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (!showAuthModal) return;
    if (e.key === "Escape") {
      setShowAuthModal(null);
      setAuthEmail("");
    } else if (e.key === "Enter" && authEmail) {
      handleAuthSubmit(showAuthModal.commentId, showAuthModal.action);
    }
  };

  if (comments.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">
          {t('title')} ({comments.length})
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-12 sm:py-20">
          {t('noComments')}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">
          {t('title')} ({comments.length})
        </h3>
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {comment.author}
                </span>
                <RelativeTime
                  dateString={comment.createdAt}
                  className="text-sm text-gray-500 dark:text-gray-400"
                />
              </div>
              <div>
                {editingComment === comment.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        type="text"
                        value={editAuthor}
                        onChange={(e) => setEditAuthor(e.target.value)}
                        placeholder={t('name')}
                        className="text-sm"
                      />
                      <Input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder={t('email')}
                        className="text-sm"
                      />
                    </div>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="text-sm"
                    />
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleEditSubmit(comment.id)}
                        disabled={isProcessing}
                        size="sm"
                      >
                        {isProcessing ? t('save') + '...' : t('save')}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleCancelEdit}
                        disabled={isProcessing}
                        size="sm"
                      >
                        {t('cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>
                    <div className="flex space-x-1 text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <button
                        onClick={() =>
                          setShowAuthModal({
                            commentId: comment.id,
                            action: "edit",
                          })
                        }
                        disabled={isProcessing}
                        className="cursor-pointer disabled:opacity-50"
                      >
                        {t('edit')}
                      </button>
                      <span className="text-gray-300 dark:text-gray-600">
                        |
                      </span>
                      <button
                        onClick={() =>
                          setShowAuthModal({
                            commentId: comment.id,
                            action: "delete",
                          })
                        }
                        disabled={isProcessing}
                        className="cursor-pointer disabled:opacity-50"
                      >
                        {t('delete')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {showAuthModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
          onClick={handleModalBackdropClick}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90%]">
            <h3 className="text-lg font-semibold mb-2 dark:text-white">
              {showAuthModal.action === "edit" ? t('edit') : t('delete')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('emailRequired')}
            </p>
            <Input
              type="email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              onKeyDown={handleModalKeyDown}
              placeholder={t('email')}
              className="mb-4"
              autoFocus
              autoComplete="email"
            />
            <div className="flex space-x-3">
              <Button
                onClick={() =>
                  handleAuthSubmit(showAuthModal.commentId, showAuthModal.action)
                }
                disabled={!authEmail}
                className="flex-1"
              >
                {t('save')}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAuthModal(null);
                  setAuthEmail("");
                }}
                className="flex-1"
              >
                {t('cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
