import React from 'react';
import { Plus, Tag, Calendar, AlertCircle } from 'lucide-react';
import { DatabaseRow, DatabaseProperty } from '../../types';

interface GalleryViewProps {
  properties: DatabaseProperty[];
  rows: DatabaseRow[];
  onUpdateRow: (row: DatabaseRow) => void;
  onDeleteRow: (rowId: string) => void;
  onAddRow: () => void;
  onOpenRowModal: (row: DatabaseRow) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  properties,
  rows,
  onAddRow,
  onOpenRowModal,
}) => {
  const statusProp = properties.find((p) => p.type === 'status');
  const dateProp = properties.find((p) => p.type === 'date');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-3">
      {rows.map((row) => {
        const statusVal = statusProp ? (row.values[statusProp.id] as string) : null;
        const dateVal = dateProp ? (row.values[dateProp.id] as string) : null;

        return (
          <div
            key={row.id}
            onClick={() => onOpenRowModal(row)}
            className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[#e5e5df] dark:border-[#363630] bg-white dark:bg-[#242421] p-4 shadow-xs hover:border-[#5a5a40] dark:hover:border-[#8c8c6d] hover:shadow-md cursor-pointer transition-all min-h-[140px]"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl shrink-0">{row.icon || '📄'}</span>
                <h4 className="text-sm font-semibold text-[#2c2c2a] dark:text-[#f0f0ea] truncate">
                  {row.title || 'Untitled'}
                </h4>
              </div>

              {statusVal && (
                <div className="mb-2">
                  <span className="inline-block rounded-md bg-[#ecece4] dark:bg-[#2c2c28] px-2 py-0.5 text-[10px] font-bold text-[#5a5a40] dark:text-[#c2c2a8]">
                    {statusVal}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-[#e5e5df]/60 dark:border-[#363630]/60 pt-2 text-[11px] text-[#9c9c94]">
              {dateVal ? (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-[#5a5a40] dark:text-[#a4a485]" />
                  {dateVal}
                </span>
              ) : (
                <span>Local item</span>
              )}
              <span className="text-[10px] text-[#5a5a40] dark:text-[#a4a485] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Open &rarr;
              </span>
            </div>
          </div>
        );
      })}

      {/* Add New Card */}
      <button
        onClick={onAddRow}
        className="flex min-h-[140px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#dadad0] dark:border-[#3c3c34] bg-[#ecece4]/30 dark:bg-[#2c2c28]/30 p-4 text-[#9c9c94] hover:border-[#5a5a40] hover:text-[#5a5a40] dark:hover:text-[#c2c2a8] transition-colors"
      >
        <Plus className="h-5 w-5 mb-1 text-[#5a5a40] dark:text-[#a4a485]" />
        <span className="text-xs font-bold uppercase tracking-wider">New Gallery Card</span>
      </button>
    </div>
  );
};
