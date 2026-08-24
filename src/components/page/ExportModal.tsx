import React, { useState } from 'react';
import { X, Download, FileText, Code, FileCode, Check } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { BackupExportManager } from '../../storage/backupExport';

export const ExportModal: React.FC = () => {
  const { activePage, isExportOpen, setIsExportOpen } = useWorkspace();
  const [format, setFormat] = useState<'md' | 'html' | 'json'>('md');
  const [exported, setExported] = useState(false);

  if (!isExportOpen || !activePage) return null;

  const handleExport = async () => {
    try {
      const sanitizedName = (activePage.title || 'untitled').replace(/[^a-z0-9]/gi, '_').toLowerCase();

      if (format === 'md') {
        const res = await BackupExportManager.exportPageById(activePage.id);
        const md = res ? await BackupExportManager.exportPageToMarkdown(res.page, res.blocks) : '';
        BackupExportManager.triggerDownload(`${sanitizedName}.md`, md, 'text/markdown');
      } else if (format === 'html') {
        const html = await BackupExportManager.exportPageToHTML(activePage.id);
        BackupExportManager.triggerDownload(`${sanitizedName}.html`, html, 'text/html');
      } else if (format === 'json') {
        const json = await BackupExportManager.exportPageToJSON(activePage.id);
        BackupExportManager.triggerDownload(`${sanitizedName}.json`, json, 'application/json');
      }

      setExported(true);
      setTimeout(() => {
        setExported(false);
        setIsExportOpen(false);
      }, 1000);
    } catch (err) {
      alert('Export failed: ' + (err as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div className="w-full max-w-md rounded-2xl border border-[#e5e5df] bg-[#fcfcf9] p-6 shadow-2xl dark:border-[#363630] dark:bg-[#1c1c1a] text-[#2c2c2a] dark:text-[#f0f0ea]">
        <div className="flex items-center justify-between border-b border-[#e5e5df] pb-3 dark:border-[#363630]">
          <h3 className="font-serif italic text-lg text-[#2c2c2a] dark:text-[#f0f0ea]">Export Document</h3>
          <button
            onClick={() => setIsExportOpen(false)}
            className="rounded p-1 text-[#9c9c94] hover:bg-[#ecece4] hover:text-[#2c2c2a] dark:hover:bg-[#2c2c28] dark:hover:text-[#f0f0ea]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <p className="text-xs text-[#9c9c94]">
            Export <span className="font-semibold text-[#2c2c2a] dark:text-[#f0f0ea]">{activePage.title || 'Untitled'}</span> to standard portable file formats.
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setFormat('md')}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors ${
                format === 'md'
                  ? 'border-[#5a5a40] bg-[#ecece4] text-[#2c2c2a] dark:border-[#8c8c6d] dark:bg-[#2c2c28] dark:text-[#f0f0ea] font-semibold'
                  : 'border-[#e5e5df] hover:bg-[#ecece4]/50 dark:border-[#363630] dark:hover:bg-[#262622] text-[#5a5a40] dark:text-[#c2c2a8]'
              }`}
            >
              <FileText className="h-5 w-5 text-[#5a5a40] dark:text-[#a4a485]" />
              <span className="text-xs">Markdown</span>
              <span className="text-[10px] text-[#9c9c94]">.md</span>
            </button>

            <button
              onClick={() => setFormat('html')}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors ${
                format === 'html'
                  ? 'border-[#5a5a40] bg-[#ecece4] text-[#2c2c2a] dark:border-[#8c8c6d] dark:bg-[#2c2c28] dark:text-[#f0f0ea] font-semibold'
                  : 'border-[#e5e5df] hover:bg-[#ecece4]/50 dark:border-[#363630] dark:hover:bg-[#262622] text-[#5a5a40] dark:text-[#c2c2a8]'
              }`}
            >
              <FileCode className="h-5 w-5 text-[#5a5a40] dark:text-[#a4a485]" />
              <span className="text-xs">HTML</span>
              <span className="text-[10px] text-[#9c9c94]">.html</span>
            </button>

            <button
              onClick={() => setFormat('json')}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors ${
                format === 'json'
                  ? 'border-[#5a5a40] bg-[#ecece4] text-[#2c2c2a] dark:border-[#8c8c6d] dark:bg-[#2c2c28] dark:text-[#f0f0ea] font-semibold'
                  : 'border-[#e5e5df] hover:bg-[#ecece4]/50 dark:border-[#363630] dark:hover:bg-[#262622] text-[#5a5a40] dark:text-[#c2c2a8]'
              }`}
            >
              <Code className="h-5 w-5 text-[#5a5a40] dark:text-[#a4a485]" />
              <span className="text-xs">JSON</span>
              <span className="text-[10px] text-[#9c9c94]">.json</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5e5df] dark:border-[#363630]">
          <button
            onClick={() => setIsExportOpen(false)}
            className="rounded-lg px-3 py-1.5 text-xs text-[#9c9c94] hover:bg-[#ecece4] hover:text-[#2c2c2a] dark:hover:bg-[#2c2c28]"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-lg bg-[#5a5a40] dark:bg-[#8c8c6d] px-4 py-1.5 text-xs font-semibold text-white dark:text-[#1c1c1a] hover:bg-[#444430] dark:hover:bg-[#a4a485] transition-colors"
          >
            {exported ? <Check className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
            <span>{exported ? 'Exported!' : `Export ${format.toUpperCase()}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
