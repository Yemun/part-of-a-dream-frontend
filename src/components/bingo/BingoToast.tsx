"use client";

import { useEffect } from "react";

export interface ToastMessage {
  id: string;
  text: string;
}

interface BingoToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function BingoToast({ toasts, onDismiss }: BingoToastProps) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
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
    <div className="bg-black dark:bg-white text-white dark:text-black text-sm px-4 py-3 rounded-md shadow-lg animate-slide-up">
      {toast.text}
    </div>
  );
}
