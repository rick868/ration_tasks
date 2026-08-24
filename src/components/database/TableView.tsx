import React from 'react';
import { Plus, Calendar, Tag, AlertCircle, Hash, Type, CheckSquare, Trash2 } from 'lucide-react';
import { DatabaseRow, DatabaseProperty } from '../../types';

interface TableViewProps {
  properties: DatabaseProperty[];
  rows: DatabaseRow[];
  onUpdateRow: (row: DatabaseRow) => void;
  onDeleteRow: (rowId: string) => void;
  onAddRow: () => void;
  onOpenRowModal: (row: DatabaseRow) => void;
  onConfigureProperties?: () => void;
}

export const TableView: React.FC<TableViewProps> = ({
  properties,
  rows,
  onUpdateRow,
  onDeleteRow,
  onAddRow,
  onOpenRowModal,
  onConfigureProperties,
}) => {
  const getPropIcon = (type: string) => {
    switch (type) {
      case 'status':
        return <AlertCircle className="h-3 w-3 text-[#5a5a40] dark:text-[#a4a485]" />;
      case 'priority':
        return <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />;
      case 'select':
        return <Tag className="h-3 w-3 text-[#5a5a40] dark:text-[#a4a485]" />;
      case 'date':
        return <Calendar className="h-3 w-3 text-[#5a5a40] dark:text-[#a4a485]" />;
      case 'number':
        return <Hash className="h-3 w-3 text-[#9c9c94]" />;
      case 'checkbox':
        return <CheckSquare className="h-3 w-3 text-[#9c9c94]" />;
      default:
        return <Type className="h-3 w-3 text-[#9c9c94]" />;
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[#e5e5df] dark:border-[#363630] bg-white dark:bg-[#242421] shadow-xs">
      <table className="w-full border-collapse text-left text-xs text-[#2c2c2a] dark:text-[#f0f0ea]">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-[#e5e5df] bg-[#ecece4]/60 dark:border-[#363630] dark:bg-[#2c2c28]/60 text-[#5a5a40] dark:text-[#c2c2a8] font-medium">
            <th className="w-12 px-3 py-2 text-center text-[#9c9c94]">#</th>
            <th className="min-w-[220px] px-3 py-2 font-semibold text-[#2c2c2a] dark:text-[#f0f0ea]">
              <span className="flex items-center gap-1.5">
                <Type className="h-3 w-3 text-[#9c9c94]" /> Name / Title
              </span>
            </th>
            {properties.map((prop) => (
              <th key={prop.id} className="min-w-[150px] px-3 py-2">
                <span className="flex items-center gap-1.5 truncate">
                  {getPropIcon(prop.type)}
                  {prop.name}
                </span>
              </th>
            ))}
            <th className="w-10 px-2 py-2 text-center">
              {onConfigureProperties && (
                <button
                  onClick={onConfigureProperties}
                  title="Configure Columns"
                  className="flex h-5 w-5 items-center justify-center rounded text-[#9c9c94] hover:bg-[#ecece4] hover:text-[#2c2c2a] dark:hover:bg-[#363630]"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              )}
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-[#e5e5df]/60 dark:divide-[#363630]/60">
          {rows.map((row, idx) => (
            <tr
              key={row.id}
              className="group hover:bg-[#ecece4]/30 dark:hover:bg-[#2c2c28]/30 transition-colors"
            >
              <td className="px-3 py-2 text-center text-[#9c9c94]">{idx + 1}</td>

              {/* Title Cell */}
              <td className="px-3 py-2 font-medium text-[#2c2c2a] dark:text-[#f0f0ea]">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={row.title}
                    onChange={(e) => onUpdateRow({ ...row, title: e.target.value, updatedAt: Date.now() })}
                    placeholder="Empty row..."
                    className="w-full bg-transparent focus:outline-none placeholder:text-[#9c9c94]/60"
                  />
                  <button
                    onClick={() => onOpenRowModal(row)}
                    className="opacity-0 group-hover:opacity-100 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-[#5a5a40] dark:text-[#c2c2a8] bg-[#ecece4] dark:bg-[#2c2c28] hover:bg-[#dadad0] transition-opacity shrink-0"
                  >
                    OPEN
                  </button>
                </div>
              </td>

              {/* Dynamic Property Cells */}
              {properties.map((prop) => {
                const val = row.values[prop.id];

                return (
                  <td key={prop.id} className="px-3 py-2">
                    {prop.type === 'status' || prop.type === 'priority' || prop.type === 'select' ? (
                      <select
                        value={(val as string) || ''}
                        onChange={(e) =>
                          onUpdateRow({
                            ...row,
                            values: { ...row.values, [prop.id]: e.target.value },
                            updatedAt: Date.now(),
                          })
                        }
                        className="rounded-md border border-[#dadad0] bg-[#fcfcf9] px-2 py-0.5 text-xs text-[#2c2c2a] focus:outline-none dark:border-[#3c3c34] dark:bg-[#1c1c1a] dark:text-[#f0f0ea]"
                      >
                        <option value="">—</option>
                        {prop.config?.options?.map((opt) => (
                          <option key={opt.id} value={opt.label}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : prop.type === 'date' ? (
                      <input
                        type="date"
                        value={(val as string) || ''}
                        onChange={(e) =>
                          onUpdateRow({
                            ...row,
                            values: { ...row.values, [prop.id]: e.target.value },
                            updatedAt: Date.now(),
                          })
                        }
                        className="rounded border border-transparent hover:border-[#dadad0] bg-transparent px-1 py-0.5 text-xs text-[#2c2c2a] focus:outline-none dark:text-[#f0f0ea]"
                      />
                    ) : prop.type === 'checkbox' ? (
                      <input
                        type="checkbox"
                        checked={!!val}
                        onChange={(e) =>
                          onUpdateRow({
                            ...row,
                            values: { ...row.values, [prop.id]: e.target.checked },
                            updatedAt: Date.now(),
                          })
                        }
                        className="h-3.5 w-3.5 rounded border-[#dadad0] text-[#5a5a40] focus:ring-[#5a5a40]"
                      />
                    ) : prop.type === 'number' ? (
                      <input
                        type="number"
                        value={val !== undefined ? String(val) : ''}
                        onChange={(e) =>
                          onUpdateRow({
                            ...row,
                            values: { ...row.values, [prop.id]: Number(e.target.value) },
                            updatedAt: Date.now(),
                          })
                        }
                        placeholder="0"
                        className="w-full bg-transparent focus:outline-none text-[#2c2c2a] dark:text-[#f0f0ea]"
                      />
                    ) : (
                      <input
                        type="text"
                        value={(val as string) || ''}
                        onChange={(e) =>
                          onUpdateRow({
                            ...row,
                            values: { ...row.values, [prop.id]: e.target.value },
                            updatedAt: Date.now(),
                          })
                        }
                        placeholder="Empty"
                        className="w-full bg-transparent focus:outline-none text-[#2c2c2a] dark:text-[#f0f0ea] placeholder:text-[#9c9c94]/50"
                      />
                    )}
                  </td>
                );
              })}

              <td className="px-2 py-2 text-center">
                <button
                  onClick={() => onDeleteRow(row.id)}
                  className="opacity-0 group-hover:opacity-100 rounded p-1 text-[#9c9c94] hover:text-rose-600 transition-opacity"
                  title="Delete row"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </td>
            </tr>
          ))}

          {/* Add Row Action */}
          <tr>
            <td colSpan={properties.length + 3} className="px-3 py-2.5">
              <button
                onClick={onAddRow}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#5a5a40] dark:text-[#c2c2a8] hover:text-[#2c2c2a] dark:hover:text-white transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> + New Row
              </button>
            </td>
          </tr>
        </tbody>

        {/* Table Footer Calculations */}
        <tfoot>
          <tr className="border-t border-[#e5e5df] bg-[#ecece4]/40 dark:border-[#363630] dark:bg-[#2c2c28]/40 text-[#9c9c94] text-[11px]">
            <td className="px-3 py-2"></td>
            <td className="px-3 py-2 font-medium">Count: {rows.length}</td>
            {properties.map((prop) => (
              <td key={prop.id} className="px-3 py-2">
                {prop.type === 'number' && (
                  <span>
                    Sum:{' '}
                    {rows.reduce(
                      (acc, r) => acc + (typeof r.values[prop.id] === 'number' ? Number(r.values[prop.id]) : 0),
                      0
                    )}
                  </span>
                )}
              </td>
            ))}
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
