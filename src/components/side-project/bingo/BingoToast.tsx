"use client";

import { useEffect } from "react";

export interface ToastMessage {
  id: string;
  text: string;
  kind?: "bingo";
}

interface BingoToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function BingoToast({ toasts, onDismiss }: BingoToastProps) {
  return (
    <div className="bingo-toast-stack">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div className={`bingo-toast ${toast.kind === "bingo" ? "bingo" : ""}`}>
      {toast.kind === "bingo" ? (
        <>
          <strong>BINGO!</strong> {toast.text}
        </>
      ) : (
        toast.text
      )}
    </div>
  );
}
