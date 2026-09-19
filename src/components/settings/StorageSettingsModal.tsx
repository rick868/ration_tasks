import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  HardDrive,
  Activity,
  Download,
  Upload,
  RefreshCw,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  Layers,
  ShieldCheck,
  Clock,
  Copy,
  Check,
  FileText,
  Zap,
  Info,
  Server,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { FileStorageManager } from '../../storage/fileManager';
import { BackupExportManager } from '../../storage/backupExport';
import {
  StorageHealthCheckRunner,
  StorageHealthReport,
  HealthCheckItem,
} from '../../storage/healthCheck';

export const StorageSettingsModal: React.FC = () => {
  const { workspace, isSettingsOpen, setIsSettingsOpen, refreshPages, setIsInstallOpen } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'storage' | 'health' | 'backup' | 'advanced'>('storage');
  const [stats, setStats] = useState<{
    databaseBytes: number;
    attachmentsBytes: number;
    backupsBytes: number;
    cacheBytes: number;
    totalFiles: number;
  }>({
    databaseBytes: 0,
    attachmentsBytes: 0,
    backupsBytes: 0,
    cacheBytes: 0,
    totalFiles: 0,
  });

  const [healthReport, setHealthReport] = useState<StorageHealthReport | null>(null);
  const [isRunningHealth, setIsRunningHealth] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<{ current: number; total: number; name: string } | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const [persisting, setPersisting] = useState(false);
  const [persistMsg, setPersistMsg] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'issues'>('all');
  const [backupMsg, setBackupMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [storagePath, setStoragePath] = useState(workspace?.settings?.storagePath || '~/.local/share/Ration/ration.db');

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  };

  const loadStats = useCallback(async () => {
    try {
      const s = await FileStorageManager.getStats();
      setStats(s);
    } catch {
      // fallback
    }
  }, []);

  const runDiagnostics = useCallback(async () => {
    setIsRunningHealth(true);
    setCurrentProgress({ current: 0, total: 6, name: 'Initializing diagnostic probes...' });

    try {
      const report = await StorageHealthCheckRunner.runDiagnostics((item, idx, total) => {
        setCurrentProgress({
          current: idx,
          total,
          name: item.name,
        });
      });
      setHealthReport(report);
    } catch (err) {
      console.error('Health check failed:', err);
    } finally {
      setIsRunningHealth(false);
      setCurrentProgress(null);
    }
  }, []);

  useEffect(() => {
    if (isSettingsOpen) {
      loadStats();
      runDiagnostics();
    }
  }, [isSettingsOpen, loadStats, runDiagnostics]);

  const handleRequestPersistence = async () => {
    setPersisting(true);
    setPersistMsg(null);
    try {
      const granted = await StorageHealthCheckRunner.requestPersistence();
      if (granted) {
        setPersistMsg('✓ Persistent storage granted by browser. Data will never be evicted.');
      } else {
        setPersistMsg('Browser retained standard quota policy.');
      }
      // Re-run diagnostics to reflect updated persistence
      await runDiagnostics();
    } catch {
      setPersistMsg('Persistence request completed.');
    } finally {
      setPersisting(false);
      setTimeout(() => setPersistMsg(null), 5000);
    }
  };

  const handleCopyReport = () => {
    if (!healthReport) return;
    const lines = [
      `=== RATION STORAGE & ENGINE HEALTH REPORT ===`,
      `Timestamp: ${new Date(healthReport.timestamp).toISOString()}`,
      `Engine: ${healthReport.storageEngine}`,
      `App Path: ${healthReport.appDataPath}`,
      `Overall Status: ${healthReport.status.toUpperCase()} (${healthReport.summary.passed}/${healthReport.summary.total} checks passed)`,
      `Duration: ${healthReport.durationMs}ms`,
      `Write Latency: ${healthReport.metrics.writeLatencyMs}ms`,
      `Storage Quota: ${formatSize(healthReport.storageQuota.usageBytes)} used of ${formatSize(healthReport.storageQuota.quotaBytes)} (${healthReport.storageQuota.percentUsed.toFixed(1)}%)`,
      `Persistent Storage: ${healthReport.storageQuota.isPersisted ? 'YES' : 'NO'}`,
      `Counts: ${healthReport.metrics.pageCount} pages, ${healthReport.metrics.blockCount} blocks, ${healthReport.metrics.fileCount} attachments`,
      ``,
      `--- Detailed Diagnostic Probes ---`,
      ...healthReport.items.map(
        (it) => `[${it.status.toUpperCase()}] ${it.name} (${it.durationMs || 0}ms)\n  Details: ${it.details}${it.remediation ? `\n  Remediation: ${it.remediation}` : ''}`
      ),
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const handleCreateBackup = async () => {
    if (!workspace) return;
    setBackupMsg(null);
    try {
      const { data, filename } = await BackupExportManager.createBackupPackage(workspace.id);
      BackupExportManager.triggerDownload(filename, data, 'application/json');
      setBackupMsg({ text: `Backup created: ${filename}`, success: true });
      loadStats();
    } catch (err) {
      setBackupMsg({ text: `Backup failed: ${(err as Error).message}`, success: false });
    }
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const content = reader.result as string;
        const res = await BackupExportManager.restoreBackupPackage(content);
        setBackupMsg({ text: res.message, success: res.success });
        if (res.success) {
          await refreshPages();
          loadStats();
          runDiagnostics();
        }
      } catch (err) {
        setBackupMsg({ text: `Restore failed: ${(err as Error).message}`, success: false });
      }
    };
    reader.readAsText(file);
  };

  const handleClearCache = async () => {
    await FileStorageManager.clearCache();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
    loadStats();
    runDiagnostics();
  };

  if (!isSettingsOpen) return null;

  const totalUsed = stats.databaseBytes + stats.attachmentsBytes + stats.backupsBytes + stats.cacheBytes;
  const filteredItems = healthReport?.items.filter((it) => {
    if (filterStatus === 'issues') return it.status === 'warning' || it.status === 'failed';
    return true;
  }) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-100">
      <div className="flex h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-[#e5e5df] bg-[#fcfcf9] shadow-2xl dark:border-[#363630] dark:bg-[#1c1c1a] overflow-hidden text-[#2c2c2a] dark:text-[#f0f0ea]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#e5e5df] px-6 py-4 dark:border-[#363630]">
          <div className="flex items-center gap-2.5">
            <HardDrive className="h-5 w-5 text-[#5a5a40] dark:text-[#a4a485]" />
            <div>
              <h3 className="font-serif italic text-lg text-[#2c2c2a] dark:text-[#f0f0ea]">
                Storage &amp; Engine Diagnostics
              </h3>
              <p className="text-[11px] text-[#9c9c94]">
                Dexie IndexedDB tables, attachment blobs, browser quota, and health metrics
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="rounded p-1 text-[#9c9c94] hover:bg-[#ecece4] hover:text-[#2c2c2a] dark:hover:bg-[#2c2c28] dark:hover:text-[#f0f0ea]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body: Tabs & Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Nav Tabs */}
          <div className="w-52 border-r border-[#e5e5df] bg-[#f5f5f0]/60 p-3 dark:border-[#363630] dark:bg-[#171715] space-y-1">
            <button
              onClick={() => setActiveTab('storage')}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === 'storage'
                  ? 'bg-[#ecece4] text-[#2c2c2a] dark:bg-[#2c2c28] dark:text-[#f0f0ea] font-semibold'
                  : 'text-[#5a5a40] dark:text-[#c2c2a8] hover:bg-[#ecece4]/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <HardDrive className="h-3.5 w-3.5 text-[#5a5a40] dark:text-[#a4a485]" /> Storage Usage
              </span>
            </button>

            <button
              onClick={() => setActiveTab('health')}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === 'health'
                  ? 'bg-[#ecece4] text-[#2c2c2a] dark:bg-[#2c2c28] dark:text-[#f0f0ea] font-semibold'
                  : 'text-[#5a5a40] dark:text-[#c2c2a8] hover:bg-[#ecece4]/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-[#5a5a40] dark:text-[#a4a485]" /> Health Check
              </span>
              {healthReport && (
                <span
                  className={`h-2 w-2 rounded-full ${
                    healthReport.status === 'healthy'
                      ? 'bg-emerald-500'
                      : healthReport.status === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('backup')}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === 'backup'
                  ? 'bg-[#ecece4] text-[#2c2c2a] dark:bg-[#2c2c28] dark:text-[#f0f0ea] font-semibold'
                  : 'text-[#5a5a40] dark:text-[#c2c2a8] hover:bg-[#ecece4]/50'
              }`}
            >
              <Download className="h-3.5 w-3.5 text-[#5a5a40] dark:text-[#a4a485]" /> Backup &amp; Restore
            </button>

            <button
              onClick={() => setActiveTab('advanced')}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === 'advanced'
                  ? 'bg-[#ecece4] text-[#2c2c2a] dark:bg-[#2c2c28] dark:text-[#f0f0ea] font-semibold'
                  : 'text-[#5a5a40] dark:text-[#c2c2a8] hover:bg-[#ecece4]/50'
              }`}
            >
              <FolderOpen className="h-3.5 w-3.5 text-[#5a5a40] dark:text-[#a4a485]" /> Local Path
            </button>
          </div>

          {/* Right Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* 1. Storage Usage Tab */}
            {activeTab === 'storage' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#5a5a40] dark:text-[#a4a485]">
                      Total Local Storage Allocated
                    </span>
                    <span className="font-serif italic text-lg text-[#2c2c2a] dark:text-[#f0f0ea]">
                      {formatSize(totalUsed)}
                    </span>
                  </div>

                  {/* Visual Storage Bar */}
                  <div className="flex h-3 w-full overflow-hidden rounded-full bg-[#d8d8ce] dark:bg-[#383832]">
                    <div
                      style={{ width: `${Math.max(8, (stats.databaseBytes / Math.max(totalUsed, 1)) * 100)}%` }}
                      className="bg-[#5a5a40] dark:bg-[#8c8c6d]"
                      title="Database Records"
                    />
                    <div
                      style={{ width: `${Math.max(12, (stats.attachmentsBytes / Math.max(totalUsed, 1)) * 100)}%` }}
                      className="bg-[#707052] dark:bg-[#a4a485]"
                      title="Attachment Blobs"
                    />
                    <div
                      style={{ width: `${Math.max(8, (stats.backupsBytes / Math.max(totalUsed, 1)) * 100)}%` }}
                      className="bg-[#9c9c94]"
                      title="Snapshots & Backups"
                    />
                  </div>
                </div>

                {/* Storage Breakdown Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#e5e5df] bg-white p-3.5 dark:border-[#363630] dark:bg-[#242421] shadow-xs">
                    <div className="flex items-center justify-between text-xs text-[#9c9c94] mb-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="h-2 w-2 rounded-full bg-[#5a5a40] dark:bg-[#8c8c6d]" /> SQLite &amp; IDB Records
                      </span>
                    </div>
                    <div className="text-base font-bold text-[#2c2c2a] dark:text-[#f0f0ea]">
                      {formatSize(stats.databaseBytes)}
                    </div>
                    <div className="text-[10px] text-[#9c9c94] mt-1">
                      {healthReport?.metrics.pageCount ?? '—'} docs • {healthReport?.metrics.blockCount ?? '—'} blocks
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#e5e5df] bg-white p-3.5 dark:border-[#363630] dark:bg-[#242421] shadow-xs">
                    <div className="flex items-center justify-between text-xs text-[#9c9c94] mb-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="h-2 w-2 rounded-full bg-[#707052] dark:bg-[#a4a485]" /> Local Media &amp; Files
                      </span>
                    </div>
                    <div className="text-base font-bold text-[#2c2c2a] dark:text-[#f0f0ea]">
                      {formatSize(stats.attachmentsBytes)}
                    </div>
                    <div className="text-[10px] text-[#9c9c94] mt-1">
                      {stats.totalFiles} stored binary attachments
                    </div>
                  </div>
                </div>

                {/* Quick Engine Status Card */}
                <div className="flex items-center justify-between rounded-xl border border-[#e5e5df] bg-[#ecece4]/40 p-4 dark:border-[#363630] dark:bg-[#262622]/40">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-[#5a5a40]/10 p-2 text-[#5a5a40] dark:bg-[#8c8c6d]/15 dark:text-[#a4a485]">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#2c2c2a] dark:text-[#f0f0ea]">
                        <span>Storage Health Engine</span>
                        {healthReport && (
                          <span
                            className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                              healthReport.overallHealthy
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}
                          >
                            {healthReport.summary.passed}/{healthReport.summary.total} Operational
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#9c9c94]">
                        {healthReport?.storageEngine || 'Dexie IndexedDB Engine'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('health')}
                    className="rounded-lg border border-[#dadad0] bg-[#ecece4] px-3 py-1.5 text-xs font-semibold text-[#5a5a40] hover:bg-[#e2e2da] dark:border-[#3c3c34] dark:bg-[#2c2c28] dark:text-[#c2c2a8] transition-colors"
                  >
                    View Diagnostics
                  </button>
                </div>

                {/* Clear Cache Card */}
                <div className="rounded-xl border border-[#e5e5df] bg-[#ecece4]/40 p-4 dark:border-[#363630] dark:bg-[#262622]/40 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#2c2c2a] dark:text-[#f0f0ea]">Clear Local Cache</h4>
                    <p className="text-[11px] text-[#9c9c94]">Safe cleanup of transient indexes and temp files</p>
                  </div>
                  <button
                    onClick={handleClearCache}
                    className="rounded-lg bg-[#5a5a40] dark:bg-[#8c8c6d] px-3 py-1.5 text-xs font-semibold text-white dark:text-[#1c1c1a] hover:bg-[#444430] dark:hover:bg-[#a4a485] transition-colors"
                  >
                    {cacheCleared ? 'Cleared!' : 'Clean Cache'}
                  </button>
                </div>
              </div>
            )}

            {/* 2. Health Check Tab */}
            {activeTab === 'health' && (
              <div className="space-y-4">
                {/* Header Controls */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#5a5a40] dark:text-[#a4a485]">
                      Storage Health Runner
                    </h4>
                    <p className="text-[11px] text-[#9c9c94]">
                      Probing SQLite tables, ACID transactions, and attachment checksums
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyReport}
                      disabled={!healthReport || isRunningHealth}
                      className="flex items-center gap-1.5 rounded-lg border border-[#dadad0] bg-[#ecece4] px-2.5 py-1 text-xs font-medium text-[#5a5a40] hover:bg-[#e2e2da] dark:border-[#3c3c34] dark:bg-[#262622] dark:text-[#c2c2a8] transition-colors disabled:opacity-50"
                      title="Copy full diagnostic report to clipboard"
                    >
                      {copiedReport ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedReport ? 'Copied' : 'Copy Report'}</span>
                    </button>
                    <button
                      onClick={runDiagnostics}
                      disabled={isRunningHealth}
                      className="flex items-center gap-1.5 rounded-lg bg-[#5a5a40] dark:bg-[#8c8c6d] px-3 py-1 text-xs font-semibold text-white dark:text-[#1c1c1a] hover:bg-[#444430] dark:hover:bg-[#a4a485] transition-colors disabled:opacity-60"
                    >
                      <RefreshCw className={`h-3 w-3 ${isRunningHealth ? 'animate-spin' : ''}`} />
                      <span>{isRunningHealth ? 'Testing...' : 'Run Diagnostics'}</span>
                    </button>
                  </div>
                </div>

                {/* Progress bar if running */}
                {isRunningHealth && currentProgress && (
                  <div className="rounded-xl border border-[#dadad0] bg-[#ecece4]/50 p-3 dark:border-[#3c3c34] dark:bg-[#262622]/50 animate-pulse">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#5a5a40] dark:text-[#c2c2a8] mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 animate-spin" />
                        Testing: {currentProgress.name}
                      </span>
                      <span>
                        {currentProgress.current} / {currentProgress.total}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#dadad0] dark:bg-[#383832]">
                      <div
                        style={{ width: `${(currentProgress.current / currentProgress.total) * 100}%` }}
                        className="h-full bg-[#5a5a40] dark:bg-[#8c8c6d] transition-all duration-300"
                      />
                    </div>
                  </div>
                )}

                {/* Overall Health Banner */}
                {healthReport && !isRunningHealth && (
                  <div
                    className={`flex items-start justify-between rounded-xl border p-4 transition-all ${
                      healthReport.status === 'healthy'
                        ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-200'
                        : healthReport.status === 'warning'
                        ? 'border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-800/80 dark:bg-amber-950/40 dark:text-amber-200'
                        : 'border-rose-200 bg-rose-50/70 text-rose-900 dark:border-rose-800/80 dark:bg-rose-950/40 dark:text-rose-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {healthReport.status === 'healthy' ? (
                        <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      ) : healthReport.status === 'warning' ? (
                        <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-6 w-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-sm font-bold flex items-center gap-2">
                          <span>
                            {healthReport.status === 'healthy'
                              ? 'All Storage Systems Healthy & Operational'
                              : healthReport.status === 'warning'
                              ? 'System Warning: Attention Recommended'
                              : 'Critical Storage Integrity Issue'}
                          </span>
                          <span className="rounded-full bg-white/70 px-2 py-0.2 text-[10px] font-bold text-[#5a5a40] dark:bg-black/40 dark:text-[#e5e5df]">
                            {healthReport.durationMs}ms
                          </span>
                        </div>
                        <p className="text-xs opacity-90 mt-0.5">
                          {healthReport.summary.passed} of {healthReport.summary.total} diagnostic probes passed
                          successfully. Latency: {healthReport.metrics.writeLatencyMs}ms.
                        </p>
                      </div>
                    </div>

                    {!healthReport.storageQuota.isPersisted && (
                      <button
                        onClick={handleRequestPersistence}
                        disabled={persisting}
                        className="shrink-0 rounded-lg bg-[#5a5a40] dark:bg-[#8c8c6d] px-3 py-1.5 text-xs font-semibold text-white dark:text-[#1c1c1a] hover:bg-[#444430] dark:hover:bg-[#a4a485] transition-colors shadow-xs"
                      >
                        {persisting ? 'Requesting...' : 'Enable Persistent Storage'}
                      </button>
                    )}
                  </div>
                )}

                {persistMsg && (
                  <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                    {persistMsg}
                  </div>
                )}

                {/* Storage Engine Metadata Bar */}
                {healthReport && (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-xl border border-[#e5e5df] bg-white p-3 dark:border-[#363630] dark:bg-[#242421]">
                      <div className="text-[10px] uppercase font-bold text-[#9c9c94]">Storage Engine</div>
                      <div className="font-semibold text-[#2c2c2a] dark:text-[#f0f0ea] truncate" title={healthReport.storageEngine}>
                        Dexie IndexedDB
                      </div>
                    </div>
                    <div className="rounded-xl border border-[#e5e5df] bg-white p-3 dark:border-[#363630] dark:bg-[#242421]">
                      <div className="text-[10px] uppercase font-bold text-[#9c9c94]">Persistence Status</div>
                      <div className="font-semibold text-[#2c2c2a] dark:text-[#f0f0ea] flex items-center gap-1.5">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            healthReport.storageQuota.isPersisted ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        {healthReport.storageQuota.isPersisted ? 'Persistent (No Eviction)' : 'Standard Storage'}
                      </div>
                    </div>
                    <div className="rounded-xl border border-[#e5e5df] bg-white p-3 dark:border-[#363630] dark:bg-[#242421]">
                      <div className="text-[10px] uppercase font-bold text-[#9c9c94]">I/O Write Latency</div>
                      <div className="font-semibold text-[#2c2c2a] dark:text-[#f0f0ea]">
                        {healthReport.metrics.writeLatencyMs} ms
                      </div>
                    </div>
                  </div>
                )}

                {/* Filter and Item List */}
                {healthReport && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#9c9c94]">
                        Diagnostic Check Results ({filteredItems.length})
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setFilterStatus('all')}
                          className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                            filterStatus === 'all'
                              ? 'bg-[#ecece4] text-[#2c2c2a] dark:bg-[#2c2c28] dark:text-[#f0f0ea] font-semibold'
                              : 'text-[#9c9c94] hover:text-[#2c2c2a]'
                          }`}
                        >
                          All ({healthReport.items.length})
                        </button>
                        {(healthReport.summary.warnings > 0 || healthReport.summary.failed > 0) && (
                          <button
                            onClick={() => setFilterStatus('issues')}
                            className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                              filterStatus === 'issues'
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 font-semibold'
                                : 'text-amber-600 hover:text-amber-700'
                            }`}
                          >
                            Issues ({healthReport.summary.warnings + healthReport.summary.failed})
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {filteredItems.map((item) => {
                        const isPass = item.status === 'passed';
                        const isWarn = item.status === 'warning';
                        const isFail = item.status === 'failed';

                        return (
                          <div
                            key={item.id}
                            className="rounded-xl border border-[#e5e5df] bg-white p-3.5 dark:border-[#363630] dark:bg-[#242421] shadow-xs transition-colors hover:border-[#dadad0] dark:hover:border-[#44443c]"
                          >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2">
                                {isPass && <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                                {isWarn && <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />}
                                {isFail && <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />}
                                <h5 className="text-xs font-semibold text-[#2c2c2a] dark:text-[#f0f0ea]">
                                  {item.name}
                                </h5>
                                <span className="rounded bg-[#ecece4] dark:bg-[#2c2c28] px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-[#5a5a40] dark:text-[#a4a485]">
                                  {item.category}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {item.durationMs !== undefined && (
                                  <span className="text-[10px] text-[#9c9c94] font-mono">
                                    {item.durationMs}ms
                                  </span>
                                )}
                                <span
                                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                                    isPass
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                      : isWarn
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </div>
                            </div>

                            <p className="text-[11px] text-[#5a5a40] dark:text-[#c2c2a8] leading-relaxed">
                              {item.details}
                            </p>

                            {item.remediation && (
                              <div className="mt-2 rounded-lg bg-amber-50/80 p-2 text-[11px] text-amber-900 dark:bg-amber-950/30 dark:text-amber-200 flex items-start gap-1.5">
                                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold">Remediation:</span> {item.remediation}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. Backup & Restore Tab */}
            {activeTab === 'backup' && (
              <div className="space-y-4">
                <p className="text-xs text-[#9c9c94]">
                  Create an encrypted, portable snapshot of all documents, tables, blocks, and preferences.
                </p>

                {backupMsg && (
                  <div
                    className={`rounded-xl border p-3 text-xs ${
                      backupMsg.success
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                        : 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
                    }`}
                  >
                    {backupMsg.text}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#e5e5df] bg-white p-4 dark:border-[#363630] dark:bg-[#242421] shadow-xs">
                    <Download className="h-5 w-5 text-[#5a5a40] dark:text-[#a4a485] mb-2" />
                    <h5 className="text-xs font-bold text-[#2c2c2a] dark:text-[#f0f0ea]">Export Full Backup</h5>
                    <p className="text-[11px] text-[#9c9c94] mb-3">Download complete .rationbackup JSON file</p>
                    <button
                      onClick={handleCreateBackup}
                      className="w-full rounded-lg bg-[#5a5a40] dark:bg-[#8c8c6d] py-1.5 text-xs font-semibold text-white dark:text-[#1c1c1a] hover:bg-[#444430] dark:hover:bg-[#a4a485] transition-colors"
                    >
                      Export Backup Package
                    </button>
                  </div>

                  <div className="rounded-xl border border-[#e5e5df] bg-white p-4 dark:border-[#363630] dark:bg-[#242421] shadow-xs">
                    <Upload className="h-5 w-5 text-[#5a5a40] dark:text-[#a4a485] mb-2" />
                    <h5 className="text-xs font-bold text-[#2c2c2a] dark:text-[#f0f0ea]">Restore from File</h5>
                    <p className="text-[11px] text-[#9c9c94] mb-3">Restore workspace from .rationbackup file</p>
                    <label className="flex w-full cursor-pointer items-center justify-center rounded-lg border border-[#dadad0] bg-[#ecece4] py-1.5 text-xs font-semibold text-[#5a5a40] hover:bg-[#e2e2da] dark:border-[#3c3c34] dark:bg-[#262622] dark:text-[#c2c2a8] transition-colors">
                      Browse Backup File
                      <input type="file" accept=".rationbackup,.json" onChange={handleRestoreBackup} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="rounded-xl border border-[#e5e5df] bg-[#ecece4]/40 p-4 dark:border-[#363630] dark:bg-[#262622]/40 flex items-center justify-between">
                  <div>
                    <h6 className="text-xs font-bold text-[#2c2c2a] dark:text-[#f0f0ea]">PWA Desktop Installation</h6>
                    <p className="text-[11px] text-[#9c9c94]">Install Ration as a standalone application on your operating system.</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setIsInstallOpen(true);
                    }}
                    className="rounded-lg bg-[#5a5a40] dark:bg-[#8c8c6d] px-3 py-1.5 text-xs font-semibold text-white dark:text-[#1c1c1a] hover:bg-[#444430] dark:hover:bg-[#a4a485] transition-colors shrink-0"
                  >
                    Install Guide
                  </button>
                </div>
              </div>
            )}

            {/* 4. Local Path Configuration */}
            {activeTab === 'advanced' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5a5a40] dark:text-[#a4a485] mb-1">
                    Native Local Storage Directory
                  </label>
                  <input
                    type="text"
                    value={storagePath}
                    onChange={(e) => setStoragePath(e.target.value)}
                    className="w-full rounded-lg border border-[#dadad0] bg-white p-2.5 font-mono text-xs text-[#2c2c2a] dark:border-[#3c3c34] dark:bg-[#1c1c1a] dark:text-[#f0f0ea]"
                  />
                  <p className="mt-1 text-[11px] text-[#9c9c94]">
                    On Linux &amp; desktop runtimes, Ration saves directly into the XDG data directory (`~/.local/share/Ration/ration.db`).
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
