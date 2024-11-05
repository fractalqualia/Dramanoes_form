'use client';
import { ThumbsUp } from "lucide-react";

interface NotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export function Notification({ message, isVisible, onClose }: NotificationProps) {
  if (!isVisible) return null;

  // Auto-hide after 3 seconds
  setTimeout(onClose, 3000);

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 bg-green-100 border border-green-500 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <ThumbsUp className="h-5 w-5" />
        <p className="font-medium">{message}</p>
      </div>
      <button onClick={onClose} className="text-green-700 hover:text-green-900">
        ×
      </button>
    </div>
  );
}