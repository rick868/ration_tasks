import React, { useState, useEffect, useRef } from 'react';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  CheckSquare,
  List,
  ListOrdered,
  ChevronRight,
  Quote,
  Code,
  Minus,
  AlertCircle,
  Image as ImageIcon,
  FileText,
  Table as TableIcon,
  LayoutGrid,
  Bookmark,
} from 'lucide-react';
import { BlockType } from '../../types';

export interface SlashItem {
  id: string;
  type: BlockType;
  title: string;
  description: string;
  category: 'Basic blocks' | 'Media & Files' | 'Database';
  icon: React.ReactNode;
  initialContent?: Record<string, unknown>;
}

const SLASH_COMMANDS: SlashItem[] = [
  {
    id: 'text',
    type: 'paragraph',
    title: 'Text',
    description: 'Just start writing with plain text.',
    category: 'Basic blocks',
    icon: <Type className="h-4 w-4 text-stone-600 dark:text-stone-300" />,
  },
  {
    id: 'h1',
    type: 'heading1',
    title: 'Heading 1',
    description: 'Big section heading.',
    category: 'Basic blocks',
    icon: <Heading1 className="h-4 w-4 text-stone-600 dark:text-stone-300" />,
  },
  {
    id: 'h2',
    type: 'heading2',
    title: 'Heading 2',
    description: 'Medium section heading.',
    category: 'Basic blocks',
    icon: <Heading2 className="h-4 w-4 text-stone-600 dark:text-stone-300" />,
  },
  {
    id: 'h3',
    type: 'heading3',
    title: 'Heading 3',
    description: 'Small subsection heading.',
    category: 'Basic blocks',
    icon: <Heading3 className="h-4 w-4 text-stone-600 dark:text-stone-300" />,
  },
  {
    id: 'todo',
    type: 'todo',
    title: 'To-do list',
    description: 'Track tasks with a checkbox.',
    category: 'Basic blocks',
    icon: <CheckSquare className="h-4 w-4 text-stone-600 dark:text-stone-300" />,
  },
  {
    id: 'bullet',
    type: 'bullet',
    title: 'Bulleted list',
    description: 'Create a simple bulleted list.',
    category: 'Basic blocks',
    icon: <List className="h-4 w-4 text-stone-600 dark:text-stone-300" />,
  },
  {
    id: 'number',
    type: 'number',
    title: 'Numbered list',
    description: 'Create a list with numbering.',
    category: 'Basic blocks',
    icon: <ListOrdered className="h-4 w-4 text-stone-600 dark:text-stone-300" />,
  },
  {
    id: 'toggle',
    type: 'toggle',
    title: 'Toggle list',
    description: 'Toggles can hide and show content inside.',
    category: 'Basic blocks',
    icon: <ChevronRight className="h-4 w-4 text-stone-600 dark:text-stone-300" />,
    initialContent: { isOpen: false },
  },
  {
    id: 'callout',
    type: 'callout',
    title: 'Callout',
    description: 'Make writing stand out with an icon.',
    category: 'Basic blocks',
    icon: <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
    initialContent: { icon: '💡', bgColor: 'bg-amber-50 text-amber-900 border-amber-200' },
  },
  {
    id: 'quote',
    type: 'quote',
    title: 'Quote',
    description: 'Capture a memorable quotation.',
    category: 'Basic blocks',
    icon: <Quote className="h-4 w-4 text-stone-600 dark:text-stone-300" />,
  },
  {
    id: 'divider',
    type: 'divider',
    title: 'Divider',
    description: 'Visually divide blocks with a line.',
    category: 'Basic blocks',
    icon: <Minus className="h-4 w-4 text-stone-600 dark:text-stone-300" />,
  },
  {
    id: 'code',
    type: 'code',
    title: 'Code',
    description: 'Capture code snippet with syntax highlighting.',
    category: 'Media & Files',
    icon: <Code className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
    initialContent: { language: 'typescript' },
  },
  {
    id: 'image',
    type: 'image',
    title: 'Image',
    description: 'Upload or embed with a link.',
    category: 'Media & Files',
    icon: <ImageIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
  },
  {
    id: 'file',
    type: 'file',
    title: 'File Attachment',
    description: 'Store binary files in local storage.',
    category: 'Media & Files',
    icon: <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />,
  },
  {
    id: 'bookmark',
    type: 'bookmark',
    title: 'Web Bookmark',
    description: 'Save a visual link preview.',
    category: 'Media & Files',
    icon: <Bookmark className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
  },
];

interface SlashMenuProps {
  position: { top: number; left: number };
  query: string;
  onSelect: (item: SlashItem) => void;
  onClose: () => void;
}

export const SlashMenu: React.FC<SlashMenuProps> = ({ position, query, onSelect, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredCommands = SLASH_COMMANDS.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (filteredCommands.length || 1)) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onSelect(filteredCommands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, selectedIndex, onSelect, onClose]);

  if (filteredCommands.length === 0) return null;

  return (
    <div
      ref={menuRef}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      className="fixed z-50 w-72 max-h-80 overflow-y-auto rounded-xl border border-stone-200 bg-white p-1.5 shadow-2xl dark:border-stone-700 dark:bg-stone-900 animate-in fade-in zoom-in-95 duration-75"
    >
      <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-stone-400 uppercase">
        Basic blocks & commands
      </div>
      {filteredCommands.map((item, idx) => {
        const isSelected = idx === selectedIndex;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            onMouseEnter={() => setSelectedIndex(idx)}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors ${
              isSelected
                ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/50'
            }`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800 shadow-xs">
              {item.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium truncate">{item.title}</div>
              <div className="text-[11px] text-stone-400 dark:text-stone-500 truncate">{item.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
