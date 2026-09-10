import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Page, Block, Workspace, SaveStatus } from '../types';
import { pageRepo, blockRepo, workspaceRepo } from '../storage/repositories';
import { db } from '../storage/db';
import { seedInitialData } from '../storage/seed';
import { HistoryManager } from '../storage/historyManager';
import { TEMPLATE_DEFINITIONS, TemplateDefinition } from '../templates/templateDefinitions';

interface WorkspaceContextType {
  workspace: Workspace | null;
  pages: Page[];
  trashPages: Page[];
  activePageId: string | null;
  activePage: Page | null;
  activeBlocks: Block[];
  saveStatus: SaveStatus;
  isOffline: boolean;
  syncQueueCount: number;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  // Modals
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isTemplatesOpen: boolean;
  setIsTemplatesOpen: (open: boolean) => void;
  isTrashOpen: boolean;
  setIsTrashOpen: (open: boolean) => void;
  isHistoryOpen: boolean;
  setIsHistoryOpen: (open: boolean) => void;
  isExportOpen: boolean;
  setIsExportOpen: (open: boolean) => void;
  isInstallOpen: boolean;
  setIsInstallOpen: (open: boolean) => void;
  // Actions
  selectPage: (id: string) => void;
  createPage: (parentId?: string | null, isDatabase?: boolean, title?: string) => Promise<Page>;
  updatePage: (id: string, updates: Partial<Page>) => Promise<Page>;
  deletePage: (id: string, softDelete?: boolean) => Promise<void>;
  restorePage: (id: string) => Promise<void>;
  duplicatePage: (id: string) => Promise<Page>;
  togglePinPage: (id: string) => Promise<void>;
  updateBlocks: (pageId: string, blocks: Block[], saveSnapshot?: boolean) => Promise<void>;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  toggleOfflineSimulation: () => void;
  refreshPages: () => Promise<void>;
  refreshTrash: () => Promise<void>;
  emptyTrash: () => Promise<void>;
  instantiateTemplate: (templateType: string) => Promise<Page>;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [trashPages, setTrashPages] = useState<Page[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [activeBlocks, setActiveBlocks] = useState<Block[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('SAVED');
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);
  const [syncQueueCount, setSyncQueueCount] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');

  // Modal visibility states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      if (!simulatedOffline) setIsOffline(false);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [simulatedOffline]);

  // Monitor sync queue count
  const refreshSyncQueue = useCallback(async () => {
    try {
      const count = await db.syncQueue.where('status').equals('PENDING').count();
      setSyncQueueCount(count);
    } catch {
      // ignore
    }
  }, []);

  // Theme synchronization with document element & body
  const applyThemeClasses = useCallback((newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    const body = document.body;

    if (newTheme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, []);

  const setTheme = useCallback(
    (newTheme: 'light' | 'dark') => {
      setThemeState(newTheme);
      try {
        localStorage.setItem('ration_theme', newTheme);
      } catch {
        // ignore
      }
      applyThemeClasses(newTheme);
    },
    [applyThemeClasses]
  );

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, [setTheme]);

  useEffect(() => {
    let savedTheme: 'light' | 'dark' = 'light';
    try {
      const stored = localStorage.getItem('ration_theme');
      if (stored === 'dark' || stored === 'light') {
        savedTheme = stored;
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        savedTheme = 'dark';
      }
    } catch {
      // ignore
    }
    setThemeState(savedTheme);
    applyThemeClasses(savedTheme);
  }, [applyThemeClasses]);

  const refreshPages = useCallback(async () => {
    if (!workspace) return;
    const list = await pageRepo.listByWorkspace(workspace.id);
    setPages(list);
  }, [workspace]);

  const refreshTrash = useCallback(async () => {
    if (!workspace) return;
    const trash = await pageRepo.listTrash(workspace.id);
    setTrashPages(trash);
  }, [workspace]);

  // Initial Boot & Seeding
  useEffect(() => {
    const initApp = async () => {
      try {
        // Ask Chromium to keep this device's local workspace data durable.
        if (navigator.storage?.persist) {
          await navigator.storage.persist();
        }
        await seedInitialData();
        const workspaces = await workspaceRepo.getAll();
        const ws = workspaces.length > 0 ? workspaces[0] : null;
        if (ws) {
          setWorkspace(ws);
          const pageList = await pageRepo.listByWorkspace(ws.id);
          setPages(pageList);

          // Restore last active page or select first
          const savedActive = localStorage.getItem(`ration_active_${ws.id}`);
          if (savedActive && pageList.some((p) => p.id === savedActive)) {
            setActivePageId(savedActive);
          } else if (pageList.length > 0) {
            setActivePageId(pageList[0].id);
          }
        }
        await refreshSyncQueue();
      } catch (err) {
        console.error('Failed to initialize local-first workspace:', err);
      }
    };
    initApp();
  }, [refreshSyncQueue]);

  // Load blocks when active page changes
  useEffect(() => {
    const loadBlocks = async () => {
      if (!activePageId) {
        setActiveBlocks([]);
        return;
      }
      try {
        const blocks = await blockRepo.getByPageId(activePageId);
        setActiveBlocks(blocks);
      } catch (err) {
        console.error('Failed to load blocks:', err);
      }
    };
    loadBlocks();
  }, [activePageId]);

  // Active page object lookup
  const activePage = pages.find((p) => p.id === activePageId) || null;

  // Page Actions
  const selectPage = useCallback(
    (id: string) => {
      setActivePageId(id);
      if (workspace) {
        try {
          localStorage.setItem(`ration_active_${workspace.id}`, id);
        } catch {
          // ignore
        }
      }
    },
    [workspace]
  );

  const createPage = useCallback(
    async (parentId: string | null = null, isDatabase = false, title = 'Untitled') => {
      if (!workspace) throw new Error('No workspace active');

      const pageId = `page_${crypto.randomUUID().slice(0, 8)}`;

      const newPage = await pageRepo.create({
        id: pageId,
        workspaceId: workspace.id,
        parentId,
        title,
        icon: isDatabase ? '📊' : '📄',
        coverUrl: null,
        isDatabase,
        isTemplate: false,
        isArchived: false,
        isPinned: false,
        orderIndex: pages.length + 1,
        deletedAt: null,
      });

      // Default initial block
      const initialBlocks: Block[] = [
        {
          id: `b_${crypto.randomUUID().slice(0, 8)}`,
          pageId,
          parentId: null,
          type: 'paragraph',
          content: { text: '' },
          properties: {},
          orderIndex: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      await blockRepo.saveBatch(pageId, initialBlocks);
      await refreshPages();
      setActivePageId(pageId);
      refreshSyncQueue();
      return newPage;
    },
    [workspace, pages.length, refreshPages, refreshSyncQueue]
  );

  const updatePage = useCallback(
    async (id: string, updates: Partial<Page>) => {
      setSaveStatus('SAVING');
      const updated = await pageRepo.update(id, updates);
      await refreshPages();
      setSaveStatus('SAVED');
      refreshSyncQueue();
      return updated;
    },
    [refreshPages, refreshSyncQueue]
  );

  const deletePage = useCallback(
    async (id: string, softDelete = true) => {
      // 1. Immediately purge memory state for instant reactivity
      setTrashPages((prev) => prev.filter((p) => p.id !== id));
      setPages((prev) => prev.filter((p) => p.id !== id));

      // 2. If the active page is being deleted, reset active state in memory and storage
      if (activePageId === id) {
        const remaining = pages.filter((p) => p.id !== id);
        if (remaining.length > 0) {
          setActivePageId(remaining[0].id);
          if (workspace) {
            try {
              localStorage.setItem(`ration_active_${workspace.id}`, remaining[0].id);
            } catch {
              // ignore
            }
          }
        } else {
          setActivePageId(null);
          setActiveBlocks([]);
          if (workspace) {
            try {
              localStorage.removeItem(`ration_active_${workspace.id}`);
            } catch {
              // ignore
            }
          }
        }
      }

      // 3. Complete deletion in persistent storage (IndexedDB)
      await pageRepo.delete(id, softDelete);

      // 4. Re-sync memory states with database
      await refreshPages();
      await refreshTrash();
      refreshSyncQueue();
    },
    [activePageId, pages, workspace, refreshPages, refreshTrash, refreshSyncQueue]
  );

  const emptyTrash = useCallback(async () => {
    if (!workspace) return;
    // 1. Clear memory state immediately
    setTrashPages([]);
    
    // 2. Perform complete deletion of all trash items in storage
    await pageRepo.emptyTrash(workspace.id);

    // 3. Re-sync memory states
    await refreshTrash();
    await refreshPages();
    refreshSyncQueue();
  }, [workspace, refreshTrash, refreshPages, refreshSyncQueue]);

  const restorePage = useCallback(
    async (id: string) => {
      await pageRepo.restore(id);
      await refreshPages();
      await refreshTrash();
      setActivePageId(id);
      refreshSyncQueue();
    },
    [refreshPages, refreshTrash, refreshSyncQueue]
  );

  const duplicatePage = useCallback(
    async (id: string) => {
      if (!workspace) throw new Error('No workspace');
      const source = await pageRepo.getById(id);
      if (!source) throw new Error('Page not found');

      const sourceBlocks = await blockRepo.getByPageId(id);
      const newPageId = `page_${crypto.randomUUID().slice(0, 8)}`;
      const now = Date.now();

      const duplicated = await pageRepo.create({
        id: newPageId,
        workspaceId: source.workspaceId,
        parentId: source.parentId,
        title: `${source.title || 'Untitled'} (Copy)`,
        icon: source.icon,
        coverUrl: source.coverUrl,
        coverPosition: source.coverPosition,
        isDatabase: source.isDatabase,
        isTemplate: source.isTemplate,
        isArchived: false,
        isPinned: false,
        isLocked: source.isLocked,
        orderIndex: source.orderIndex + 1,
        deletedAt: null,
      });

      const duplicatedBlocks: Block[] = sourceBlocks.map((b, idx) => ({
        ...b,
        id: `b_${crypto.randomUUID().slice(0, 8)}_${idx}`,
        pageId: newPageId,
        createdAt: now,
        updatedAt: now,
      }));

      await blockRepo.saveBatch(newPageId, duplicatedBlocks);
      await refreshPages();
      setActivePageId(newPageId);
      refreshSyncQueue();
      return duplicated;
    },
    [workspace, refreshPages, refreshSyncQueue]
  );

  const togglePinPage = useCallback(
    async (id: string) => {
      const page = await pageRepo.getById(id);
      if (!page) return;
      await pageRepo.update(id, { isPinned: !page.isPinned });
      await refreshPages();
    },
    [refreshPages]
  );

  const updateBlocks = useCallback(
    async (pageId: string, blocks: Block[], saveSnapshot = false) => {
      setSaveStatus('SAVING');
      setActiveBlocks(blocks);
      await blockRepo.saveBatch(pageId, blocks);

      // Snapshot for version history if requested
      if (saveSnapshot) {
        const page = await pageRepo.getById(pageId);
        if (page) {
          await HistoryManager.createSnapshot(page, blocks, 'Auto-saved snapshot');
        }
      }

      setSaveStatus('SAVED');
      refreshSyncQueue();
    },
    [refreshSyncQueue]
  );

  const toggleOfflineSimulation = useCallback(() => {
    setSimulatedOffline((prev) => {
      const next = !prev;
      setIsOffline(next ? true : !navigator.onLine);
      return next;
    });
  }, []);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        createPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createPage]);

  // Instantiate template helper supporting all 12 templates
  const instantiateTemplate = useCallback(
    async (templateType: string): Promise<Page> => {
      if (!workspace) throw new Error('No workspace');
      const pageId = `page_tmpl_${crypto.randomUUID().slice(0, 6)}`;

      // Match legacy or new IDs
      let tmpl: TemplateDefinition | undefined;
      if (templateType === 'project_tracker') {
        tmpl = TEMPLATE_DEFINITIONS.find((t) => t.id === 'project_blueprint');
      } else if (templateType === 'meeting_notes') {
        tmpl = TEMPLATE_DEFINITIONS.find((t) => t.id === 'meeting_decisions');
      } else if (templateType === 'habits_tracker') {
        tmpl = TEMPLATE_DEFINITIONS.find((t) => t.id === 'daily_habits');
      } else {
        tmpl = TEMPLATE_DEFINITIONS.find((t) => t.id === templateType);
      }

      if (!tmpl) {
        tmpl = TEMPLATE_DEFINITIONS[0];
      }

      const title = tmpl.title;
      const icon = tmpl.icon;
      const coverUrl = tmpl.coverUrl;
      const blocks = tmpl.generateBlocks(pageId);

      const newPage = await pageRepo.create({
        id: pageId,
        workspaceId: workspace.id,
        parentId: null,
        title,
        icon,
        coverUrl,
        isDatabase: false,
        isTemplate: false,
        isArchived: false,
        isPinned: false,
        orderIndex: pages.length + 1,
        deletedAt: null,
      });

      await blockRepo.saveBatch(pageId, blocks);
      await refreshPages();
      setActivePageId(pageId);
      refreshSyncQueue();
      return newPage;
    },
    [workspace, pages.length, refreshPages, refreshSyncQueue]
  );

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        pages,
        trashPages,
        activePageId,
        activePage,
        activeBlocks,
        saveStatus,
        isOffline,
        syncQueueCount,
        theme,
        sidebarOpen,
        setSidebarOpen,
        isSearchOpen,
        setIsSearchOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        isTemplatesOpen,
        setIsTemplatesOpen,
        isTrashOpen,
        setIsTrashOpen,
        isHistoryOpen,
        setIsHistoryOpen,
        isExportOpen,
        setIsExportOpen,
        isInstallOpen,
        setIsInstallOpen,
        selectPage,
        createPage,
        updatePage,
        deletePage,
        restorePage,
        duplicatePage,
        togglePinPage,
        updateBlocks,
        setTheme,
        toggleTheme,
        toggleOfflineSimulation,
        refreshPages,
        refreshTrash,
        emptyTrash,
        instantiateTemplate,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
