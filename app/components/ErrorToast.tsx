"use client";

import { useEffect } from "react";

type Props = {
  message: string;
  onDismiss: () => void;
};

export default function ErrorToast({ message, onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  return (
    <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-lg bg-red-600 px-5 py-3 text-sm font-medium text-white shadow-lg">
      {message}
    </div>
  );
}