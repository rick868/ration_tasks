import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Star,
  Copy,
  Trash2,
  Table as TableIcon,
  FileText,
  Pin,
} from 'lucide-react';
import { Page } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';

interface PageTreeItemProps {
  page: Page;
  depth?: number;
}

export const PageTreeItem: React.FC<PageTreeItemProps> = ({ page, depth = 0 }) => {
  const {
    pages,
    activePageId,
    selectPage,
    createPage,
    deletePage,
    duplicatePage,
    togglePinPage,
  } = useWorkspace();

  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const childPages = pages.filter((p) => p.parentId === page.id && !p.deletedAt && !p.isArchived);
  const hasChildren = childPages.length > 0;
  const isActive = activePageId === page.id;

  const handleCreateSubpage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(true);
    await createPage(page.id);
  };

  return (
    <div>
      <div
        onClick={() => selectPage(page.id)}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        className={`group relative flex items-center justify-between rounded-md py-1.5 pr-2 text-xs transition-colors cursor-pointer ${
          isActive
            ? 'bg-[#ecece4] dark:bg-[#2c2c28] text-[#2c2c2a] dark:text-[#f0f0ea] font-medium shadow-2xs'
            : 'text-[#5a5a40] dark:text-[#c2c2a8] hover:bg-[#ecece4]/60 dark:hover:bg-[#262622]'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {/* Expand/Collapse arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((prev) => !prev);
            }}
            className={`rounded p-0.5 hover:bg-[#dadad0] dark:hover:bg-[#363630] ${
              hasChildren ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>

          {/* Page Icon or Type Icon */}
          <span className="shrink-0 text-sm">{page.icon || (page.isDatabase ? '📊' : '📄')}</span>

          <span className="truncate">{page.title || 'Untitled'}</span>
        </div>

        {/* Hover Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {page.isPinned && (
            <Pin className="h-3 w-3 text-[#5a5a40] dark:text-[#a4a485] shrink-0 mr-1" />
          )}

          <button
            onClick={handleCreateSubpage}
            title="Add subpage"
            className="rounded p-1 text-[#9c9c94] hover:bg-[#dadad0] dark:hover:bg-[#363630] hover:text-[#2c2c2a] dark:hover:text-[#f0f0ea]"
          >
            <Plus className="h-3 w-3" />
          </button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu((prev) => !prev);
              }}
              className="rounded p-1 text-[#9c9c94] hover:bg-[#dadad0] dark:hover:bg-[#363630] hover:text-[#2c2c2a] dark:hover:text-[#f0f0ea]"
            >
              <MoreHorizontal className="h-3 w-3" />
            </button>

            {showMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-6 z-50 w-44 rounded-xl border border-[#e5e5df] dark:border-[#363630] bg-[#fcfcf9] dark:bg-[#1c1c1a] p-1 shadow-lg animate-in fade-in zoom-in-95 duration-100"
              >
                <button
                  onClick={() => {
                    togglePinPage(page.id);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#2c2c2a] dark:text-[#f0f0ea] hover:bg-[#ecece4] dark:hover:bg-[#2c2c28]"
                >
                  <Star className="h-3.5 w-3.5 text-amber-500" />
                  {page.isPinned ? 'Unpin from favorites' : 'Pin to favorites'}
                </button>
                <button
                  onClick={() => {
                    duplicatePage(page.id);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#2c2c2a] dark:text-[#f0f0ea] hover:bg-[#ecece4] dark:hover:bg-[#2c2c28]"
                >
                  <Copy className="h-3.5 w-3.5" /> Duplicate
                </button>
                <div className="my-1 border-t border-[#e5e5df] dark:border-[#363630]" />
                <button
                  onClick={() => {
                    deletePage(page.id, true);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Move to Trash
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested Children */}
      {isOpen && hasChildren && (
        <div>
          {childPages.map((child) => (
            <PageTreeItem key={child.id} page={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
