import React, { useEffect } from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { Sidebar } from './components/sidebar/Sidebar';
import { PageHeader } from './components/page/PageHeader';
import { BlockEditor } from './components/editor/BlockEditor';
import { DatabaseView } from './components/database/DatabaseView';
import { QuickSearchModal } from './components/search/QuickSearchModal';
import { StorageSettingsModal } from './components/settings/StorageSettingsModal';
import { VersionHistoryModal } from './components/history/VersionHistoryModal';
import { TrashModal } from './components/sidebar/TrashModal';
import { TemplatesModal } from './components/templates/TemplatesModal';
import { ExportModal } from './components/page/ExportModal';
import { InstallAppModal } from './components/install/InstallAppModal';
import {
  PanelLeft,
  Plus,
  Search,
  BookTemplate,
  Sparkles,
  FolderOpen,
  ArrowRight,
  Download,
  Moon,
  Sun,
} from 'lucide-react';

const WorkspaceMain: React.FC = () => {
  const {
    activePage,
    sidebarOpen,
    setSidebarOpen,
    createPage,
    setIsSearchOpen,
    setIsTemplatesOpen,
    isInstallOpen,
    setIsInstallOpen,
    theme,
    toggleTheme,
  } = useWorkspace();

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f5f5f0] dark:bg-[#1c1c1a] text-[#2c2c2a] dark:text-[#f0f0ea] font-sans antialiased">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Document / Workspace Canvas */}
      <main className="flex flex-1 flex-col h-full overflow-y-auto relative bg-[#f5f5f0] dark:bg-[#1c1c1a]">
        {/* Floating Top Nav if Sidebar is Collapsed */}
        {!sidebarOpen && (
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[#e5e5df] dark:border-[#363630] bg-[#f5f5f0]/85 dark:bg-[#1c1c1a]/85 px-4 py-2.5 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(true)}
                title="Expand sidebar"
                className="rounded-lg p-1.5 text-[#5a5a40] dark:text-[#a4a485] hover:bg-[#ecece4] dark:hover:bg-[#2c2c28] hover:text-[#2c2c2a] dark:hover:text-[#f0f0ea] transition-colors"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-semibold text-[#2c2c2a] dark:text-[#f0f0ea] font-serif italic text-sm">
                {activePage?.title || 'Ration'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                className="rounded-md p-1.5 text-[#5a5a40] dark:text-[#a4a485] hover:bg-[#ecece4] dark:hover:bg-[#2c2c28] transition-colors"
              >
                {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5 text-amber-400" />}
              </button>
              <button
                onClick={() => setIsInstallOpen(true)}
                title="Install / Download App"
                className="flex items-center gap-1.5 rounded-md border border-[#dadad0] dark:border-[#42423b] bg-[#ecece4] dark:bg-[#2c2c28] px-2.5 py-1 text-xs text-[#5a5a40] dark:text-[#c2c2a8] hover:bg-[#e5e5df] dark:hover:bg-[#363630] transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Install</span>
              </button>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 rounded-md border border-[#dadad0] dark:border-[#42423b] bg-[#ecece4] dark:bg-[#2c2c28] px-2.5 py-1 text-xs text-[#5a5a40] dark:text-[#c2c2a8] hover:bg-[#e5e5df] dark:hover:bg-[#363630] transition-colors"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Search</span>
                <kbd className="rounded bg-white dark:bg-[#1c1c1a] px-1 text-[10px] text-[#9c9c94] border border-[#dadad0] dark:border-[#42423b]">⌘K</kbd>
              </button>
              <button
                onClick={() => createPage()}
                className="flex items-center gap-1 rounded-md bg-[#5a5a40] dark:bg-[#8c8c6d] px-3 py-1 text-xs font-medium text-white dark:text-[#1c1c1a] hover:bg-[#444430] dark:hover:bg-[#a4a485] shadow-2xs transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> New Page
              </button>
            </div>
          </div>
        )}

        {/* Page Content View */}
        {activePage ? (
          <div className="flex-1">
            <PageHeader />

            {/* If page is configured as full database table / board */}
            {activePage.isDatabase ? (
              <DatabaseView pageId={activePage.id} />
            ) : (
              <BlockEditor />
            )}
          </div>
        ) : (
          /* Empty Workspace Welcome State with Natural Tones */
          <div className="flex h-full flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
            <div className="w-14 h-14 bg-[#5a5a40] dark:bg-[#8c8c6d] rounded-2xl flex items-center justify-center text-white dark:text-[#1c1c1a] font-serif italic text-3xl shadow-sm mb-5">
              R
            </div>
            <h2 className="font-serif italic text-3xl sm:text-4xl text-[#2c2c2a] dark:text-[#f0f0ea]">
              Welcome to Ration
            </h2>
            <p className="mt-2.5 text-xs sm:text-sm text-[#9c9c94] dark:text-[#8c8c82] leading-relaxed">
              Your local-first productivity workspace. Every document, table, and attachment is stored securely on your device with SQLite &amp; IndexedDB.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => createPage()}
                className="flex items-center gap-2 rounded-lg bg-[#5a5a40] dark:bg-[#8c8c6d] px-4 py-2.5 text-xs font-semibold text-white dark:text-[#1c1c1a] hover:bg-[#444430] dark:hover:bg-[#a4a485] shadow-xs transition-all"
              >
                <Plus className="h-4 w-4" /> Create New Document
              </button>
              <button
                onClick={() => setIsTemplatesOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-[#dadad0] dark:border-[#42423b] bg-[#ecece4] dark:bg-[#2c2c28] px-4 py-2.5 text-xs font-semibold text-[#5a5a40] dark:text-[#c2c2a8] hover:bg-[#e5e5df] dark:hover:bg-[#363630] transition-colors"
              >
                <BookTemplate className="h-4 w-4" /> Browse Templates (12)
              </button>
              <button
                onClick={() => setIsInstallOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-[#dadad0] dark:border-[#42423b] bg-[#ecece4] dark:bg-[#2c2c28] px-4 py-2.5 text-xs font-semibold text-[#5a5a40] dark:text-[#c2c2a8] hover:bg-[#e5e5df] dark:hover:bg-[#363630] transition-colors"
              >
                <Download className="h-4 w-4" /> Install Desktop App
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Global Modals */}
      <QuickSearchModal />
      <StorageSettingsModal />
      <VersionHistoryModal />
      <TrashModal />
      <TemplatesModal />
      <ExportModal />
      <InstallAppModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <WorkspaceProvider>
      <WorkspaceMain />
    </WorkspaceProvider>
  );
}
