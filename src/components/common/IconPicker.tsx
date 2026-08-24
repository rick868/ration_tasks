import React, { useState } from 'react';
import { Smile, X, Search } from 'lucide-react';

const EMOJI_CATEGORIES = {
  'Productivity & Work': ['🚀', '⚡', '📋', '🎯', '💡', '📊', '📈', '📌', '🏷️', '📝', '🗓️', '📦', '🗄️', '💼', '🔨', '⚙️', '🔍', '🔑', '📚', '📖'],
  'Tech & Code': ['💻', '🖥️', '⌨️', '📱', '🕹️', '💾', '💿', '📡', '🔋', '🔌', '🎛️', '🤖', '🛰️', '🧠', '🛡️', '🔒', '🌐', '🚀', '⚡', '✨'],
  'Nature & Elements': ['🌱', '🌿', '🌲', '🌸', '🌻', '🍁', '🍂', '🍄', '🌍', '🌊', '🔥', '💧', '☀️', '🌙', '⭐', '🌈', '🏔️', '🏝️', '🌋', '⛺'],
  'Objects & Symbols': ['💎', '🎨', '🧩', '🧪', '🔭', '🔮', '🧭', '⏱️', '🔔', '📣', '🎁', '🏆', '🥇', '👑', '☕', '🍵', '🍕', '🍰', '🍿', '💡'],
};

interface IconPickerProps {
  currentIcon: string | null;
  onSelect: (emoji: string | null) => void;
  onClose: () => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ currentIcon, onSelect, onClose }) => {
  const [search, setSearch] = useState('');

  const allEmojis = Object.values(EMOJI_CATEGORIES).flat();
  const filtered = search.trim()
    ? allEmojis.filter((e) => e.includes(search))
    : null;

  return (
    <div className="absolute top-12 left-0 z-50 w-72 rounded-xl border border-[#e5e5df] bg-[#fcfcf9] p-3 shadow-xl dark:border-[#363630] dark:bg-[#1c1c1a] animate-in fade-in zoom-in-95 duration-100">
      <div className="mb-2 flex items-center justify-between border-b border-[#e5e5df] pb-2 dark:border-[#363630]">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#5a5a40] dark:text-[#a4a485]">
          Select Icon
        </span>
        <div className="flex items-center gap-1">
          {currentIcon && (
            <button
              onClick={() => {
                onSelect(null);
                onClose();
              }}
              className="rounded px-1.5 py-0.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              Remove
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded p-1 text-[#9c9c94] hover:bg-[#ecece4] hover:text-[#2c2c2a] dark:hover:bg-[#2c2c28]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="relative mb-2">
        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#9c9c94]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter icons..."
          className="w-full rounded-md border border-[#dadad0] bg-[#ecece4]/50 py-1.5 pl-8 pr-2 text-xs text-[#2c2c2a] placeholder:text-[#9c9c94] focus:border-[#5a5a40] focus:bg-white focus:outline-none dark:border-[#3c3c34] dark:bg-[#262622] dark:text-[#f0f0ea]"
          autoFocus
        />
      </div>

      <div className="max-h-56 overflow-y-auto pr-1">
        {filtered ? (
          <div className="grid grid-cols-6 gap-1">
            {filtered.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelect(emoji);
                  onClose();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-lg hover:bg-[#ecece4] dark:hover:bg-[#2c2c28] transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          Object.entries(EMOJI_CATEGORIES).map(([cat, emojis]) => (
            <div key={cat} className="mb-2">
              <div className="mb-1 text-[10px] font-bold text-[#9c9c94] uppercase tracking-wider">{cat}</div>
              <div className="grid grid-cols-6 gap-1">
                {emojis.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelect(emoji);
                      onClose();
                    }}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-colors ${
                      currentIcon === emoji
                        ? 'bg-[#ecece4] ring-1 ring-[#5a5a40] dark:bg-[#2c2c28] dark:ring-[#8c8c6d]'
                        : 'hover:bg-[#ecece4] dark:hover:bg-[#2c2c28]'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
