import React from 'react';
import { MessageCircle } from 'lucide-react';

interface FloatingChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  onClick,
  isOpen,
}) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-8 right-8 rounded-full shadow-lg transition-all duration-300 ease-out transform hover:scale-110 z-40 ${
        isOpen
          ? 'opacity-0 pointer-events-none scale-0'
          : 'opacity-100 scale-100'
      } hover:opacity-60 active:opacity-40`}
      aria-label="Open chat"
    >
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-600 rounded-full flex items-center justify-center hover:from-blue-600 hover:to-emerald-700 transition-all duration-200">
        <MessageCircle className="w-8 h-8 text-white" strokeWidth={1.5} />
      </div>
    </button>
  );
};
