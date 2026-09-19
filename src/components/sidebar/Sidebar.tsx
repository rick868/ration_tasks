import React, { useState } from 'react';
import {
  Search,
  Settings,
  Trash2,
  BookTemplate,
  Plus,
  Moon,
  Sun,
  PanelLeftClose,
  HardDrive,
  WifiOff,
  Wifi,
  Database,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Download,
  Laptop,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { PageTreeItem } from './PageTreeItem';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { SidebarCalendar } from './SidebarCalendar';

export const Sidebar: React.FC = () => {
  const {
    workspace,
    pages,
    sidebarOpen,
    setSidebarOpen,
    createPage,
    setIsSearchOpen,
    setIsSettingsOpen,
    setIsTemplatesOpen,
    setIsTrashOpen,
    setIsInstallOpen,
    theme,
    toggleTheme,
    isOffline,
  } = useWorkspace();

  const { isInstallable, isInstalled } = usePWAInstall();
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const [pagesOpen, setPagesOpen] = useState(true);

  if (!sidebarOpen) return null;

  const favoritePages = pages.filter((p) => p.isPinned && !p.deletedAt && !p.isArchived);
  const rootPages = pages.filter((p) => !p.parentId && !p.deletedAt && !p.isArchived);

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-[#e5e5df] dark:border-[#363630] bg-[#fcfcf9] dark:bg-[#171715] select-none text-[#2c2c2a] dark:text-[#f0f0ea]">
      {/* Top Workspace Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 bg-[#5a5a40] dark:bg-[#8c8c6d] rounded-lg flex items-center justify-center text-white dark:text-[#171715] font-serif italic text-xl shadow-xs shrink-0">
            R
          </div>
          <div className="truncate">
            <span className="font-serif italic text-lg tracking-tight text-[#2c2c2a] dark:text-[#f0f0ea]">
              {workspace?.name || 'Ration'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Dark / Light Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle dark and light mode"
            className="flex items-center justify-center rounded-md p-1.5 text-[#5a5a40] dark:text-[#a4a485] hover:bg-[#ecece4] dark:hover:bg-[#2c2c28] hover:text-[#2c2c2a] dark:hover:text-[#f0f0ea] transition-colors border border-transparent hover:border-[#dadad0] dark:hover:border-[#3c3c34]"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4 text-[#5a5a40] dark:text-[#a4a485]" />
            ) : (
              <Sun className="h-4 w-4 text-amber-400" />
            )}
          </button>

          <button
            onClick={() => setSidebarOpen(false)}
            title="Close sidebar"
            className="rounded-md p-1.5 text-[#9c9c94] hover:bg-[#ecece4] dark:hover:bg-[#2c2c28] hover:text-[#2c2c2a] dark:hover:text-[#f0f0ea] transition-colors"
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Search Action */}
      <div className="px-3 mb-2">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs bg-[#ecece4] dark:bg-[#262622] rounded-md border border-[#dadad0] dark:border-[#3c3c34] text-[#5a5a40] dark:text-[#c2c2a8] hover:bg-[#e2e2da] dark:hover:bg-[#30302a] transition-colors shadow-2xs"
        >
          <span className="flex items-center gap-2 font-medium">
            <Search className="w-3.5 h-3.5" />
            Search
          </span>
          <span className="text-[10px] text-[#9c9c94] font-mono">⌘K</span>
        </button>
      </div>

      {/* Quick Navigation Items */}
      <div className="px-2 space-y-0.5 mb-2">
        {/* Templates Gallery */}
        <button
          onClick={() => setIsTemplatesOpen(true)}
          className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium text-[#5a5a40] dark:text-[#c2c2a8] hover:bg-[#ecece4] dark:hover:bg-[#262622] transition-colors"
        >
          <span className="flex items-center gap-2">
            <BookTemplate className="h-3.5 w-3.5 text-[#5a5a40] dark:text-[#a4a485]" />
            <span>Templates Gallery</span>
          </span>
          <span className="rounded-full bg-[#5a5a40]/10 dark:bg-[#8c8c6d]/20 px-1.5 py-0.2 text-[9px] font-bold text-[#5a5a40] dark:text-[#a4a485]">
            12
          </span>
        </button>

        {/* Install & Download App */}
        <button
          onClick={() => setIsInstallOpen(true)}
          className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium text-[#5a5a40] dark:text-[#c2c2a8] hover:bg-[#ecece4] dark:hover:bg-[#262622] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Download className="h-3.5 w-3.5 text-[#5a5a40] dark:text-[#a4a485]" />
            <span>Download &amp; Install</span>
          </span>
          {isInstalled ? (
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">Ready</span>
          ) : (
            <span className="rounded bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 text-[9px] font-bold text-amber-800 dark:text-amber-300">
              PWA
            </span>
          )}
        </button>

        {/* Settings & Storage Health */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-[#5a5a40] dark:text-[#c2c2a8] hover:bg-[#ecece4] dark:hover:bg-[#262622] transition-colors"
        >
          <HardDrive className="h-3.5 w-3.5 text-[#5a5a40] dark:text-[#a4a485]" />
          <span>Storage &amp; Diagnostics</span>
        </button>

        {/* Trash */}
        <button
          onClick={() => setIsTrashOpen(true)}
          className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-[#9c9c94] hover:text-[#5a5a40] dark:hover:text-[#c2c2a8] hover:bg-[#ecece4] dark:hover:bg-[#262622] transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Trash Bin</span>
        </button>
      </div>

      <SidebarCalendar />

      {/* Pages Navigation Tree */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
        {/* Favorites section */}
        {favoritePages.length > 0 && (
          <div>
            <div
              onClick={() => setFavoritesOpen((prev) => !prev)}
              className="flex items-center justify-between px-2 py-1 text-[10px] uppercase tracking-widest text-[#9c9c94] font-bold cursor-pointer hover:text-[#5a5a40] dark:hover:text-[#c2c2a8]"
            >
              <span>Favorites</span>
              <ChevronDown
                className={`h-3 w-3 transform transition-transform ${
                  favoritesOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </div>
            {favoritesOpen && (
              <div className="mt-1 space-y-0.5">
                {favoritePages.map((page) => (
                  <PageTreeItem key={page.id} page={page} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Workspace Pages Section */}
        <div>
          <div className="flex items-center justify-between px-2 py-1 text-[10px] uppercase tracking-widest text-[#9c9c94] font-bold">
            <span
              onClick={() => setPagesOpen((prev) => !prev)}
              className="cursor-pointer hover:text-[#5a5a40] dark:hover:text-[#c2c2a8]"
            >
              Workspace
            </span>
            <button
              onClick={() => createPage()}
              title="Add page"
              className="rounded p-0.5 text-[#9c9c94] hover:bg-[#ecece4] dark:hover:bg-[#262622] hover:text-[#2c2c2a] dark:hover:text-[#f0f0ea]"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {pagesOpen && (
            <div className="mt-1 space-y-0.5">
              {rootPages.map((page) => (
                <PageTreeItem key={page.id} page={page} />
              ))}

              {rootPages.length === 0 && (
                <div className="px-3 py-2 text-xs text-[#9c9c94] italic">No documents yet</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer: Storage Health widget & Status */}
      <div className="mt-auto p-3 border-t border-[#e5e5df] dark:border-[#363630] bg-[#fcfcf9] dark:bg-[#171715]">
        <div className="flex items-center justify-between text-[11px] text-[#9c9c94] px-1 mb-2.5">
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-amber-500' : 'bg-emerald-600'}`} />
            {isOffline ? 'Offline Local' : 'Local-First Synced'}
          </span>
          <span className="font-mono text-[10px]">v1.0.2</span>
        </div>

        {/* Storage Health Box */}
        <div
          onClick={() => setIsSettingsOpen(true)}
          className="bg-[#ecece4] dark:bg-[#262622] rounded-lg p-2.5 cursor-pointer hover:bg-[#e2e2da] dark:hover:bg-[#2e2e28] transition-colors border border-[#dadad0]/60 dark:border-[#3c3c34]"
        >
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[#5a5a40] dark:text-[#a4a485] mb-1.5">
            <span>Storage Health</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">Optimal</span>
          </div>
          <div className="w-full bg-[#d8d8ce] dark:bg-[#383832] h-1.5 rounded-full mb-1.5 overflow-hidden">
            <div className="bg-[#5a5a40] dark:bg-[#8c8c6d] h-full w-1/4 rounded-full" />
          </div>
          <div className="text-[9px] text-[#9c9c94]">SQLite &bull; IndexedDB Local Engine</div>
        </div>
      </div>
    </aside>
  );
};
