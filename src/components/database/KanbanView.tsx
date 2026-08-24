import React, { useState } from 'react';
import { Plus, MoreHorizontal, Calendar, Tag, AlertCircle, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { DatabaseRow, DatabaseProperty } from '../../types';

interface KanbanViewProps {
  properties: DatabaseProperty[];
  rows: DatabaseRow[];
  onUpdateRow: (row: DatabaseRow) => void;
  onDeleteRow: (rowId: string) => void;
  onAddRowWithStatus: (status: string) => void;
  onOpenRowModal: (row: DatabaseRow) => void;
}

const DEFAULT_STATUSES = [
  { id: 'Planning', label: 'Planning', color: 'text-[#5a5a40] dark:text-[#c2c2a8]' },
  { id: 'In Progress', label: 'In Progress', color: 'text-[#5a5a40] dark:text-[#c2c2a8]' },
  { id: 'Completed', label: 'Completed', color: 'text-[#5a5a40] dark:text-[#c2c2a8]' },
];

export const KanbanView: React.FC<KanbanViewProps> = ({
  properties,
  rows,
  onUpdateRow,
  onDeleteRow,
  onAddRowWithStatus,
  onOpenRowModal,
}) => {
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);

  // Find properties
  const statusProp = properties.find((p) => p.type === 'status' || p.name.toLowerCase() === 'status');
  const priorityProp = properties.find((p) => p.type === 'priority');
  const dateProp = properties.find((p) => p.type === 'date');
  const tagProp = properties.find((p) => p.type === 'select');

  const statusOptions = statusProp?.config?.options?.map((o) => ({
    id: o.label,
    label: o.label,
    color: 'text-[#5a5a40] dark:text-[#c2c2a8]',
  })) || DEFAULT_STATUSES;

  const handleDragStart = (e: React.DragEvent, rowId: string) => {
    setDraggedRowId(rowId);
    e.dataTransfer.setData('text/plain', rowId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const rowId = draggedRowId || e.dataTransfer.getData('text/plain');
    if (!rowId || !statusProp) return;

    const row = rows.find((r) => r.id === rowId);
    if (row) {
      onUpdateRow({
        ...row,
        values: { ...row.values, [statusProp.id]: targetStatus },
        updatedAt: Date.now(),
      });
    }
    setDraggedRowId(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 pt-2">
      {statusOptions.map((status) => {
        const columnRows = rows.filter((r) => {
          if (!statusProp) return true;
          const val = r.values[statusProp.id];
          return val === status.label || val === status.id;
        });

        return (
          <div
            key={status.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status.label)}
            className="flex flex-col gap-4 min-h-[300px]"
          >
            {/* Column Header matching Natural Tones design */}
            <div className="flex items-center justify-between border-b border-[#5a5a40]/25 dark:border-[#8c8c6d]/30 pb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-serif italic text-lg text-[#5a5a40] dark:text-[#c2c2a8]">
                  {status.label}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-[#ecece4] dark:bg-[#2c2c28] text-[#5a5a40] dark:text-[#c2c2a8] px-2 py-0.5 rounded text-[10px] font-bold">
                  {columnRows.length}
                </span>
                <button
                  onClick={() => onAddRowWithStatus(status.label)}
                  title="Add card"
                  className="rounded p-1 text-[#9c9c94] hover:bg-[#ecece4] dark:hover:bg-[#2c2c28] hover:text-[#5a5a40] dark:hover:text-[#c2c2a8] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Cards List matching Natural Tones design */}
            <div className="space-y-3 flex-1">
              {columnRows.map((row) => {
                const priorityVal = priorityProp ? (row.values[priorityProp.id] as string) : null;
                const dateVal = dateProp ? (row.values[dateProp.id] as string) : null;
                const tagVal = tagProp ? (row.values[tagProp.id] as string) : null;

                return (
                  <div
                    key={row.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, row.id)}
                    onClick={() => onOpenRowModal(row)}
                    className="group bg-white dark:bg-[#242421] p-4 rounded-xl shadow-xs border border-[#e5e5df] dark:border-[#363630] hover:border-[#5a5a40] dark:hover:border-[#8c8c6d] cursor-pointer transition-all hover:shadow-sm"
                  >
                    {/* Top Tag & Delete */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-[#9c9c94] dark:text-[#8c8c82] font-bold uppercase tracking-wider">
                        {tagVal || (priorityVal ? `${priorityVal} Priority` : 'Task')}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteRow(row.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 rounded p-1 text-[#9c9c94] hover:text-rose-600 transition-opacity"
                        title="Delete card"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Card Title */}
                    <div className="font-medium text-sm text-[#2c2c2a] dark:text-[#f0f0ea] mb-3 leading-snug">
                      {row.title || 'Untitled task'}
                    </div>

                    {/* Subtle Natural Progress / Footer Element */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#e5e5df]/60 dark:border-[#363630]/60">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#9c9c94]">
                        {dateVal ? (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-[#5a5a40] dark:text-[#a4a485]" />
                            {dateVal}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-[#d8d8ce] dark:bg-[#4a4a42] rounded-full border border-white dark:border-[#242421]" />
                            <div className="w-4 h-4 -ml-2 bg-[#ecece4] dark:bg-[#383832] rounded-full border border-white dark:border-[#242421]" />
                          </div>
                        )}
                      </div>

                      {/* Small accent indicator */}
                      <div className="w-12 bg-[#f5f5f0] dark:bg-[#1c1c1a] h-1 rounded-full overflow-hidden">
                        <div className="bg-[#5a5a40] dark:bg-[#8c8c6d] h-full w-2/3" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* + New Item dashed container matching Natural Tones design */}
              <button
                onClick={() => onAddRowWithStatus(status.label)}
                className="w-full bg-[#ecece4]/40 dark:bg-[#2c2c28]/40 p-4 rounded-xl border border-dashed border-[#dadad0] dark:border-[#3c3c34] flex items-center justify-center hover:bg-[#ecece4] dark:hover:bg-[#2c2c28] transition-colors group cursor-pointer h-20"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#9c9c94] group-hover:text-[#5a5a40] dark:group-hover:text-[#c2c2a8] transition-colors">
                  + New Item
                </span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
