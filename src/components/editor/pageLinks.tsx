import React from 'react';
import { Link2 } from 'lucide-react';
import { Page } from '../../types';

export const PAGE_LINK_PATTERN = /\[\[([^\[\]]+)\]\]/g;

export function getPageLinkTitles(text: string): string[] {
  return Array.from(text.matchAll(PAGE_LINK_PATTERN), (match) => match[1].trim()).filter(Boolean);
}

export function findPageByTitle(pages: Page[], title: string): Page | undefined {
  const normalized = title.trim().toLowerCase();
  return pages.find((page) => !page.deletedAt && !page.isArchived && page.title.trim().toLowerCase() === normalized);
}

interface PageLinkChipsProps {
  text: string;
  pages: Page[];
  currentPageId: string;
  onNavigate: (pageId: string) => void;
}

export const PageLinkChips: React.FC<PageLinkChipsProps> = ({ text, pages, currentPageId, onNavigate }) => {
  const links = getPageLinkTitles(text)
    .map((title) => ({ title, page: findPageByTitle(pages, title) }))
    .filter(({ page }) => page && page.id !== currentPageId) as Array<{ title: string; page: Page }>;

  if (links.length === 0) return null;

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5">
      {links.map(({ title, page }, index) => (
        <button
          key={`${page.id}-${index}`}
          type="button"
          onClick={() => onNavigate(page.id)}
          className="inline-flex max-w-full items-center gap-1 rounded-md border border-[#dadad0] bg-[#ecece4] px-1.5 py-0.5 text-[11px] font-medium text-[#5a5a40] hover:border-[#a4a485] hover:bg-[#e2e2da] dark:border-[#42423b] dark:bg-[#2c2c28] dark:text-[#c2c2a8] dark:hover:border-[#8c8c6d]"
          title={`Open ${page.title}`}
        >
          <Link2 className="h-3 w-3 shrink-0" />
          <span className="truncate">{title}</span>
        </button>
      ))}
    </div>
  );
};
