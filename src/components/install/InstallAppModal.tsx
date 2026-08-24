import React, { useState } from 'react';
import {
  X,
  Download,
  Laptop,
  Smartphone,
  CheckCircle2,
  Share2,
  HardDrive,
  Globe,
  Zap,
  ArrowRight,
  FileDown,
  Sparkles,
  Shield,
  Layers,
  Monitor,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { BackupExportManager } from '../../storage/backupExport';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { workspace } = useWorkspace();
  const { isInstallable, isInstalled, triggerInstall } = usePWAInstall();
  const [activePlatform, setActivePlatform] = useState<'desktop' | 'ios' | 'android' | 'backup'>('desktop');
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const res = await triggerInstall();
    if (res === 'accepted') {
      onClose();
    }
  };

  const handleExportFullOfflineWorkspace = async () => {
    if (!workspace) return;
    try {
      const { data, filename } = await BackupExportManager.createBackupPackage(workspace.id);
      BackupExportManager.triggerDownload(filename, data, 'application/json');
      setDownloadMsg(`Offline package downloaded: ${filename}`);
      setTimeout(() => setDownloadMsg(null), 4000);
    } catch (err) {
      setDownloadMsg(`Download notice: ${(err as Error).message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-100">
      <div className="flex h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-[#e5e5df] bg-[#fcfcf9] shadow-2xl dark:border-[#363630] dark:bg-[#1c1c1a] overflow-hidden text-[#2c2c2a] dark:text-[#f0f0ea]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e5e5df] px-6 py-4 dark:border-[#363630]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#5a5a40] dark:bg-[#8c8c6d] flex items-center justify-center text-white dark:text-[#1c1c1a] font-serif italic text-lg font-bold shadow-xs">
              R
            </div>
            <div>
              <h3 className="font-serif italic text-lg text-[#2c2c2a] dark:text-[#f0f0ea]">
                Download &amp; Install Ration
              </h3>
              <p className="text-[11px] text-[#9c9c94]">
                Install as a standalone native app on Mac, Windows, Linux, iPad, or Android
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-[#9c9c94] hover:bg-[#ecece4] hover:text-[#2c2c2a] dark:hover:bg-[#2c2c28] dark:hover:text-[#f0f0ea] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick One-Click Action Banner */}
        <div className="border-b border-[#e5e5df] bg-[#ecece4]/50 px-6 py-4 dark:border-[#363630] dark:bg-[#262622]/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#2c2c2a] dark:text-[#f0f0ea]">
                  {isInstalled ? '✓ Ration is Running as Installed App' : 'Instant Desktop Installation (PWA)'}
                </span>
                <span className="rounded bg-[#5a5a40]/10 dark:bg-[#8c8c6d]/20 px-1.5 py-0.2 text-[10px] font-bold text-[#5a5a40] dark:text-[#a4a485]">
                  Zero Latency
                </span>
              </div>
              <p className="text-[11px] text-[#9c9c94] mt-0.5">
                Launches in dedicated window, works 100% offline, and saves directly to local storage.
              </p>
            </div>

            {isInstalled ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-4 w-4" /> Installed
              </div>
            ) : isInstallable ? (
              <button
                onClick={handleInstallClick}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#5a5a40] dark:bg-[#8c8c6d] px-4 py-2 text-xs font-semibold text-white dark:text-[#1c1c1a] hover:bg-[#444430] dark:hover:bg-[#a4a485] transition-all shadow-sm"
              >
                <Download className="h-3.5 w-3.5" /> Install App Now
              </button>
            ) : (
              <div className="text-[11px] text-[#5a5a40] dark:text-[#a4a485] font-medium bg-[#ecece4] dark:bg-[#2c2c28] px-3 py-1.5 rounded-lg border border-[#dadad0] dark:border-[#3c3c34]">
                See instructions below
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e5e5df] bg-[#f5f5f0]/40 px-6 dark:border-[#363630] dark:bg-[#171715]/40 gap-4 text-xs font-medium">
          <button
            onClick={() => setActivePlatform('desktop')}
            className={`flex items-center gap-1.5 py-2.5 border-b-2 transition-colors ${
              activePlatform === 'desktop'
                ? 'border-[#5a5a40] dark:border-[#8c8c6d] text-[#2c2c2a] dark:text-[#f0f0ea] font-semibold'
                : 'border-transparent text-[#9c9c94] hover:text-[#2c2c2a] dark:hover:text-[#f0f0ea]'
            }`}
          >
            <Laptop className="h-3.5 w-3.5" /> macOS &amp; Windows
          </button>
          <button
            onClick={() => setActivePlatform('ios')}
            className={`flex items-center gap-1.5 py-2.5 border-b-2 transition-colors ${
              activePlatform === 'ios'
                ? 'border-[#5a5a40] dark:border-[#8c8c6d] text-[#2c2c2a] dark:text-[#f0f0ea] font-semibold'
                : 'border-transparent text-[#9c9c94] hover:text-[#2c2c2a] dark:hover:text-[#f0f0ea]'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" /> iOS &amp; iPadOS
          </button>
          <button
            onClick={() => setActivePlatform('android')}
            className={`flex items-center gap-1.5 py-2.5 border-b-2 transition-colors ${
              activePlatform === 'android'
                ? 'border-[#5a5a40] dark:border-[#8c8c6d] text-[#2c2c2a] dark:text-[#f0f0ea] font-semibold'
                : 'border-transparent text-[#9c9c94] hover:text-[#2c2c2a] dark:hover:text-[#f0f0ea]'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" /> Android
          </button>
          <button
            onClick={() => setActivePlatform('backup')}
            className={`flex items-center gap-1.5 py-2.5 border-b-2 transition-colors ${
              activePlatform === 'backup'
                ? 'border-[#5a5a40] dark:border-[#8c8c6d] text-[#2c2c2a] dark:text-[#f0f0ea] font-semibold'
                : 'border-transparent text-[#9c9c94] hover:text-[#2c2c2a] dark:hover:text-[#f0f0ea]'
            }`}
          >
            <FileDown className="h-3.5 w-3.5" /> Offline Archive
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {downloadMsg && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{downloadMsg}</span>
            </div>
          )}

          {activePlatform === 'desktop' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#e5e5df] bg-white p-4 dark:border-[#363630] dark:bg-[#242421] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5a5a40] dark:text-[#a4a485]">
                  <Monitor className="h-4 w-4" /> Chrome, Edge, Brave &amp; Arc (Mac / Win / Linux)
                </div>
                <ol className="list-decimal list-inside text-xs text-[#5a5a40] dark:text-[#c2c2a8] space-y-2 leading-relaxed">
                  <li>Look for the <span className="font-semibold text-[#2c2c2a] dark:text-[#f0f0ea]">Install icon ⊕</span> on the right side of your browser address bar.</li>
                  <li>Click <span className="font-semibold text-[#2c2c2a] dark:text-[#f0f0ea]">"Install Ration"</span> to add Ration to your Applications, Dock, or Start Menu.</li>
                  <li>Ration opens in a dedicated distraction-free window without browser tabs or address bar.</li>
                </ol>
              </div>

              <div className="rounded-xl border border-[#e5e5df] bg-white p-4 dark:border-[#363630] dark:bg-[#242421] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5a5a40] dark:text-[#a4a485]">
                  <Laptop className="h-4 w-4" /> Safari on macOS (Sonoma &amp; Later)
                </div>
                <ol className="list-decimal list-inside text-xs text-[#5a5a40] dark:text-[#c2c2a8] space-y-2 leading-relaxed">
                  <li>In Safari menu bar, click <span className="font-semibold text-[#2c2c2a] dark:text-[#f0f0ea]">File &gt; Add to Dock...</span></li>
                  <li>Confirm the name <span className="font-semibold text-[#2c2c2a] dark:text-[#f0f0ea]">Ration</span> and click <span className="font-semibold text-[#2c2c2a] dark:text-[#f0f0ea]">Add</span>.</li>
                  <li>Launch Ration directly from your Mac Dock with native notifications and isolated storage.</li>
                </ol>
              </div>
            </div>
          )}

          {activePlatform === 'ios' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#e5e5df] bg-white p-4 dark:border-[#363630] dark:bg-[#242421] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5a5a40] dark:text-[#a4a485]">
                  <Share2 className="h-4 w-4" /> Safari on iPhone &amp; iPad
                </div>
                <ol className="list-decimal list-inside text-xs text-[#5a5a40] dark:text-[#c2c2a8] space-y-2.5 leading-relaxed">
                  <li>Tap the <span className="font-semibold text-[#2c2c2a] dark:text-[#f0f0ea]">Share button (⎋)</span> in Safari’s bottom or top toolbar.</li>
                  <li>Scroll down and tap <span className="font-semibold text-[#2c2c2a] dark:text-[#f0f0ea]">Add to Home Screen (⊞)</span>.</li>
                  <li>Tap <span className="font-semibold text-[#2c2c2a] dark:text-[#f0f0ea]">Add</span> in the top right corner.</li>
                  <li>Ration will appear on your Home Screen as an icon and open in full-screen standalone mode.</li>
                </ol>
              </div>
            </div>
          )}

          {activePlatform === 'android' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#e5e5df] bg-white p-4 dark:border-[#363630] dark:bg-[#242421] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5a5a40] dark:text-[#a4a485]">
                  <Smartphone className="h-4 w-4" /> Chrome &amp; Firefox on Android
                </div>
                <ol className="list-decimal list-inside text-xs text-[#5a5a40] dark:text-[#c2c2a8] space-y-2.5 leading-relaxed">
                  <li>Tap the <span className="font-semibold text-[#2c2c2a] dark:text-[#f0f0ea]">three-dots menu (⋮)</span> in the upper-right corner.</li>
                  <li>Select <span className="font-semibold text-[#2c2c2a] dark:text-[#f0f0ea]">"Install app"</span> or <span className="font-semibold text-[#2c2c2a] dark:text-[#f0f0ea]">"Add to Home screen"</span>.</li>
                  <li>Confirm installation. The app will be installed to your app drawer and home screen.</li>
                </ol>
              </div>
            </div>
          )}

          {activePlatform === 'backup' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#e5e5df] bg-white p-4 dark:border-[#363630] dark:bg-[#242421] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5a5a40] dark:text-[#a4a485]">
                    <Download className="h-4 w-4" /> Portable Offline Archive (.rationbackup)
                  </div>
                </div>
                <p className="text-xs text-[#5a5a40] dark:text-[#c2c2a8] leading-relaxed">
                  Download a complete, offline snapshot containing all your documents, blocks, relational tables, media attachments, and revision histories into a portable JSON package.
                </p>
                <button
                  onClick={handleExportFullOfflineWorkspace}
                  className="flex items-center gap-2 rounded-lg bg-[#5a5a40] dark:bg-[#8c8c6d] px-4 py-2 text-xs font-semibold text-white dark:text-[#1c1c1a] hover:bg-[#444430] dark:hover:bg-[#a4a485] transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download Offline Workspace Archive
                </button>
              </div>

              <div className="rounded-xl border border-[#e5e5df] bg-[#ecece4]/40 p-4 dark:border-[#363630] dark:bg-[#262622]/40 text-xs text-[#9c9c94] space-y-1">
                <div className="font-semibold text-[#2c2c2a] dark:text-[#f0f0ea]">Local Storage Architecture</div>
                <p className="text-[11px] leading-relaxed">
                  Ration stores data directly inside your browser’s local IndexedDB engine and SQLite Write-Ahead Log. It never sends document text or attachments to external servers.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#e5e5df] px-6 py-3.5 dark:border-[#363630] bg-[#f5f5f0]/40 dark:bg-[#171715]/40 text-xs">
          <div className="flex items-center gap-2 text-[#9c9c94] text-[11px]">
            <Shield className="h-3.5 w-3.5 text-[#5a5a40] dark:text-[#a4a485]" />
            <span>100% Client-Side • Zero Cloud Telemetry</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-[#dadad0] bg-[#ecece4] px-3.5 py-1 text-xs font-semibold text-[#5a5a40] hover:bg-[#e2e2da] dark:border-[#3c3c34] dark:bg-[#2c2c28] dark:text-[#c2c2a8] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
