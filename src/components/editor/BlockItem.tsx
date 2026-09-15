import React, { useState, useRef, useEffect } from 'react';
import {
  GripVertical,
  Plus,
  MoreVertical,
  Trash2,
  Copy,
  ChevronRight,
  ChevronDown,
  Code as CodeIcon,
  CopyCheck,
  Download,
  FileText,
  ExternalLink,
  Upload,
  Sparkles,
} from 'lucide-react';
import { Block, BlockType } from '../../types';
import { FileStorageManager } from '../../storage/fileManager';
import { PageLinkChips } from './pageLinks';
import { useWorkspace } from '../../context/WorkspaceContext';

interface BlockItemProps {
  block: Block;
  index: number;
  totalBlocks: number;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAddAfter: (type?: BlockType) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onOpenSlashMenu: (pos: { top: number; left: number }) => void;
  workspaceId: string;
}

export const BlockItem: React.FC<BlockItemProps> = ({
  block,
  index,
  totalBlocks,
  onUpdate,
  onDelete,
  onDuplicate,
  onAddAfter,
  onMoveUp,
  onMoveDown,
  onOpenSlashMenu,
  workspaceId,
}) => {
  const { pages, activePage, selectPage } = useWorkspace();
  const [showMenu, setShowMenu] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [pageLinkMenu, setPageLinkMenu] = useState<{ top: number; left: number; query: string } | null>(null);
  const [pageLinkIndex, setPageLinkIndex] = useState(0);
  const [isEditingUrl, setIsEditingUrl] = useState(!block.content.url && (block.type === 'image' || block.type === 'bookmark'));
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  // Auto-resize textarea
  const autoResize = (target: HTMLTextAreaElement) => {
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (pageLinkMenu) {
      const matches = pages
        .filter((page) => page.id !== activePage?.id && !page.deletedAt && !page.isArchived)
        .filter((page) => page.title.toLowerCase().includes(pageLinkMenu.query.toLowerCase()))
        .slice(0, 8);

      if (e.key === 'ArrowDown' && matches.length > 0) {
        e.preventDefault();
        setPageLinkIndex((current) => (current + 1) % matches.length);
        return;
      }
      if (e.key === 'ArrowUp' && matches.length > 0) {
        e.preventDefault();
        setPageLinkIndex((current) => (current - 1 + matches.length) % matches.length);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setPageLinkMenu(null);
        return;
      }
      if (e.key === 'Enter' && matches[pageLinkIndex]) {
        e.preventDefault();
        insertPageLink(matches[pageLinkIndex], e.currentTarget);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey && block.type !== 'code') {
      e.preventDefault();
      onAddAfter();
      return;
    }

    if (e.key === 'Backspace' && (!block.content.text || block.content.text === '')) {
      if (block.type !== 'paragraph') {
        e.preventDefault();
        onUpdate({ type: 'paragraph' });
      } else if (totalBlocks > 1) {
        e.preventDefault();
        onDelete();
      }
    }
  };

  const insertPageLink = (page: (typeof pages)[number], target: HTMLTextAreaElement | HTMLInputElement) => {
    const value = target.value;
    const cursor = target.selectionStart ?? value.length;
    const beforeCursor = value.slice(0, cursor);
    const match = /(^|\s)\[\[([^\[\]]*)$/.exec(beforeCursor);
    if (!match) return;

    const start = match.index + match[1].length;
    const nextText = `${value.slice(0, start)}[[${page.title}]]${value.slice(cursor)}`;
    onUpdate({ content: { ...block.content, text: nextText } });
    setPageLinkMenu(null);
    setPageLinkIndex(0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const val = e.target.value;

    // Markdown shortcut trigger
    if (block.type === 'paragraph') {
      if (val === '# ') {
        onUpdate({ type: 'heading1', content: { ...block.content, text: '' } });
        return;
      }
      if (val === '## ') {
        onUpdate({ type: 'heading2', content: { ...block.content, text: '' } });
        return;
      }
      if (val === '### ') {
        onUpdate({ type: 'heading3', content: { ...block.content, text: '' } });
        return;
      }
      if (val === '- ' || val === '* ') {
        onUpdate({ type: 'bullet', content: { ...block.content, text: '' } });
        return;
      }
      if (val === '1. ') {
        onUpdate({ type: 'number', content: { ...block.content, text: '' } });
        return;
      }
      if (val === '[] ' || val === '[ ] ') {
        onUpdate({ type: 'todo', content: { ...block.content, text: '', checked: false } });
        return;
      }
      if (val === '> ') {
        onUpdate({ type: 'quote', content: { ...block.content, text: '' } });
        return;
      }
      if (val === '```') {
        onUpdate({ type: 'code', content: { ...block.content, text: '', language: 'typescript' } });
        return;
      }
      if (val === '---') {
        onUpdate({ type: 'divider', content: {} });
        onAddAfter('paragraph');
        return;
      }
    }

    if (val === '/') {
      const rect = e.target.getBoundingClientRect();
      onOpenSlashMenu({ top: rect.bottom + 6, left: rect.left });
    }

    onUpdate({ content: { ...block.content, text: val } });
    const cursor = e.target.selectionStart ?? val.length;
    const match = /(^|\s)\[\[([^\[\]]*)$/.exec(val.slice(0, cursor));
    if (match) {
      const rect = e.target.getBoundingClientRect();
      setPageLinkMenu({ top: rect.bottom + 6, left: rect.left, query: match[2] });
      setPageLinkIndex(0);
    } else {
      setPageLinkMenu(null);
    }
    if (e.target instanceof HTMLTextAreaElement) {
      autoResize(e.target);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const meta = await FileStorageManager.saveFile(workspaceId, file);
      onUpdate({
        content: {
          ...block.content,
          fileId: meta.id,
          fileName: meta.filename,
          fileSize: meta.byteSize,
          fileMime: meta.mimeType,
          text: meta.filename,
        },
      });
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleFileDownload = async () => {
    if (!block.content.fileId) return;
    const res = await FileStorageManager.createDownloadUrl(block.content.fileId);
    if (res) {
      const a = document.createElement('a');
      a.href = res.url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="group relative flex items-start gap-1 py-1 rounded-lg hover:bg-stone-50/60 dark:hover:bg-stone-800/30 transition-colors">
      {/* Block Hover Drag/Options Handle */}
      <div className="absolute -left-12 top-1 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onAddAfter()}
          title="Add block below"
          className="rounded p-1 text-stone-400 hover:bg-stone-200 hover:text-stone-700 dark:hover:bg-stone-700 dark:hover:text-stone-200"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="cursor-grab rounded p-1 text-stone-400 hover:bg-stone-200 hover:text-stone-700 dark:hover:bg-stone-700 dark:hover:text-stone-200"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>

          {showMenu && (
            <div className="absolute left-6 top-0 z-50 w-44 rounded-xl border border-stone-200 bg-white p-1 shadow-xl dark:border-stone-700 dark:bg-stone-900 animate-in fade-in duration-75">
              <button
                onClick={() => {
                  onDuplicate();
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                <Copy className="h-3 w-3" /> Duplicate
              </button>
              {index > 0 && (
                <button
                  onClick={() => {
                    onMoveUp();
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  Move up
                </button>
              )}
              {index < totalBlocks - 1 && (
                <button
                  onClick={() => {
                    onMoveDown();
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  Move down
                </button>
              )}
              <div className="my-1 border-t border-stone-100 dark:border-stone-800" />
              <button
                onClick={() => {
                  onDelete();
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Block Content Renderers */}
      <div className="w-full flex-1">
        {/* PARAGRAPH */}
        {block.type === 'paragraph' && (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={block.content.text || ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type '/' for commands..."
            rows={1}
            className="w-full resize-none bg-transparent py-0.5 text-stone-800 placeholder:text-stone-300 focus:outline-none dark:text-stone-200 dark:placeholder:text-stone-600 text-sm leading-relaxed"
          />
        )}

        {/* HEADING 1 */}
        {block.type === 'heading1' && (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={block.content.text || ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Heading 1"
            className="w-full bg-transparent pt-3 pb-1 text-2xl font-bold tracking-tight text-stone-900 placeholder:text-stone-300 focus:outline-none dark:text-stone-100 dark:placeholder:text-stone-600"
          />
        )}

        {/* HEADING 2 */}
        {block.type === 'heading2' && (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={block.content.text || ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Heading 2"
            className="w-full bg-transparent pt-2 pb-1 text-xl font-semibold tracking-tight text-stone-800 placeholder:text-stone-300 focus:outline-none dark:text-stone-200 dark:placeholder:text-stone-600"
          />
        )}

        {/* HEADING 3 */}
        {block.type === 'heading3' && (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={block.content.text || ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Heading 3"
            className="w-full bg-transparent pt-1.5 pb-0.5 text-base font-semibold text-stone-800 placeholder:text-stone-300 focus:outline-none dark:text-stone-200 dark:placeholder:text-stone-600"
          />
        )}

        {/* TODO */}
        {block.type === 'todo' && (
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={!!block.content.checked}
              onChange={(e) =>
                onUpdate({ content: { ...block.content, checked: e.target.checked } })
              }
              className="mt-1 h-4 w-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500 dark:border-stone-600 dark:bg-stone-800"
            />
            <textarea
              value={block.content.text || ''}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="To-do item"
              rows={1}
              className={`w-full resize-none bg-transparent py-0.5 text-sm focus:outline-none ${
                block.content.checked
                  ? 'text-stone-400 line-through dark:text-stone-500'
                  : 'text-stone-800 dark:text-stone-200'
              }`}
            />
          </div>
        )}

        {/* BULLET */}
        {block.type === 'bullet' && (
          <div className="flex items-start gap-2.5">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-700 dark:bg-stone-300" />
            <textarea
              value={block.content.text || ''}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="List item"
              rows={1}
              className="w-full resize-none bg-transparent py-0.5 text-sm text-stone-800 focus:outline-none dark:text-stone-200"
            />
          </div>
        )}

        {/* NUMBER */}
        {block.type === 'number' && (
          <div className="flex items-start gap-2">
            <span className="text-xs font-semibold text-stone-400 select-none min-w-[16px] text-right mt-0.5">
              {index + 1}.
            </span>
            <textarea
              value={block.content.text || ''}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Numbered item"
              rows={1}
              className="w-full resize-none bg-transparent py-0.5 text-sm text-stone-800 focus:outline-none dark:text-stone-200"
            />
          </div>
        )}

        {/* TOGGLE */}
        {block.type === 'toggle' && (
          <div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  onUpdate({ content: { ...block.content, isOpen: !block.content.isOpen } })
                }
                className="rounded p-0.5 text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700"
              >
                {block.content.isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <input
                type="text"
                value={block.content.text || ''}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Toggle header"
                className="w-full bg-transparent py-0.5 text-sm font-medium text-stone-800 focus:outline-none dark:text-stone-200"
              />
            </div>
            {block.content.isOpen && (
              <div className="ml-6 mt-1 border-l border-stone-200 pl-3 dark:border-stone-700 py-1">
                <textarea
                  value={block.content.caption || ''}
                  onChange={(e) =>
                    onUpdate({ content: { ...block.content, caption: e.target.value } })
                  }
                  placeholder="Toggle content body..."
                  rows={2}
                  className="w-full resize-none bg-transparent text-xs text-stone-600 focus:outline-none dark:text-stone-400"
                />
              </div>
            )}
          </div>
        )}

        {/* CALLOUT */}
        {block.type === 'callout' && (
          <div className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50/80 p-3.5 dark:border-stone-700/80 dark:bg-stone-800/40">
            <span className="text-xl select-none">{block.content.icon || '💡'}</span>
            <textarea
              value={block.content.text || ''}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Callout text..."
              rows={1}
              className="w-full resize-none bg-transparent text-sm leading-relaxed text-stone-800 focus:outline-none dark:text-stone-200"
            />
          </div>
        )}

        {/* QUOTE */}
        {block.type === 'quote' && (
          <div className="border-l-3 border-stone-900 pl-3 dark:border-stone-100 py-0.5">
            <textarea
              value={block.content.text || ''}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Empty quote"
              rows={1}
              className="w-full resize-none bg-transparent text-sm italic text-stone-700 focus:outline-none dark:text-stone-300"
            />
          </div>
        )}

        {/* CODE BLOCK */}
        {block.type === 'code' && (
          <div className="rounded-xl border border-stone-800 bg-stone-950 p-3 text-stone-100 shadow-sm">
            <div className="mb-2 flex items-center justify-between border-b border-stone-800 pb-1.5 text-xs">
              <select
                value={block.content.language || 'typescript'}
                onChange={(e) =>
                  onUpdate({ content: { ...block.content, language: e.target.value } })
                }
                className="rounded bg-stone-900 px-2 py-0.5 text-xs text-stone-300 focus:outline-none"
              >
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="rust">Rust</option>
                <option value="sql">SQL</option>
                <option value="json">JSON</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="bash">Bash / Shell</option>
              </select>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(block.content.text || '');
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="flex items-center gap-1 rounded bg-stone-900 px-2 py-0.5 text-xs text-stone-400 hover:text-white"
              >
                {copiedCode ? <CopyCheck className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copiedCode ? 'Copied' : 'Copy'}
              </button>
            </div>
            <textarea
              value={block.content.text || ''}
              onChange={handleChange}
              placeholder="// Write code here..."
              rows={3}
              className="w-full resize-none bg-transparent font-mono text-xs leading-relaxed text-emerald-300 focus:outline-none"
            />
          </div>
        )}

        {/* DIVIDER */}
        {block.type === 'divider' && (
          <div className="py-2">
            <hr className="border-stone-200 dark:border-stone-800" />
          </div>
        )}

        {/* IMAGE */}
        {block.type === 'image' && (
          <div>
            {block.content.url ? (
              <div className="relative group/img overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800">
                <img
                  src={block.content.url}
                  alt={block.content.caption || 'Image block'}
                  className="max-h-96 w-full object-contain bg-stone-100 dark:bg-stone-900"
                />
                <button
                  onClick={() => setIsEditingUrl(true)}
                  className="absolute top-2 right-2 rounded bg-black/60 px-2 py-1 text-xs text-white opacity-0 group-hover/img:opacity-100 transition-opacity"
                >
                  Edit Image
                </button>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-stone-200 p-4 text-center dark:border-stone-700 bg-stone-50 dark:bg-stone-800/30">
                <input
                  type="text"
                  placeholder="Paste image URL..."
                  value={block.content.url || ''}
                  onChange={(e) =>
                    onUpdate({ content: { ...block.content, url: e.target.value } })
                  }
                  className="w-full max-w-md rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs dark:border-stone-600 dark:bg-stone-900"
                />
              </div>
            )}
          </div>
        )}

        {/* FILE ATTACHMENT */}
        {block.type === 'file' && (
          <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800/50">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate max-w-xs">
                  {block.content.fileName || 'Attached Local File'}
                </div>
                <div className="text-[10px] text-stone-400">
                  {block.content.fileSize
                    ? `${(block.content.fileSize / 1024).toFixed(1)} KB • Local Storage Verified`
                    : 'Select a file to attach'}
                </div>
              </div>
            </div>
            {block.content.fileId ? (
              <button
                onClick={handleFileDownload}
                className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            ) : (
              <label className="flex items-center gap-1 cursor-pointer rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700">
                <Upload className="h-3.5 w-3.5" /> Browse File
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
            )}
          </div>
        )}

        {/* BOOKMARK */}
        {block.type === 'bookmark' && (
          <div className="rounded-xl border border-stone-200 bg-white p-3 dark:border-stone-700 dark:bg-stone-800/40 shadow-xs">
            {block.content.url ? (
              <a
                href={block.content.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span className="truncate">{block.content.url}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 ml-2 text-stone-400" />
              </a>
            ) : (
              <input
                type="text"
                placeholder="Paste web URL and press Enter..."
                value={block.content.url || ''}
                onChange={(e) =>
                  onUpdate({ content: { ...block.content, url: e.target.value } })
                }
                className="w-full bg-transparent text-xs text-stone-800 focus:outline-none dark:text-stone-200"
              />
            )}
          </div>
        )}

        {block.type !== 'code' && block.type !== 'divider' && (
          <PageLinkChips
            text={block.content.text || ''}
            pages={pages}
            currentPageId={activePage?.id || block.pageId}
            onNavigate={selectPage}
          />
        )}
      </div>

      {pageLinkMenu && (() => {
        const matches = pages
          .filter((page) => page.id !== activePage?.id && !page.deletedAt && !page.isArchived)
          .filter((page) => page.title.toLowerCase().includes(pageLinkMenu.query.toLowerCase()))
          .slice(0, 8);

        return (
          <div
            className="fixed z-[70] w-64 rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl dark:border-stone-700 dark:bg-stone-900"
            style={{ top: pageLinkMenu.top, left: pageLinkMenu.left }}
          >
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">Link to page</div>
            {matches.length > 0 ? matches.map((page, index) => (
              <button
                key={page.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => insertPageLink(page, inputRef.current!)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs ${
                  index === pageLinkIndex
                    ? 'bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100'
                    : 'text-stone-600 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800/60'
                }`}
              >
                <span>{page.icon || '📄'}</span>
                <span className="truncate">{page.title || 'Untitled'}</span>
              </button>
            )) : (
              <div className="px-2 py-2 text-xs text-stone-400">No matching pages</div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
