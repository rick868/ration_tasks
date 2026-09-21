import React, { useState, useEffect } from 'react';
import { X, History, RotateCcw, Check, Clock } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { HistoryManager } from '../../storage/historyManager';
import { PageHistoryRecord, Block } from '../../types';

export const VersionHistoryModal: React.FC = () => {
  const { activePage, isHistoryOpen, setIsHistoryOpen, updateBlocks, refreshPages } = useWorkspace();
  const [revisions, setRevisions] = useState<PageHistoryRecord[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<PageHistoryRecord | null>(null);
  const [previewBlocks, setPreviewBlocks] = useState<Block[]>([]);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    if (isHistoryOpen && activePage) {
      const loadHistory = async () => {
        const list = await HistoryManager.listRevisions(activePage.id);
        setRevisions(list);
        if (list.length > 0) {
          setSelectedRevision(list[0]);
          try {
            const data = JSON.parse(list[0].snapshotJson);
            setPreviewBlocks(data.blocks || []);
          } catch {
            // ignore
          }
        }
      };
      loadHistory();
      setRestored(false);
    }
  }, [isHistoryOpen, activePage]);

  const handleSelectRevision = (rev: PageHistoryRecord) => {
    setSelectedRevision(rev);
    try {
      const data = JSON.parse(rev.snapshotJson);
      setPreviewBlocks(data.blocks || []);
    } catch {
      setPreviewBlocks([]);
    }
  };

  const handleRestore = async () => {
    if (!selectedRevision || !activePage) return;
    if (confirm('Restore this revision? Your current page content will be replaced.')) {
      try {
        const data = JSON.parse(selectedRevision.snapshotJson);
        if (Array.isArray(data.blocks)) {
          await updateBlocks(activePage.id, data.blocks, true);
          setRestored(true);
          await refreshPages();
          setTimeout(() => setIsHistoryOpen(false), 800);
        }
      } catch (err) {
        alert('Could not restore revision: ' + (err as Error).message);
      }
    }
  };

  if (!isHistoryOpen || !activePage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-100">
      <div className="flex h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-[#e5e5df] bg-[#fcfcf9] shadow-2xl dark:border-[#363630] dark:bg-[#1c1c1a] overflow-hidden text-[#2c2c2a] dark:text-[#f0f0ea]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e5e5df] px-6 py-4 dark:border-[#363630]">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[#5a5a40] dark:text-[#a4a485]" />
            <h3 className="font-serif italic text-lg text-[#2c2c2a] dark:text-[#f0f0ea]">
              Version Checkpoints — {activePage.title || 'Untitled'}
            </h3>
          </div>
          <button
            onClick={() => setIsHistoryOpen(false)}
            className="rounded p-1 text-[#9c9c94] hover:bg-[#ecece4] hover:text-[#2c2c2a] dark:hover:bg-[#2c2c28] dark:hover:text-[#f0f0ea]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Split Pane */}
        <div className="flex flex-1 overflow-hidden">
          {/* Revisions Sidebar */}
          <div className="w-72 border-r border-[#e5e5df] dark:border-[#363630] overflow-y-auto p-3 space-y-1.5 bg-[#f5f5f0]/60 dark:bg-[#171715]">
            <div className="px-2 py-1 text-[10px] font-bold text-[#9c9c94] uppercase tracking-wider">
              Snapshots ({revisions.length})
            </div>

            {revisions.map((rev) => {
              const isSelected = selectedRevision?.id === rev.id;
              const dateStr = new Date(rev.createdAt).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <button
                  key={rev.id}
                  onClick={() => handleSelectRevision(rev)}
                  className={`flex w-full flex-col gap-1 rounded-xl p-2.5 text-left transition-colors ${
                    isSelected
                      ? 'border border-[#dadad0] bg-[#ecece4] text-[#2c2c2a] dark:border-[#3c3c34] dark:bg-[#2c2c28] dark:text-[#f0f0ea]'
                      : 'hover:bg-[#ecece4]/60 text-[#5a5a40] dark:text-[#c2c2a8]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>{rev.changeSummary || 'Auto-saved Checkpoint'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#9c9c94]">
                    <Clock className="h-2.5 w-2.5" />
                    <span>{dateStr}</span>
                  </div>
                </button>
              );
            })}

            {revisions.length === 0 && (
              <div className="px-2 py-8 text-center text-xs text-[#9c9c94] italic">
                No checkpoints recorded yet
              </div>
            )}
          </div>

          {/* Revision Preview Canvas */}
          <div className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-[#242421]">
            <div className="flex items-center justify-between border-b border-[#e5e5df] px-6 py-3 dark:border-[#363630]">
              <span className="text-xs text-[#9c9c94]">
                Viewing historical state ({previewBlocks.length} blocks)
              </span>
              <button
                onClick={handleRestore}
                disabled={!selectedRevision}
                className="flex items-center gap-1.5 rounded-lg bg-[#5a5a40] dark:bg-[#8c8c6d] px-3 py-1.5 text-xs font-semibold text-white dark:text-[#1c1c1a] hover:bg-[#444430] dark:hover:bg-[#a4a485] transition-colors"
              >
                {restored ? <Check className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
                <span>{restored ? 'Restored!' : 'Restore This Version'}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {previewBlocks.map((b) => (
                <div
                  key={b.id}
                  className="rounded-lg border border-[#e5e5df]/60 bg-[#f5f5f0]/40 p-3 text-xs text-[#2c2c2a] dark:border-[#363630]/60 dark:bg-[#1c1c1a]/40 dark:text-[#f0f0ea]"
                >
                  <div className="text-[10px] uppercase font-bold text-[#9c9c94] mb-1">{b.type}</div>
                  <div>{b.content.text || '(empty)'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
