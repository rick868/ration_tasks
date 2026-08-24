import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Database, ArrowRight, Plus, HardDrive, BookTemplate } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { pageRepo } from '../../storage/repositories';
import { SearchResult } from '../../types';

export const QuickSearchModal: React.FC = () => {
  const {
    workspace,
    isSearchOpen,
    setIsSearchOpen,
    selectPage,
    createPage,
    setIsSettingsOpen,
    setIsTemplatesOpen,
  } = useWorkspace();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    let isCancelled = false;

    const doSearch = async () => {
      if (!query.trim() || !workspace) {
        setResults([]);
        return;
      }

      const res = await pageRepo.search(query, workspace.id);
      if (!isCancelled) {
        setResults(res);
        setSelectedIndex(0);
      }
    };

    const timer = setTimeout(doSearch, 100);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query, workspace]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (results.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (results.length || 1)) % (results.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        selectPage(results[selectedIndex].pageId);
        setIsSearchOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsSearchOpen(false);
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs pt-20 px-4 animate-in fade-in duration-100">
      <div className="w-full max-w-xl rounded-2xl border border-[#e5e5df] bg-[#fcfcf9] shadow-2xl dark:border-[#363630] dark:bg-[#1c1c1a] overflow-hidden text-[#2c2c2a] dark:text-[#f0f0ea]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-[#e5e5df] px-4 py-3.5 dark:border-[#363630]">
          <Search className="h-4 w-4 text-[#5a5a40] dark:text-[#a4a485] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search documents, tables, notes offline..."
            className="w-full bg-transparent text-sm text-[#2c2c2a] placeholder:text-[#9c9c94] focus:outline-none dark:text-[#f0f0ea]"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[#9c9c94] hover:text-[#2c2c2a]">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="rounded border border-[#dadad0] bg-[#ecece4] px-1.5 py-0.5 text-[10px] font-medium text-[#5a5a40] dark:border-[#3c3c34] dark:bg-[#2c2c28] dark:text-[#c2c2a8]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {results.length > 0 ? (
            <div className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#9c9c94]">
                Found {results.length} results
              </div>
              {results.map((res, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={`${res.pageId}_${idx}`}
                    onClick={() => {
                      selectPage(res.pageId);
                      setIsSearchOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors ${
                      isSelected
                        ? 'bg-[#ecece4] text-[#2c2c2a] dark:bg-[#2c2c28] dark:text-[#f0f0ea] font-medium'
                        : 'text-[#5a5a40] dark:text-[#c2c2a8] hover:bg-[#ecece4]/60 dark:hover:bg-[#262622]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-lg shrink-0">{res.icon || '📄'}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold truncate">{res.title}</div>
                        {res.snippet && (
                          <div className="text-[11px] text-[#9c9c94] truncate">{res.snippet}</div>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-[#9c9c94] shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          ) : query.trim() ? (
            <div className="py-12 text-center text-xs text-[#9c9c94]">
              No documents matched &ldquo;{query}&rdquo;
            </div>
          ) : (
            /* Quick actions when empty */
            <div className="p-2 space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#9c9c94]">
                Quick Actions
              </div>
              <button
                onClick={() => {
                  createPage();
                  setIsSearchOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-[#5a5a40] dark:text-[#c2c2a8] hover:bg-[#ecece4] dark:hover:bg-[#2c2c28]"
              >
                <Plus className="h-4 w-4 text-[#5a5a40] dark:text-[#a4a485]" />
                <span>Create New Document</span>
              </button>
              <button
                onClick={() => {
                  setIsTemplatesOpen(true);
                  setIsSearchOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-[#5a5a40] dark:text-[#c2c2a8] hover:bg-[#ecece4] dark:hover:bg-[#2c2c28]"
              >
                <BookTemplate className="h-4 w-4 text-[#5a5a40] dark:text-[#a4a485]" />
                <span>Browse Templates Gallery</span>
              </button>
              <button
                onClick={() => {
                  setIsSettingsOpen(true);
                  setIsSearchOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-[#5a5a40] dark:text-[#c2c2a8] hover:bg-[#ecece4] dark:hover:bg-[#2c2c28]"
              >
                <HardDrive className="h-4 w-4 text-[#5a5a40] dark:text-[#a4a485]" />
                <span>Storage Diagnostics &amp; Backups</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#e5e5df] bg-[#ecece4]/40 px-4 py-2 text-[10px] text-[#9c9c94] dark:border-[#363630] dark:bg-[#262622]/40">
          <span>Navigate with &uarr; &darr;</span>
          <span>Select with Enter</span>
        </div>
      </div>
    </div>
  );
};
