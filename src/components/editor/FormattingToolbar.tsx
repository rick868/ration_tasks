import React from 'react';
import { Bold, Italic, Strikethrough, Code, Link as LinkIcon } from 'lucide-react';

interface FormattingToolbarProps {
  position: { top: number; left: number };
  onFormat: (command: string, value?: string) => void;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({ position, onFormat }) => {
  return (
    <div
      style={{ top: `${position.top - 42}px`, left: `${position.left}px` }}
      className="fixed z-50 flex items-center gap-0.5 rounded-lg border border-stone-200 bg-white p-1 shadow-xl dark:border-stone-700 dark:bg-stone-900 animate-in fade-in zoom-in-95 duration-75"
    >
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          onFormat('bold');
        }}
        className="rounded p-1 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-3.5 w-3.5" />
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          onFormat('italic');
        }}
        className="rounded p-1 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-3.5 w-3.5" />
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          onFormat('strikeThrough');
        }}
        className="rounded p-1 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
        title="Strikethrough"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          onFormat('code');
        }}
        className="rounded p-1 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
        title="Inline Code"
      >
        <Code className="h-3.5 w-3.5" />
      </button>
      <div className="h-4 w-px bg-stone-200 dark:bg-stone-700 mx-1" />
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          const url = prompt('Enter link URL:');
          if (url) onFormat('createLink', url);
        }}
        className="rounded p-1 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
        title="Link (Ctrl+K)"
      >
        <LinkIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
