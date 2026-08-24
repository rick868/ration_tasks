import React, { useState } from 'react';
import { X, Image as ImageIcon, Link as LinkIcon, Upload } from 'lucide-react';

const COVER_PRESETS = [
  { name: 'Warm Gradient', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1600&q=80' },
  { name: 'Misty Mountains', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80' },
  { name: 'Minimalist Desk', url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=80' },
  { name: 'Abstract Earth', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80' },
  { name: 'Japanese Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=80' },
  { name: 'Linen Architecture', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80' },
];

interface CoverPickerProps {
  onSelect: (url: string | null) => void;
  onClose: () => void;
}

export const CoverPicker: React.FC<CoverPickerProps> = ({ onSelect, onClose }) => {
  const [tab, setTab] = useState<'presets' | 'url' | 'upload'>('presets');
  const [customUrl, setCustomUrl] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          onSelect(reader.result as string);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="absolute top-12 right-0 z-50 w-80 rounded-xl border border-[#e5e5df] bg-[#fcfcf9] p-3 shadow-xl dark:border-[#363630] dark:bg-[#1c1c1a] animate-in fade-in zoom-in-95 duration-100">
      <div className="mb-2 flex items-center justify-between border-b border-[#e5e5df] pb-2 dark:border-[#363630]">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#5a5a40] dark:text-[#a4a485]">
          Page Cover
        </span>
        <button
          onClick={onClose}
          className="rounded p-1 text-[#9c9c94] hover:bg-[#ecece4] hover:text-[#2c2c2a] dark:hover:bg-[#2c2c28]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mb-3 flex items-center gap-1 border-b border-[#e5e5df] pb-2 dark:border-[#363630]">
        <button
          onClick={() => setTab('presets')}
          className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            tab === 'presets'
              ? 'bg-[#ecece4] text-[#2c2c2a] dark:bg-[#2c2c28] dark:text-[#f0f0ea] font-semibold'
              : 'text-[#9c9c94] hover:text-[#2c2c2a] dark:hover:text-[#f0f0ea]'
          }`}
        >
          <ImageIcon className="h-3 w-3" /> Presets
        </button>
        <button
          onClick={() => setTab('url')}
          className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            tab === 'url'
              ? 'bg-[#ecece4] text-[#2c2c2a] dark:bg-[#2c2c28] dark:text-[#f0f0ea] font-semibold'
              : 'text-[#9c9c94] hover:text-[#2c2c2a] dark:hover:text-[#f0f0ea]'
          }`}
        >
          <LinkIcon className="h-3 w-3" /> Link
        </button>
        <button
          onClick={() => setTab('upload')}
          className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            tab === 'upload'
              ? 'bg-[#ecece4] text-[#2c2c2a] dark:bg-[#2c2c28] dark:text-[#f0f0ea] font-semibold'
              : 'text-[#9c9c94] hover:text-[#2c2c2a] dark:hover:text-[#f0f0ea]'
          }`}
        >
          <Upload className="h-3 w-3" /> Upload
        </button>
      </div>

      {tab === 'presets' && (
        <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
          {COVER_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelect(preset.url);
                onClose();
              }}
              className="group relative h-16 w-full overflow-hidden rounded-lg border border-[#e5e5df] dark:border-[#363630] hover:ring-2 hover:ring-[#5a5a40] transition-all text-left"
            >
              <img
                src={preset.url}
                alt={preset.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[9px] text-white">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      )}

      {tab === 'url' && (
        <div className="space-y-3 py-2">
          <input
            type="text"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="Paste image web URL..."
            className="w-full rounded-md border border-[#dadad0] bg-[#ecece4]/50 px-2.5 py-1.5 text-xs text-[#2c2c2a] focus:border-[#5a5a40] focus:bg-white focus:outline-none dark:border-[#3c3c34] dark:bg-[#262622] dark:text-[#f0f0ea]"
            autoFocus
          />
          <button
            onClick={() => {
              if (customUrl.trim()) {
                onSelect(customUrl.trim());
                onClose();
              }
            }}
            disabled={!customUrl.trim()}
            className="w-full rounded-lg bg-[#5a5a40] dark:bg-[#8c8c6d] py-1.5 text-xs font-semibold text-white dark:text-[#1c1c1a] hover:bg-[#444430] dark:hover:bg-[#a4a485] disabled:opacity-50 transition-colors"
          >
            Apply Image URL
          </button>
        </div>
      )}

      {tab === 'upload' && (
        <div className="py-4 text-center">
          <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#dadad0] bg-[#ecece4]/40 p-4 hover:border-[#5a5a40] dark:border-[#3c3c34] dark:bg-[#262622]/40 cursor-pointer transition-colors">
            <Upload className="h-6 w-6 text-[#5a5a40] dark:text-[#a4a485] mb-1" />
            <span className="text-xs font-semibold text-[#5a5a40] dark:text-[#c2c2a8]">Upload from device</span>
            <span className="text-[10px] text-[#9c9c94]">PNG, JPG, WebP stored directly in IndexedDB</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      )}
    </div>
  );
};
