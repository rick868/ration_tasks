import React, { useState } from 'react';
import { X, Type, Hash, CheckSquare, Calendar, Tag, AlertCircle, Link, Mail, Trash2 } from 'lucide-react';
import { DatabaseProperty, PropertyType } from '../../types';
import { databaseRepo } from '../../storage/repositories';

interface PropertyConfigModalProps {
  databaseId: string;
  properties?: DatabaseProperty[];
  onClose: () => void;
  onPropertiesUpdated?: (props: DatabaseProperty[]) => void;
}

const PROPERTY_TYPES: Array<{ type: PropertyType; label: string; icon: React.ReactNode }> = [
  { type: 'text', label: 'Text', icon: <Type className="h-3.5 w-3.5" /> },
  { type: 'number', label: 'Number', icon: <Hash className="h-3.5 w-3.5" /> },
  { type: 'select', label: 'Select / Tag', icon: <Tag className="h-3.5 w-3.5" /> },
  { type: 'status', label: 'Status', icon: <AlertCircle className="h-3.5 w-3.5" /> },
  { type: 'priority', label: 'Priority', icon: <AlertCircle className="h-3.5 w-3.5 text-amber-500" /> },
  { type: 'date', label: 'Date', icon: <Calendar className="h-3.5 w-3.5" /> },
  { type: 'checkbox', label: 'Checkbox', icon: <CheckSquare className="h-3.5 w-3.5" /> },
  { type: 'url', label: 'URL', icon: <Link className="h-3.5 w-3.5" /> },
  { type: 'email', label: 'Email', icon: <Mail className="h-3.5 w-3.5" /> },
];

export const PropertyConfigModal: React.FC<PropertyConfigModalProps> = ({
  databaseId,
  properties = [],
  onClose,
  onPropertiesUpdated,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<PropertyType>('text');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProp: DatabaseProperty = {
      id: `prop_${crypto.randomUUID().slice(0, 8)}`,
      databaseId,
      name: name.trim(),
      type,
      config:
        type === 'select'
          ? {
              options: [
                { id: 'opt_1', label: 'Feature', color: 'bg-[#ecece4] text-[#5a5a40]' },
                { id: 'opt_2', label: 'Bug', color: 'bg-rose-100 text-rose-800' },
              ],
            }
          : {},
      orderIndex: properties.length + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await databaseRepo.createProperty(newProp);
    if (onPropertiesUpdated) {
      onPropertiesUpdated([...properties, newProp]);
    }
    onClose();
  };

  const handleDeleteExisting = async (propId: string) => {
    await databaseRepo.deleteProperty(propId);
    if (onPropertiesUpdated) {
      onPropertiesUpdated(properties.filter((p) => p.id !== propId));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div className="w-full max-w-md rounded-2xl border border-[#e5e5df] bg-[#fcfcf9] p-5 shadow-2xl dark:border-[#363630] dark:bg-[#1c1c1a] text-[#2c2c2a] dark:text-[#f0f0ea]">
        <div className="mb-4 flex items-center justify-between border-b border-[#e5e5df] pb-3 dark:border-[#363630]">
          <h3 className="font-serif italic text-lg text-[#2c2c2a] dark:text-[#f0f0ea]">
            Configure Database Columns
          </h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-[#9c9c94] hover:bg-[#ecece4] hover:text-[#2c2c2a] dark:hover:bg-[#2c2c28] dark:hover:text-[#f0f0ea]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Existing properties */}
        {properties.length > 0 && (
          <div className="mb-4 space-y-1.5 max-h-36 overflow-y-auto pr-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#9c9c94] mb-1">
              Active Columns
            </div>
            {properties.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-[#e5e5df] bg-white px-3 py-1.5 text-xs dark:border-[#363630] dark:bg-[#242421]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#2c2c2a] dark:text-[#f0f0ea]">{p.name}</span>
                  <span className="rounded bg-[#ecece4] dark:bg-[#2c2c28] px-1.5 py-0.2 text-[10px] text-[#5a5a40] dark:text-[#a4a485]">
                    {p.type}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteExisting(p.id)}
                  className="text-[#9c9c94] hover:text-rose-600 p-0.5 rounded"
                  title="Remove column"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 border-t border-[#e5e5df] dark:border-[#363630] pt-3">
          <div>
            <label className="block text-xs font-semibold text-[#5a5a40] dark:text-[#a4a485] mb-1">
              New Column Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Estimate, Client, Due Date"
              className="w-full rounded-lg border border-[#dadad0] bg-[#ecece4]/40 px-3 py-2 text-xs text-[#2c2c2a] placeholder:text-[#9c9c94] focus:border-[#5a5a40] focus:bg-white focus:outline-none dark:border-[#3c3c34] dark:bg-[#262622] dark:text-[#f0f0ea]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5a5a40] dark:text-[#a4a485] mb-1.5">
              Property Type
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {PROPERTY_TYPES.map((pt) => (
                <button
                  type="button"
                  key={pt.type}
                  onClick={() => setType(pt.type)}
                  className={`flex items-center gap-2 rounded-lg border p-2 text-left text-xs transition-colors ${
                    type === pt.type
                      ? 'border-[#5a5a40] bg-[#ecece4] text-[#2c2c2a] dark:border-[#8c8c6d] dark:bg-[#2c2c28] dark:text-[#f0f0ea] font-semibold'
                      : 'border-[#e5e5df] hover:bg-[#ecece4]/40 dark:border-[#363630] dark:hover:bg-[#262622] text-[#5a5a40] dark:text-[#c2c2a8]'
                  }`}
                >
                  {pt.icon}
                  <span className="truncate">{pt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e5e5df] dark:border-[#363630]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-xs text-[#9c9c94] hover:bg-[#ecece4] hover:text-[#2c2c2a] dark:hover:bg-[#2c2c28]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="rounded-lg bg-[#5a5a40] dark:bg-[#8c8c6d] px-4 py-1.5 text-xs font-semibold text-white dark:text-[#1c1c1a] hover:bg-[#444430] dark:hover:bg-[#a4a485] disabled:opacity-50 transition-colors"
            >
              Add Column
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
