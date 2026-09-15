import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Block, BlockType } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import { BlockItem } from './BlockItem';
import { SlashMenu, SlashItem } from './SlashMenu';
import { FormattingToolbar } from './FormattingToolbar';
import { Plus } from 'lucide-react';

export const BlockEditor: React.FC = () => {
  const { activePage, activeBlocks, updateBlocks, workspace, createPage, selectPage } = useWorkspace();
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

  const [formattingPos, setFormattingPos] = useState<{ top: number; left: number } | null>(null);

  // Monitor text selection for floating toolbar
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed && selection.toString().trim().length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setFormattingPos({
          top: rect.top,
          left: rect.left + rect.width / 2 - 80,
        });
      } else {
        setFormattingPos(null);
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  const handleFormat = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
  };

  const handleUpdateBlock = (index: number, updates: Partial<Block>) => {
    if (!activePage) return;
    const newBlocks = [...activeBlocks];
    newBlocks[index] = {
      ...newBlocks[index],
      ...updates,
      updatedAt: Date.now(),
    };
    updateBlocks(activePage.id, newBlocks);
  };

  const handleDeleteBlock = (index: number) => {
    if (!activePage) return;
    const newBlocks = activeBlocks.filter((_, i) => i !== index);
    if (newBlocks.length === 0) {
      newBlocks.push({
        id: `b_${crypto.randomUUID().slice(0, 8)}`,
        pageId: activePage.id,
        parentId: null,
        type: 'paragraph',
        content: { text: '' },
        properties: {},
        orderIndex: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    updateBlocks(activePage.id, newBlocks, true);
  };

  const handleDuplicateBlock = (index: number) => {
    if (!activePage) return;
    const target = activeBlocks[index];
    const cloned: Block = {
      ...target,
      id: `b_${crypto.randomUUID().slice(0, 8)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const newBlocks = [...activeBlocks];
    newBlocks.splice(index + 1, 0, cloned);
    updateBlocks(activePage.id, newBlocks);
  };

  const handleAddBlockAfter = (index: number, type: BlockType = 'paragraph') => {
    if (!activePage) return;
    const newBlock: Block = {
      id: `b_${crypto.randomUUID().slice(0, 8)}`,
      pageId: activePage.id,
      parentId: null,
      type,
      content: { text: '' },
      properties: {},
      orderIndex: (activeBlocks[index]?.orderIndex || index) + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const newBlocks = [...activeBlocks];
    newBlocks.splice(index + 1, 0, newBlock);
    updateBlocks(activePage.id, newBlocks);
  };

  const handleMoveBlock = (fromIndex: number, toIndex: number) => {
    if (!activePage || toIndex < 0 || toIndex >= activeBlocks.length) return;
    const newBlocks = [...activeBlocks];
    const [moved] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, moved);
    updateBlocks(activePage.id, newBlocks);
  };

  const handleSlashSelect = async (item: SlashItem) => {
    if (!activePage) return;
    const index = slashMenu.targetBlockIndex;
    const newBlocks = [...activeBlocks];
    const target = newBlocks[index];

    if (item.id === 'kanban-board') {
      const titleText = (target.content.text || '').replace(/^\//, '').trim();
      const boardTitle = titleText || 'Kanban Board';

      const createdPage = await createPage(activePage.parentId ?? null, true, boardTitle);
      selectPage(createdPage.id);

      newBlocks[index] = {
        ...target,
        type: 'paragraph',
        content: {
          ...target.content,
          text: '',
        },
        updatedAt: Date.now(),
      };

      await updateBlocks(activePage.id, newBlocks);
      setSlashMenu((prev) => ({ ...prev, isOpen: false }));
      return;
    }

    newBlocks[index] = {
      ...target,
      type: item.type,
      content: {
        ...target.content,
        text: (target.content.text || '').replace(/^\//, ''),
        ...(item.initialContent || {}),
      },
      updatedAt: Date.now(),
    };

    updateBlocks(activePage.id, newBlocks);
    setSlashMenu((prev) => ({ ...prev, isOpen: false }));
  };

  if (!activePage) return null;

  return (
    <div className="mx-auto max-w-4xl px-6 pb-32 pt-6">
      {/* Blocks List */}
      <div className="space-y-1">
        {activeBlocks.map((block, index) => (
          <BlockItem
            key={block.id}
            block={block}
            index={index}
            totalBlocks={activeBlocks.length}
            onUpdate={(updates) => handleUpdateBlock(index, updates)}
            onDelete={() => handleDeleteBlock(index)}
            onDuplicate={() => handleDuplicateBlock(index)}
            onAddAfter={(type) => handleAddBlockAfter(index, type)}
            onMoveUp={() => handleMoveBlock(index, index - 1)}
            onMoveDown={() => handleMoveBlock(index, index + 1)}
            onOpenSlashMenu={(pos) =>
              setSlashMenu({
                isOpen: true,
                position: pos,
                query: '',
                targetBlockIndex: index,
              })
            }
            workspaceId={workspace?.id || 'default'}
          />
        ))}
      </div>

      {/* Floating Plus at bottom to append new block */}
      <div className="mt-4 pt-2">
        <button
          onClick={() => handleAddBlockAfter(activeBlocks.length - 1)}
          className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors py-1"
        >
          <Plus className="h-3.5 w-3.5" /> Click to add block, or type &apos;/&apos;
        </button>
      </div>

      {/* Slash Palette */}
      {slashMenu.isOpen && (
        <SlashMenu
          position={slashMenu.position}
          query={slashMenu.query}
          onSelect={handleSlashSelect}
          onClose={() => setSlashMenu((prev) => ({ ...prev, isOpen: false }))}
        />
      )}

      {/* Formatting Selection Toolbar */}
      {formattingPos && (
        <FormattingToolbar position={formattingPos} onFormat={handleFormat} />
      )}
    </div>
  );
};
