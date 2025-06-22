"use client";

import { useState } from "react";
import { Comment, updateComment, deleteComment } from "@/lib/strapi";
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
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [showAuthModal, setShowAuthModal] = useState<{
    commentId: number;
    action: "edit" | "delete";
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAuthSubmit = async (
    commentId: number,
    action: "edit" | "delete"
  ) => {
    const comment = comments.find((c) => c.id === commentId);
    if (!comment || !authEmail) return;

    if (comment.email !== authEmail) {
      alert("이메일이 일치하지 않습니다.");
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
      if (confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
        setIsProcessing(true);
        const success = await deleteComment(comment);
        if (success) {
          onCommentUpdated();
        } else {
          alert("댓글 삭제에 실패했습니다.");
        }
        setIsProcessing(false);
      }
    }
  };

  const handleEditSubmit = async (commentId: number) => {
    if (!editContent.trim() || !editAuthor.trim() || !editEmail.trim()) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return;

    setIsProcessing(true);
    const updatedComment = await updateComment(comment, {
      author: editAuthor.trim(),
      email: editEmail.trim(),
      content: editContent.trim(),
    });

    if (updatedComment) {
      setEditingComment(null);
      setEditContent("");
      setEditAuthor("");
      setEditEmail("");
      onCommentUpdated();
    } else {
      alert("댓글 수정에 실패했습니다.");
    }
    setIsProcessing(false);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent("");
    setEditAuthor("");
    setEditEmail("");
  };

  const AuthModal = () => {
    if (!showAuthModal) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setShowAuthModal(null);
        setAuthEmail("");
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAuthModal(null);
        setAuthEmail("");
      } else if (e.key === "Enter" && authEmail) {
        handleAuthSubmit(showAuthModal.commentId, showAuthModal.action);
      }
    };

    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
        onClick={handleBackdropClick}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90%]">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">
            {showAuthModal.action === "edit" ? "댓글 수정" : "댓글 삭제"}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            작성 시 사용한 이메일을 입력해주세요.
          </p>
          <Input
            type="email"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="이메일 주소"
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
              확인
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowAuthModal(null);
                setAuthEmail("");
              }}
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (comments.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">
          댓글 ({comments.length})
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-12 sm:py-20">
          아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">
          댓글 ({comments.length})
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
                        placeholder="별명"
                        className="text-sm"
                      />
                      <Input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="이메일"
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
                        {isProcessing ? "저장 중..." : "저장"}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleCancelEdit}
                        disabled={isProcessing}
                        size="sm"
                      >
                        취소
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
                        수정
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
                        삭제
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <AuthModal />
    </>
  );
}
