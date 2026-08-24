import React, { useState, useEffect } from 'react';
import {
  Table as TableIcon,
  LayoutGrid,
  Calendar as CalendarIcon,
  ListFilter,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Download,
  Kanban,
} from 'lucide-react';
import { Database, DatabaseProperty, DatabaseRow, DatabaseView as IDatabaseView, DatabaseViewType } from '../../types';
import { databaseRepo } from '../../storage/repositories';
import { useWorkspace } from '../../context/WorkspaceContext';
import { TableView } from './TableView';
import { KanbanView } from './KanbanView';
import { GalleryView } from './GalleryView';
import { CalendarView } from './CalendarView';
import { PropertyConfigModal } from './PropertyConfigModal';
import { DatabaseRowModal } from './DatabaseRowModal';
import { BackupExportManager } from '../../storage/backupExport';

interface DatabaseViewProps {
  pageId: string;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({ pageId }) => {
  const { workspace } = useWorkspace();
  const [database, setDatabase] = useState<Database | null>(null);
  const [properties, setProperties] = useState<DatabaseProperty[]>([]);
  const [rows, setRows] = useState<DatabaseRow[]>([]);
  const [activeViewType, setActiveViewType] = useState<DatabaseViewType>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRow, setSelectedRow] = useState<DatabaseRow | null>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);

  // Load Database entities
  useEffect(() => {
    let isCancelled = false;

    const loadDatabaseData = async () => {
      let dbObj = await databaseRepo.getByPageId(pageId);
      if (!dbObj && workspace) {
        // Create initial database for this page if not present
        dbObj = await databaseRepo.create({
          id: `db_${crypto.randomUUID().slice(0, 8)}`,
          workspaceId: workspace.id,
          pageId,
          name: 'Database',
          description: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      if (dbObj && !isCancelled) {
        setDatabase(dbObj);

        let props = await databaseRepo.getProperties(dbObj.id);
        if (props.length === 0) {
          // Default properties: Status, Priority, Date
          const defaultProps: DatabaseProperty[] = [
            {
              id: `prop_status_${crypto.randomUUID().slice(0, 4)}`,
              databaseId: dbObj.id,
              name: 'Status',
              type: 'status',
              config: {
                options: [
                  { id: 'Planning', label: 'Planning', color: 'bg-[#ecece4] text-[#5a5a40]' },
                  { id: 'In Progress', label: 'In Progress', color: 'bg-amber-100 text-amber-800' },
                  { id: 'Completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-800' },
                ],
              },
              orderIndex: 1,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            {
              id: `prop_priority_${crypto.randomUUID().slice(0, 4)}`,
              databaseId: dbObj.id,
              name: 'Priority',
              type: 'priority',
              config: {
                options: [
                  { id: 'Low', label: 'Low', color: 'bg-[#ecece4] text-[#5a5a40]' },
                  { id: 'Medium', label: 'Medium', color: 'bg-amber-100 text-amber-800' },
                  { id: 'High', label: 'High', color: 'bg-rose-100 text-rose-800' },
                ],
              },
              orderIndex: 2,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            {
              id: `prop_date_${crypto.randomUUID().slice(0, 4)}`,
              databaseId: dbObj.id,
              name: 'Due Date',
              type: 'date',
              config: {},
              orderIndex: 3,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ];

          for (const p of defaultProps) {
            await databaseRepo.createProperty(p);
          }
          props = defaultProps;
        }
        setProperties(props);

        let initialRows = await databaseRepo.getRows(dbObj.id);
        if (initialRows.length === 0) {
          // Seed initial example items
          const sampleRows = [
            {
              title: 'Local-first storage engine optimization',
              values: {
                [props[0]?.id || 'status']: 'Planning',
                [props[1]?.id || 'priority']: 'High',
              },
            },
            {
              title: 'Implement SQLite FTS5 Search Index',
              values: {
                [props[0]?.id || 'status']: 'In Progress',
                [props[1]?.id || 'priority']: 'Medium',
              },
            },
            {
              title: 'Draft release notes for v1.0.2',
              values: {
                [props[0]?.id || 'status']: 'Completed',
                [props[1]?.id || 'priority']: 'Low',
              },
            },
          ];

          for (let i = 0; i < sampleRows.length; i++) {
            const item = sampleRows[i];
            const r = await databaseRepo.createRow({
              id: `row_${crypto.randomUUID().slice(0, 8)}`,
              databaseId: dbObj.id,
              pageId: null,
              title: item.title,
              icon: null,
              values: item.values,
              orderIndex: i,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
            initialRows.push(r);
          }
        }
        setRows(initialRows);
      }
    };

    loadDatabaseData();
    return () => {
      isCancelled = true;
    };
  }, [pageId, workspace]);

  // Row update handlers
  const handleUpdateRow = async (updatedRow: DatabaseRow) => {
    setRows((prev) => prev.map((r) => (r.id === updatedRow.id ? updatedRow : r)));
    if (selectedRow?.id === updatedRow.id) {
      setSelectedRow(updatedRow);
    }
    await databaseRepo.updateRow(updatedRow.id, updatedRow);
  };

  const handleDeleteRow = async (rowId: string) => {
    setRows((prev) => prev.filter((r) => r.id !== rowId));
    if (selectedRow?.id === rowId) setSelectedRow(null);
    await databaseRepo.deleteRow(rowId);
  };

  const handleAddRow = async (statusLabel?: string) => {
    if (!database) return;
    const statusProp = properties.find((p) => p.type === 'status' || p.name.toLowerCase() === 'status');
    const values: Record<string, unknown> = {};
    if (statusProp && statusLabel) {
      values[statusProp.id] = statusLabel;
    }

    const newRow = await databaseRepo.createRow({
      id: `row_${crypto.randomUUID().slice(0, 8)}`,
      databaseId: database.id,
      pageId: null,
      title: '',
      icon: null,
      values,
      orderIndex: rows.length,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    setRows((prev) => [...prev, newRow]);
    setSelectedRow(newRow);
  };

  const handleExportCSV = async () => {
    if (!database) return;
    const csv = await BackupExportManager.exportDatabaseToCSV(database.id);
    BackupExportManager.triggerDownload(`${database.name || 'database'}.csv`, csv, 'text/csv');
  };

  const filteredRows = rows.filter((r) =>
    (r.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-5xl px-6 sm:px-10 py-6">
      {/* Database Views Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e5df] dark:border-[#363630] pb-3">
        {/* View switcher tabs */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveViewType('board')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all ${
              activeViewType === 'board'
                ? 'bg-white dark:bg-[#242421] text-[#5a5a40] dark:text-[#c2c2a8] border border-[#e5e5df] dark:border-[#363630] shadow-2xs font-semibold'
                : 'text-[#9c9c94] hover:text-[#5a5a40] dark:hover:text-[#c2c2a8] hover:bg-[#ecece4]/50'
            }`}
          >
            <Kanban className="h-3.5 w-3.5" /> Board
          </button>

          <button
            onClick={() => setActiveViewType('table')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all ${
              activeViewType === 'table'
                ? 'bg-white dark:bg-[#242421] text-[#5a5a40] dark:text-[#c2c2a8] border border-[#e5e5df] dark:border-[#363630] shadow-2xs font-semibold'
                : 'text-[#9c9c94] hover:text-[#5a5a40] dark:hover:text-[#c2c2a8] hover:bg-[#ecece4]/50'
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" /> Table
          </button>

          <button
            onClick={() => setActiveViewType('gallery')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all ${
              activeViewType === 'gallery'
                ? 'bg-white dark:bg-[#242421] text-[#5a5a40] dark:text-[#c2c2a8] border border-[#e5e5df] dark:border-[#363630] shadow-2xs font-semibold'
                : 'text-[#9c9c94] hover:text-[#5a5a40] dark:hover:text-[#c2c2a8] hover:bg-[#ecece4]/50'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Gallery
          </button>

          <button
            onClick={() => setActiveViewType('calendar')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all ${
              activeViewType === 'calendar'
                ? 'bg-white dark:bg-[#242421] text-[#5a5a40] dark:text-[#c2c2a8] border border-[#e5e5df] dark:border-[#363630] shadow-2xs font-semibold'
                : 'text-[#9c9c94] hover:text-[#5a5a40] dark:hover:text-[#c2c2a8] hover:bg-[#ecece4]/50'
            }`}
          >
            <CalendarIcon className="h-3.5 w-3.5" /> Calendar
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Search in database */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#9c9c94]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="rounded-md border border-[#dadad0] dark:border-[#3c3c34] bg-[#ecece4] dark:bg-[#262622] pl-8 pr-3 py-1 text-xs text-[#5a5a40] dark:text-[#c2c2a8] placeholder:text-[#9c9c94] focus:outline-none focus:border-[#5a5a40]"
            />
          </div>

          <button
            onClick={() => setShowPropertyModal(true)}
            title="Configure properties"
            className="flex items-center gap-1.5 rounded-md border border-[#dadad0] dark:border-[#3c3c34] bg-[#ecece4] dark:bg-[#262622] px-2.5 py-1 text-xs text-[#5a5a40] dark:text-[#c2c2a8] hover:bg-[#e2e2da] transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Properties</span>
          </button>

          <button
            onClick={handleExportCSV}
            title="Export CSV"
            className="flex items-center gap-1 rounded-md border border-[#dadad0] dark:border-[#3c3c34] bg-[#ecece4] dark:bg-[#262622] px-2.5 py-1 text-xs text-[#5a5a40] dark:text-[#c2c2a8] hover:bg-[#e2e2da] transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={() => handleAddRow()}
            className="flex items-center gap-1 rounded-md bg-[#5a5a40] dark:bg-[#8c8c6d] px-3 py-1 text-xs font-semibold text-white dark:text-[#1c1c1a] hover:bg-[#444430] dark:hover:bg-[#a4a485] shadow-2xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Main Database View Representation */}
      {activeViewType === 'board' && (
        <KanbanView
          properties={properties}
          rows={filteredRows}
          onUpdateRow={handleUpdateRow}
          onDeleteRow={handleDeleteRow}
          onAddRowWithStatus={(status) => handleAddRow(status)}
          onOpenRowModal={(row) => setSelectedRow(row)}
        />
      )}

      {activeViewType === 'table' && (
        <TableView
          properties={properties}
          rows={filteredRows}
          onUpdateRow={handleUpdateRow}
          onDeleteRow={handleDeleteRow}
          onAddRow={() => handleAddRow()}
          onOpenRowModal={(row) => setSelectedRow(row)}
          onConfigureProperties={() => setShowPropertyModal(true)}
        />
      )}

      {activeViewType === 'gallery' && (
        <GalleryView
          properties={properties}
          rows={filteredRows}
          onUpdateRow={handleUpdateRow}
          onDeleteRow={handleDeleteRow}
          onAddRow={() => handleAddRow()}
          onOpenRowModal={(row) => setSelectedRow(row)}
        />
      )}

      {activeViewType === 'calendar' && (
        <CalendarView
          properties={properties}
          rows={filteredRows}
          onUpdateRow={handleUpdateRow}
          onAddRow={() => handleAddRow()}
          onOpenRowModal={(row) => setSelectedRow(row)}
        />
      )}

      {/* Property Configuration Modal */}
      {showPropertyModal && database && (
        <PropertyConfigModal
          databaseId={database.id}
          properties={properties}
          onClose={() => setShowPropertyModal(false)}
          onPropertiesUpdated={(updatedProps) => setProperties(updatedProps)}
        />
      )}

      {/* Database Row Detailed Modal with Nested Subpage Editor */}
      {selectedRow && (
        <DatabaseRowModal
          row={selectedRow}
          properties={properties}
          onClose={() => setSelectedRow(null)}
          onUpdateRow={handleUpdateRow}
          onDeleteRow={(id) => {
            handleDeleteRow(id);
            setSelectedRow(null);
          }}
        />
      )}
    </div>
  );
};
