import React, { useEffect } from 'react';
import { X, Trash2, RotateCcw } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const TrashModal: React.FC = () => {
  const { trashPages, isTrashOpen, setIsTrashOpen, restorePage, deletePage, refreshTrash } = useWorkspace();

  useEffect(() => {
    if (isTrashOpen) {
      refreshTrash();
    }
  }, [isTrashOpen, refreshTrash]);

  if (!isTrashOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-100">
      <div className="flex h-[70vh] w-full max-w-xl flex-col rounded-2xl border border-[#e5e5df] bg-[#fcfcf9] shadow-2xl dark:border-[#363630] dark:bg-[#1c1c1a] overflow-hidden text-[#2c2c2a] dark:text-[#f0f0ea]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e5e5df] px-6 py-4 dark:border-[#363630]">
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-rose-500" />
            <h3 className="font-serif italic text-lg text-[#2c2c2a] dark:text-[#f0f0ea]">
              Trash Bin ({trashPages.length})
            </h3>
          </div>
          <button
            onClick={() => setIsTrashOpen(false)}
            className="rounded p-1 text-[#9c9c94] hover:bg-[#ecece4] hover:text-[#2c2c2a] dark:hover:bg-[#2c2c28] dark:hover:text-[#f0f0ea]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Trash List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {trashPages.map((page) => {
            const deletedDate = page.deletedAt
              ? new Date(page.deletedAt).toLocaleDateString()
              : 'Recently archived';

            return (
              <div
                key={page.id}
                className="flex items-center justify-between rounded-xl border border-[#e5e5df] bg-white p-3 dark:border-[#363630] dark:bg-[#242421]"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="text-lg shrink-0">{page.icon || '📄'}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-[#2c2c2a] dark:text-[#f0f0ea] truncate">
                      {page.title || 'Untitled'}
                    </div>
                    <div className="text-[10px] text-[#9c9c94]">Deleted {deletedDate}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={async () => {
                      await restorePage(page.id);
                      setIsTrashOpen(false);
                    }}
                    className="flex items-center gap-1 rounded-md border border-[#dadad0] bg-[#ecece4] px-2.5 py-1 text-xs font-medium text-[#5a5a40] hover:bg-[#e2e2da] dark:border-[#3c3c34] dark:bg-[#2c2c28] dark:text-[#c2c2a8]"
                  >
                    <RotateCcw className="h-3 w-3" /> Restore
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`Permanently delete "${page.title || 'Untitled'}" and all its blocks?`)) {
                        await deletePage(page.id, false);
                      }
                    }}
                    className="rounded-md p-1 text-[#9c9c94] hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                    title="Permanently delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {trashPages.length === 0 && (
            <div className="py-16 text-center text-xs text-[#9c9c94]">
              <Trash2 className="h-8 w-8 mx-auto mb-2 text-[#dadad0] dark:text-[#363630]" />
              Trash is empty. All your local documents are safe.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
