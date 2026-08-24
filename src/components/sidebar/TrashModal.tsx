import React, { useEffect, useState } from 'react';
import { X, Trash2, RotateCcw, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const TrashModal: React.FC = () => {
  const { trashPages, isTrashOpen, setIsTrashOpen, restorePage, deletePage, emptyTrash, refreshTrash } = useWorkspace();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmEmpty, setConfirmEmpty] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (isTrashOpen) {
      refreshTrash();
      setConfirmDeleteId(null);
      setConfirmEmpty(false);
    }
  }, [isTrashOpen, refreshTrash]);

  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  if (!isTrashOpen) return null;

  const handlePermanentDelete = async (id: string, title: string) => {
    await deletePage(id, false);
    setConfirmDeleteId(null);
    setNotification(`"${title || 'Untitled'}" and all associated binary blocks permanently deleted.`);
  };

  const handleEmptyTrash = async () => {
    const count = trashPages.length;
    await emptyTrash();
    setConfirmEmpty(false);
    setNotification(`Successfully purged ${count} item${count === 1 ? '' : 's'} and attachments from storage.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-100">
      <div className="flex h-[75vh] w-full max-w-xl flex-col rounded-2xl border border-[#e5e5df] bg-[#fcfcf9] shadow-2xl dark:border-[#363630] dark:bg-[#1c1c1a] overflow-hidden text-[#2c2c2a] dark:text-[#f0f0ea]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e5e5df] px-6 py-4 dark:border-[#363630]">
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-rose-500" />
            <h3 className="font-serif italic text-lg text-[#2c2c2a] dark:text-[#f0f0ea]">
              Trash Bin ({trashPages.length})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {trashPages.length > 0 && !confirmEmpty && (
              <button
                onClick={() => setConfirmEmpty(true)}
                className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Empty Trash
              </button>
            )}
            <button
              onClick={() => setIsTrashOpen(false)}
              className="rounded p-1 text-[#9c9c94] hover:bg-[#ecece4] hover:text-[#2c2c2a] dark:hover:bg-[#2c2c28] dark:hover:text-[#f0f0ea]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Empty Trash Confirmation Bar */}
        {confirmEmpty && (
          <div className="border-b border-rose-200 bg-rose-50/90 px-6 py-3 dark:border-rose-900/50 dark:bg-rose-950/60 flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-2 text-xs text-rose-800 dark:text-rose-200">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>
                <strong>Permanently delete all {trashPages.length} items?</strong> This cannot be undone.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setConfirmEmpty(false)}
                className="rounded-md px-2.5 py-1 text-xs font-medium text-[#5a5a40] hover:bg-black/5 dark:text-[#c2c2a8]"
              >
                Cancel
              </button>
              <button
                onClick={handleEmptyTrash}
                className="rounded-md bg-rose-600 px-3 py-1 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition-colors"
              >
                Yes, Empty All
              </button>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {notification && (
          <div className="border-b border-emerald-200 bg-emerald-50 px-6 py-2 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            {notification}
          </div>
        )}

        {/* Trash List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {trashPages.map((page) => {
            const deletedDate = page.deletedAt
              ? new Date(page.deletedAt).toLocaleDateString()
              : 'Recently archived';
            const isConfirmingThis = confirmDeleteId === page.id;

            return (
              <div
                key={page.id}
                className="flex flex-col gap-2 rounded-xl border border-[#e5e5df] bg-white p-3 dark:border-[#363630] dark:bg-[#242421] transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="text-lg shrink-0">{page.icon || '📄'}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-[#2c2c2a] dark:text-[#f0f0ea] truncate">
                        {page.title || 'Untitled'}
                      </div>
                      <div className="text-[10px] text-[#9c9c94]">Deleted {deletedDate}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={async () => {
                        await restorePage(page.id);
                        setNotification(`"${page.title || 'Untitled'}" restored to workspace.`);
                      }}
                      className="flex items-center gap-1 rounded-md border border-[#dadad0] bg-[#ecece4] px-2.5 py-1 text-xs font-medium text-[#5a5a40] hover:bg-[#e2e2da] dark:border-[#3c3c34] dark:bg-[#2c2c28] dark:text-[#c2c2a8] transition-colors"
                      title="Restore page back to workspace"
                    >
                      <RotateCcw className="h-3 w-3" /> Restore
                    </button>

                    <button
                      onClick={() => setConfirmDeleteId(page.id)}
                      className="flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50/60 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 transition-colors"
                      title="Permanently erase record, block data, and binary attachments"
                    >
                      <Trash2 className="h-3 w-3 text-rose-500" />
                      <span>Permanently Delete</span>
                    </button>
                  </div>
                </div>

                {/* Inline Confirmation for Single Item Delete */}
                {isConfirmingThis && (
                  <div className="mt-1 rounded-lg border border-rose-200 bg-rose-50/80 p-2.5 dark:border-rose-900/40 dark:bg-rose-950/40 flex items-center justify-between gap-3 animate-in fade-in duration-100">
                    <div className="flex items-center gap-2 text-[11px] text-rose-800 dark:text-rose-200">
                      <ShieldAlert className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                      <span>
                        Permanently delete <strong>&ldquo;{page.title || 'Untitled'}&rdquo;</strong> and purge all block data & binary attachments?
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded px-2 py-0.5 text-xs text-[#5a5a40] hover:bg-black/5 dark:text-[#c2c2a8]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(page.id, page.title || 'Untitled')}
                        className="rounded bg-rose-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition-colors"
                      >
                        Permanently Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {trashPages.length === 0 && (
            <div className="py-16 text-center text-xs text-[#9c9c94]">
              <Trash2 className="h-8 w-8 mx-auto mb-2 text-[#dadad0] dark:text-[#363630]" />
              Trash bin is empty. All active workspace pages are safe.
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="border-t border-[#e5e5df] bg-[#f5f5f0] px-6 py-2.5 text-[11px] text-[#9c9c94] dark:border-[#363630] dark:bg-[#161615] flex items-center justify-between">
          <span>⚡ Local-First: Permanent deletes instantly purge records from RAM and IndexedDB.</span>
          <span>{trashPages.length} item{trashPages.length === 1 ? '' : 's'} in bin</span>
        </div>
      </div>
    </div>
  );
};

