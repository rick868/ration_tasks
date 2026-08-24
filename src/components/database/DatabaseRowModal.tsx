import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, Tag, AlertCircle, Hash, Type, CheckSquare, ShieldCheck } from 'lucide-react';
import { DatabaseRow, DatabaseProperty, Block } from '../../types';
import { blockRepo } from '../../storage/repositories';
import { BlockItem } from '../editor/BlockItem';
import { SlashMenu, SlashItem } from '../editor/SlashMenu';

interface DatabaseRowModalProps {
  row: DatabaseRow;
  properties: DatabaseProperty[];
  onUpdateRow: (updatedRow: DatabaseRow) => void;
  onDeleteRow: (rowId: string) => void;
  onClose: () => void;
}

export const DatabaseRowModal: React.FC<DatabaseRowModalProps> = ({
  row,
  properties,
  onUpdateRow,
  onDeleteRow,
  onClose,
}) => {
  const [currentRow, setCurrentRow] = useState<DatabaseRow>(row);
  const [nestedBlocks, setNestedBlocks] = useState<Block[]>([]);
  const [slashMenu, setSlashMenu] = useState<{
    isOpen: boolean;
    position: { top: number; left: number };
    query: string;
    targetBlockIndex: number;
  }>({
    isOpen: false,
    position: { top: 0, left: 0 },
    query: '',
    targetBlockIndex: 0,
  });

  // Load nested blocks for this database row
  useEffect(() => {
    const loadRowBlocks = async () => {
      const blocks = await blockRepo.getByPageId(row.id);
      if (blocks.length === 0) {
        const initialBlock: Block = {
          id: `b_row_${crypto.randomUUID().slice(0, 6)}`,
          pageId: row.id,
          parentId: null,
          type: 'paragraph',
          content: { text: '' },
          properties: {},
          orderIndex: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setNestedBlocks([initialBlock]);
        await blockRepo.saveBatch(row.id, [initialBlock]);
      } else {
        setNestedBlocks(blocks);
      }
    };
    loadRowBlocks();
  }, [row.id]);

  const handleTitleChange = (newTitle: string) => {
    const updated = { ...currentRow, title: newTitle, updatedAt: Date.now() };
    setCurrentRow(updated);
    onUpdateRow(updated);
  };

  const handlePropertyValueChange = (propId: string, val: unknown) => {
    const updated = {
      ...currentRow,
      values: { ...currentRow.values, [propId]: val },
      updatedAt: Date.now(),
    };
    setCurrentRow(updated);
    onUpdateRow(updated);
  };

  const handleUpdateBlock = (index: number, updates: Partial<Block>) => {
    const newBlocks = [...nestedBlocks];
    newBlocks[index] = { ...newBlocks[index], ...updates, updatedAt: Date.now() };
    setNestedBlocks(newBlocks);
    blockRepo.saveBatch(row.id, newBlocks);
  };

  const handleDeleteBlock = (index: number) => {
    const newBlocks = nestedBlocks.filter((_, i) => i !== index);
    if (newBlocks.length === 0) {
      newBlocks.push({
        id: `b_row_${crypto.randomUUID().slice(0, 6)}`,
        pageId: row.id,
        parentId: null,
        type: 'paragraph',
        content: { text: '' },
        properties: {},
        orderIndex: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    setNestedBlocks(newBlocks);
    blockRepo.saveBatch(row.id, newBlocks);
  };

  const handleDuplicateBlock = (index: number) => {
    const target = nestedBlocks[index];
    const cloned: Block = {
      ...target,
      id: `b_row_${crypto.randomUUID().slice(0, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const newBlocks = [...nestedBlocks];
    newBlocks.splice(index + 1, 0, cloned);
    setNestedBlocks(newBlocks);
    blockRepo.saveBatch(row.id, newBlocks);
  };

  const handleAddBlockAfter = (index: number, type: Block['type'] = 'paragraph') => {
    const newBlock: Block = {
      id: `b_row_${crypto.randomUUID().slice(0, 6)}`,
      pageId: row.id,
      parentId: null,
      type,
      content: { text: '' },
      properties: {},
      orderIndex: index + 2,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const newBlocks = [...nestedBlocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setNestedBlocks(newBlocks);
    blockRepo.saveBatch(row.id, newBlocks);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-100">
      <div className="flex h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-[#e5e5df] bg-[#fcfcf9] shadow-2xl dark:border-[#363630] dark:bg-[#1c1c1a] overflow-hidden text-[#2c2c2a] dark:text-[#f0f0ea]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-[#e5e5df] px-6 py-3.5 dark:border-[#363630]">
          <div className="flex items-center gap-2 text-xs text-[#9c9c94]">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Local Database Document</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (confirm('Delete this row and its nested content?')) {
                  onDeleteRow(row.id);
                }
              }}
              title="Delete row"
              className="rounded p-1 text-[#9c9c94] hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded p-1 text-[#9c9c94] hover:bg-[#ecece4] hover:text-[#2c2c2a] dark:hover:bg-[#2c2c28] dark:hover:text-[#f0f0ea]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6">
          {/* Row Title */}
          <input
            type="text"
            value={currentRow.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled card..."
            className="w-full bg-transparent font-serif italic text-3xl sm:text-4xl text-[#2c2c2a] dark:text-[#f0f0ea] placeholder:text-[#9c9c94]/50 focus:outline-none mb-6"
          />

          {/* Properties Grid */}
          <div className="mb-6 rounded-xl border border-[#e5e5df] bg-[#ecece4]/40 p-4 dark:border-[#363630] dark:bg-[#262622]/40 space-y-3">
            {properties.map((prop) => {
              const val = currentRow.values[prop.id];

              return (
                <div key={prop.id} className="flex items-center gap-4 text-xs">
                  <div className="w-28 shrink-0 font-medium text-[#5a5a40] dark:text-[#a4a485]">
                    {prop.name}
                  </div>
                  <div className="flex-1">
                    {prop.type === 'status' || prop.type === 'priority' || prop.type === 'select' ? (
                      <select
                        value={(val as string) || ''}
                        onChange={(e) => handlePropertyValueChange(prop.id, e.target.value)}
                        className="rounded-md border border-[#dadad0] bg-white px-2.5 py-1 text-xs text-[#2c2c2a] focus:outline-none dark:border-[#3c3c34] dark:bg-[#1c1c1a] dark:text-[#f0f0ea]"
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
                        onChange={(e) => handlePropertyValueChange(prop.id, e.target.value)}
                        className="rounded-md border border-[#dadad0] bg-white px-2 py-1 text-xs text-[#2c2c2a] dark:border-[#3c3c34] dark:bg-[#1c1c1a] dark:text-[#f0f0ea]"
                      />
                    ) : prop.type === 'checkbox' ? (
                      <input
                        type="checkbox"
                        checked={!!val}
                        onChange={(e) => handlePropertyValueChange(prop.id, e.target.checked)}
                        className="h-4 w-4 rounded border-[#dadad0] text-[#5a5a40]"
                      />
                    ) : (
                      <input
                        type="text"
                        value={(val as string) || ''}
                        onChange={(e) => handlePropertyValueChange(prop.id, e.target.value)}
                        placeholder="Empty..."
                        className="w-full rounded-md border border-[#dadad0] bg-white px-2.5 py-1 text-xs text-[#2c2c2a] focus:outline-none dark:border-[#3c3c34] dark:bg-[#1c1c1a] dark:text-[#f0f0ea]"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mb-4 border-t border-[#e5e5df] dark:border-[#363630] pt-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9c9c94]">
              Nested Document Blocks
            </span>
          </div>

          {/* Nested Block Editor inside Row Modal */}
          <div className="space-y-1">
            {nestedBlocks.map((block, idx) => (
              <BlockItem
                key={block.id}
                block={block}
                index={idx}
                totalBlocks={nestedBlocks.length}
                onUpdate={(updates) => handleUpdateBlock(idx, updates)}
                onDelete={() => handleDeleteBlock(idx)}
                onDuplicate={() => handleDuplicateBlock(idx)}
                onAddAfter={(type) => handleAddBlockAfter(idx, type)}
                onMoveUp={() => {}}
                onMoveDown={() => {}}
                onOpenSlashMenu={(pos) =>
                  setSlashMenu({
                    isOpen: true,
                    position: pos,
                    query: '',
                    targetBlockIndex: idx,
                  })
                }
                workspaceId="ws_local"
              />
            ))}
          </div>
        </div>

        {/* Slash Command Menu */}
        {slashMenu.isOpen && (
          <SlashMenu
            position={slashMenu.position}
            query={slashMenu.query}
            onSelect={(item: SlashItem) => {
              handleUpdateBlock(slashMenu.targetBlockIndex, {
                type: item.type,
                content: { text: '', ...item.initialContent },
              });
              setSlashMenu((prev) => ({ ...prev, isOpen: false }));
            }}
            onClose={() => setSlashMenu((prev) => ({ ...prev, isOpen: false }))}
          />
        )}
      </div>
    </div>
  );
};
