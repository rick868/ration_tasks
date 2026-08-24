import React, { useState } from 'react';
import {
  X,
  BookTemplate,
  ArrowRight,
  Search,
  CheckCircle2,
  Sparkles,
  Layers,
  FileText,
  Code,
  Calendar,
  Zap,
  Target,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { TEMPLATE_DEFINITIONS, TemplateDefinition } from '../../templates/templateDefinitions';

export const TemplatesModal: React.FC = () => {
  const { isTemplatesOpen, setIsTemplatesOpen, instantiateTemplate } = useWorkspace();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState<string | null>(null);

  if (!isTemplatesOpen) return null;

  const categories = [
    'All',
    'Engineering & Tech',
    'Product & Strategy',
    'Productivity & Habits',
    'Meetings & Ops',
    'Knowledge & Research',
  ];

  const filteredTemplates = TEMPLATE_DEFINITIONS.filter((tmpl) => {
    const matchesCategory = selectedCategory === 'All' || tmpl.category === selectedCategory;
    const matchesSearch =
      tmpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = async (tmpl: TemplateDefinition) => {
    setIsCreating(tmpl.id);
    try {
      await instantiateTemplate(tmpl.id);
      setIsTemplatesOpen(false);
    } catch (err) {
      console.error('Failed to instantiate template:', err);
    } finally {
      setIsCreating(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-100">
      <div className="flex h-[88vh] w-full max-w-4xl flex-col rounded-2xl border border-[#e5e5df] bg-[#fcfcf9] shadow-2xl dark:border-[#363630] dark:bg-[#1c1c1a] overflow-hidden text-[#2c2c2a] dark:text-[#f0f0ea]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e5e5df] px-6 py-4 dark:border-[#363630]">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#5a5a40]/10 dark:bg-[#8c8c6d]/20 p-2 text-[#5a5a40] dark:text-[#a4a485]">
              <BookTemplate className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif italic text-lg text-[#2c2c2a] dark:text-[#f0f0ea]">
                  Template Library Gallery
                </h3>
                <span className="rounded-full bg-[#ecece4] dark:bg-[#2c2c28] px-2 py-0.5 text-[10px] font-bold text-[#5a5a40] dark:text-[#a4a485]">
                  {TEMPLATE_DEFINITIONS.length} Ready-to-use Presets
                </span>
              </div>
              <p className="text-[11px] text-[#9c9c94]">
                Instantly scaffold engineering roadmaps, PRDs, Zettelkasten wikis, and habits
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTemplatesOpen(false)}
            className="rounded p-1 text-[#9c9c94] hover:bg-[#ecece4] hover:text-[#2c2c2a] dark:hover:bg-[#2c2c28] dark:hover:text-[#f0f0ea] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="border-b border-[#e5e5df] bg-[#f5f5f0]/40 px-6 py-3 dark:border-[#363630] dark:bg-[#171715]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#5a5a40] text-white dark:bg-[#8c8c6d] dark:text-[#1c1c1a] font-semibold shadow-2xs'
                    : 'bg-[#ecece4]/60 text-[#5a5a40] hover:bg-[#ecece4] dark:bg-[#2c2c28]/60 dark:text-[#c2c2a8] dark:hover:bg-[#2c2c28]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[200px] sm:w-56">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#9c9c94]" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#dadad0] bg-white pl-8 pr-3 py-1.5 text-xs text-[#2c2c2a] placeholder-[#9c9c94] focus:outline-none focus:ring-1 focus:ring-[#5a5a40] dark:border-[#3c3c34] dark:bg-[#242421] dark:text-[#f0f0ea]"
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => !isCreating && handleUseTemplate(tmpl)}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[#e5e5df] bg-white shadow-xs hover:border-[#5a5a40] dark:border-[#363630] dark:bg-[#242421] dark:hover:border-[#8c8c6d] cursor-pointer transition-all hover:shadow-md"
              >
                {/* Cover Thumbnail */}
                <div className="relative h-28 w-full overflow-hidden bg-[#ecece4] dark:bg-[#2c2c28]">
                  <img
                    src={tmpl.coverUrl}
                    alt={tmpl.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-3 flex items-center gap-2">
                    <span className="text-2xl drop-shadow-md">{tmpl.icon}</span>
                    <span className="rounded bg-black/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                      {tmpl.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm text-[#2c2c2a] dark:text-[#f0f0ea] line-clamp-1 group-hover:text-[#5a5a40] dark:group-hover:text-[#a4a485] transition-colors">
                      {tmpl.title}
                    </h4>
                    <p className="mt-1.5 text-[11px] text-[#9c9c94] leading-relaxed line-clamp-2">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#e5e5df]/60 pt-2.5 dark:border-[#363630]/60 text-[11px] text-[#5a5a40] dark:text-[#a4a485] font-semibold">
                    <span className="text-[10px] text-[#9c9c94]">100% Offline Ready</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      {isCreating === tmpl.id ? 'Creating...' : 'Use Template'}{' '}
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-[#ecece4] dark:bg-[#2c2c28] flex items-center justify-center text-[#9c9c94] mb-3">
                <Search className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-semibold text-[#2c2c2a] dark:text-[#f0f0ea]">No matching templates</h4>
              <p className="text-xs text-[#9c9c94] mt-1">Try searching for a different keyword or choose All categories.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#e5e5df] px-6 py-3.5 dark:border-[#363630] bg-[#f5f5f0]/40 dark:bg-[#171715]/40 text-xs text-[#9c9c94]">
          <div className="flex items-center gap-2 text-[11px]">
            <Sparkles className="h-3.5 w-3.5 text-[#5a5a40] dark:text-[#a4a485]" />
            <span>Templates scaffold full block trees with todos, callouts, and structured sections</span>
          </div>
          <button
            onClick={() => setIsTemplatesOpen(false)}
            className="rounded-lg border border-[#dadad0] bg-[#ecece4] px-3.5 py-1 text-xs font-semibold text-[#5a5a40] hover:bg-[#e2e2da] dark:border-[#3c3c34] dark:bg-[#2c2c28] dark:text-[#c2c2a8] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
