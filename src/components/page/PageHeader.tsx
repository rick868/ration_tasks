import React, { useState } from 'react';
import {
  Smile,
  Image as ImageIcon,
  Star,
  Lock,
  Unlock,
  History,
  Download,
  MoreHorizontal,
  Trash2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { IconPicker } from '../common/IconPicker';
import { CoverPicker } from '../common/CoverPicker';

export const PageHeader: React.FC = () => {
  const {
    activePage,
    workspace,
    updatePage,
    deletePage,
    duplicatePage,
    togglePinPage,
    setIsHistoryOpen,
    setIsExportOpen,
    saveStatus,
    isOffline,
  } = useWorkspace();

  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  if (!activePage) return null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePage(activePage.id, { title: e.target.value });
  };

  const formattedDate = new Date(activePage.updatedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="relative w-full">
      {/* Cover Image */}
      {activePage.coverUrl && (
        <div className="group relative h-48 sm:h-60 w-full overflow-hidden bg-[#ecece4] dark:bg-[#262622]">
          <img
            src={activePage.coverUrl}
            alt="Cover"
            className="h-full w-full object-cover"
            style={{ objectPosition: `center ${activePage.coverPosition || 50}%` }}
          />
          <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-sm p-1 rounded-lg">
            <button
              onClick={() => setShowCoverPicker(true)}
              className="rounded px-2.5 py-1 text-xs font-medium text-white hover:bg-white/20 transition-colors"
            >
              Change cover
            </button>
            <button
              onClick={() => updatePage(activePage.id, { coverUrl: null })}
              className="rounded px-2.5 py-1 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition-colors"
            >
              Remove
            </button>
          </div>
          {showCoverPicker && (
            <CoverPicker
              onSelect={(url) => updatePage(activePage.id, { coverUrl: url })}
              onClose={() => setShowCoverPicker(false)}
            />
          )}
        </div>
      )}

      {/* Top Header Bar matching Natural Tones header */}
      <header className="h-12 flex items-center justify-between px-6 border-b border-[#e5e5df] dark:border-[#363630] bg-[#f5f5f0]/70 dark:bg-[#1c1c1a]/70 backdrop-blur-sm">
        {/* Breadcrumb path */}
        <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#9c9c94]">
          <span className="text-[#5a5a40] dark:text-[#a4a485] font-medium">{workspace?.name || 'Workspace'}</span>
          <span className="opacity-50">/</span>
          <span className="text-[#2c2c2a] dark:text-[#f0f0ea] font-medium truncate max-w-[200px]">
            {activePage.title || 'Untitled'}
          </span>
        </div>

        {/* Status indicator & Actions */}
        <div className="flex items-center gap-3">
          {/* Saved Status Badge */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            {saveStatus === 'SAVING' ? (
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            ) : isOffline ? (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            ) : (
              <Check className="w-3 h-3 text-emerald-600" />
            )}
            <span>{isOffline ? 'Offline' : saveStatus === 'SAVING' ? 'Saving...' : 'Saved'}</span>
          </div>

          {/* Star / Favorite */}
          <button
            onClick={() => togglePinPage(activePage.id)}
            title={activePage.isPinned ? 'Remove from favorites' : 'Add to favorites'}
            className={`rounded p-1 text-[#5a5a40] dark:text-[#a4a485] hover:text-[#2c2c2a] dark:hover:text-[#f0f0ea] transition-colors ${
              activePage.isPinned ? 'text-amber-600 dark:text-amber-400' : ''
            }`}
          >
            <Star className="h-4 w-4" fill={activePage.isPinned ? 'currentColor' : 'none'} />
          </button>

          {/* History */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            title="Page Revision History"
            className="rounded p-1 text-[#5a5a40] dark:text-[#a4a485] hover:text-[#2c2c2a] dark:hover:text-[#f0f0ea] transition-colors"
          >
            <History className="h-4 w-4" />
          </button>

          {/* Export */}
          <button
            onClick={() => setIsExportOpen(true)}
            title="Export Page"
            className="rounded p-1 text-[#5a5a40] dark:text-[#a4a485] hover:text-[#2c2c2a] dark:hover:text-[#f0f0ea] transition-colors"
          >
            <Download className="h-4 w-4" />
          </button>

          {/* Options Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="rounded p-1 text-[#5a5a40] dark:text-[#a4a485] hover:text-[#2c2c2a] dark:hover:text-[#f0f0ea] transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-7 z-50 w-52 rounded-xl border border-[#e5e5df] dark:border-[#363630] bg-[#fcfcf9] dark:bg-[#1c1c1a] p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    duplicatePage(activePage.id);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#2c2c2a] dark:text-[#f0f0ea] hover:bg-[#ecece4] dark:hover:bg-[#2c2c28]"
                >
                  <Copy className="h-3.5 w-3.5" /> Duplicate
                </button>
                <button
                  onClick={() => {
                    updatePage(activePage.id, { isLocked: !activePage.isLocked });
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#2c2c2a] dark:text-[#f0f0ea] hover:bg-[#ecece4] dark:hover:bg-[#2c2c28]"
                >
                  {activePage.isLocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  {activePage.isLocked ? 'Unlock Document' : 'Lock Document'}
                </button>
                <div className="my-1 border-t border-[#e5e5df] dark:border-[#363630]" />
                <button
                  onClick={() => {
                    deletePage(activePage.id);
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
      </header>

      {/* Page Title & Metadata Header Container */}
      <div className="mx-auto max-w-4xl px-6 sm:px-10 pt-8 pb-4">
        {/* Quick Add Icon / Cover triggers */}
        <div className="flex items-center gap-3 mb-2">
          {!activePage.icon && (
            <button
              onClick={() => setShowIconPicker(true)}
              className="flex items-center gap-1.5 text-xs text-[#9c9c94] hover:text-[#5a5a40] dark:hover:text-[#c2c2a8] transition-colors"
            >
              <Smile className="h-3.5 w-3.5" /> Add icon
            </button>
          )}
          {!activePage.coverUrl && (
            <button
              onClick={() => setShowCoverPicker(true)}
              className="flex items-center gap-1.5 text-xs text-[#9c9c94] hover:text-[#5a5a40] dark:hover:text-[#c2c2a8] transition-colors"
            >
              <ImageIcon className="h-3.5 w-3.5" /> Add cover
            </button>
          )}
        </div>

        {/* Page Icon Display */}
        {activePage.icon && (
          <div className="relative mb-3 inline-block">
            <button
              onClick={() => setShowIconPicker((prev) => !prev)}
              className="text-5xl sm:text-6xl hover:scale-105 transition-transform inline-block"
              title="Change icon"
            >
              <span>{activePage.icon}</span>
            </button>

            {showIconPicker && (
              <IconPicker
                currentIcon={activePage.icon}
                onSelect={(emoji) => updatePage(activePage.id, { icon: emoji })}
                onClose={() => setShowIconPicker(false)}
              />
            )}
          </div>
        )}

        {/* Missing icon picker popup */}
        {!activePage.icon && showIconPicker && (
          <div className="relative mb-2">
            <IconPicker
              currentIcon={null}
              onSelect={(emoji) => updatePage(activePage.id, { icon: emoji })}
              onClose={() => setShowIconPicker(false)}
            />
          </div>
        )}

        {/* Missing cover picker popup */}
        {!activePage.coverUrl && showCoverPicker && (
          <div className="relative mb-2">
            <CoverPicker
              onSelect={(url) => updatePage(activePage.id, { coverUrl: url })}
              onClose={() => setShowCoverPicker(false)}
            />
          </div>
        )}

        {/* Title Input with Serif Italic Natural Tones Font */}
        <div className="relative mb-3">
          <input
            type="text"
            value={activePage.title}
            onChange={handleTitleChange}
            placeholder="Untitled Document"
            disabled={activePage.isLocked}
            className="w-full bg-transparent font-serif italic text-4xl sm:text-5xl text-[#2c2c2a] dark:text-[#f0f0ea] placeholder:text-[#9c9c94]/60 focus:outline-none leading-tight"
          />
        </div>

        {/* Metadata Row matching Natural Tones Design */}
        <div className="flex flex-wrap items-center gap-5 text-xs text-[#9c9c94] border-b border-[#e5e5df] dark:border-[#363630] pb-4">
          <div className="flex items-center gap-1.5">
            <span className="font-bold uppercase text-[10px] tracking-widest text-[#5a5a40] dark:text-[#a4a485]">
              Updated:
            </span>
            <span>Today, {formattedDate}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold uppercase text-[10px] tracking-widest text-[#5a5a40] dark:text-[#a4a485]">
              Storage:
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              Local Device (Offline-Ready)
            </span>
          </div>

          {activePage.isDatabase && (
            <div className="flex items-center gap-1.5">
              <span className="font-bold uppercase text-[10px] tracking-widest text-[#5a5a40] dark:text-[#a4a485]">
                View:
              </span>
              <span className="bg-[#ecece4] dark:bg-[#262622] text-[#5a5a40] dark:text-[#c2c2a8] px-2 py-0.5 rounded text-[10px] font-bold">
                Database Table
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
