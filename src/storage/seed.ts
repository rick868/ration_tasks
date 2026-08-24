import { db } from './db';
import { Page, Block, Database, DatabaseProperty, DatabaseRow, DatabaseView, Workspace } from '../types';

export async function seedInitialData(): Promise<void> {
  const existingCount = await db.pages.count();
  if (existingCount > 0) return;

  const now = Date.now();
  const workspaceId = 'ws_primary_default';

  // 1. Primary Workspace
  const workspace: Workspace = {
    id: workspaceId,
    name: 'Ration Workspace',
    slug: 'ration-workspace',
    icon: '⚡',
    settings: {
      theme: 'light',
      autoBackup: 'weekly',
      lastBackupTime: now,
      isEncrypted: false,
      storagePath: '~/.local/share/Ration/ration.db',
    },
    createdAt: now,
    updatedAt: now,
  };
  await db.workspaces.add(workspace);

  // 2. Page: 🚀 Welcome to Ration (Getting Started)
  const welcomePageId = 'page_welcome_guide';
  const welcomePage: Page = {
    id: welcomePageId,
    workspaceId,
    parentId: null,
    title: 'Welcome to Ration',
    icon: '🚀',
    coverUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80',
    coverPosition: 50,
    isDatabase: false,
    isTemplate: false,
    isArchived: false,
    isPinned: true,
    orderIndex: 1,
    createdAt: now - 86400000 * 3,
    updatedAt: now,
    deletedAt: null,
  };

  const welcomeBlocks: Block[] = [
    {
      id: 'b_w_1',
      pageId: welcomePageId,
      parentId: null,
      type: 'callout',
      content: {
        text: 'Ration is your private, local-first productivity workspace. All your documents, databases, notes, and attachments live directly on your device with instant offline access and automatic SQLite/IndexedDB persistence.',
        icon: '🛡️',
        bgColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      },
      properties: {},
      orderIndex: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'b_w_2',
      pageId: welcomePageId,
      parentId: null,
      type: 'heading1',
      content: { text: 'Key Features & Capabilities' },
      properties: {},
      orderIndex: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'b_w_3',
      pageId: welcomePageId,
      parentId: null,
      type: 'todo',
      content: { text: 'Type / anywhere in the editor to open the Slash Command Menu', checked: true },
      properties: {},
      orderIndex: 3,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'b_w_4',
      pageId: welcomePageId,
      parentId: null,
      type: 'todo',
      content: { text: 'Press Ctrl+K (or ⌘K) to open the Quick Search & Command Palette', checked: true },
      properties: {},
      orderIndex: 4,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'b_w_5',
      pageId: welcomePageId,
      parentId: null,
      type: 'todo',
      content: { text: 'Switch between Table, Kanban Board, Gallery, and Calendar views in Databases', checked: true },
      properties: {},
      orderIndex: 5,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'b_w_6',
      pageId: welcomePageId,
      parentId: null,
      type: 'todo',
      content: { text: 'Export your workspace to Markdown, HTML, JSON, or .rationbackup archive', checked: false },
      properties: {},
      orderIndex: 6,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'b_w_7',
      pageId: welcomePageId,
      parentId: null,
      type: 'heading2',
      content: { text: 'Local-First Architecture' },
      properties: {},
      orderIndex: 7,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'b_w_8',
      pageId: welcomePageId,
      parentId: null,
      type: 'paragraph',
      content: {
        text: 'Unlike cloud-tethered apps, Ration stores every page, block, and database table in your local browser IndexedDB / desktop SQLite database (~/.local/share/Ration/). Even if your connection drops, everything continues working seamlessly.',
      },
      properties: {},
      orderIndex: 8,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'b_w_9',
      pageId: welcomePageId,
      parentId: null,
      type: 'code',
      content: {
        text: `// Ration Unified Storage Engine\nPRAGMA foreign_keys = ON;\nPRAGMA journal_mode = WAL;\n\n// Source of truth is always local on your machine\nconst db = new RationLocalDB();\nawait db.pages.add(newPage);`,
        language: 'typescript',
      },
      properties: {},
      orderIndex: 9,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'b_w_10',
      pageId: welcomePageId,
      parentId: null,
      type: 'toggle',
      content: {
        text: '📖 Click to see editor keyboard shortcuts & markdown tips',
        isOpen: false,
      },
      properties: {},
      orderIndex: 10,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'b_w_11',
      pageId: welcomePageId,
      parentId: null,
      type: 'quote',
      content: {
        text: '"Your data belongs to you and lives on your device first. Cloud services should enhance Ration, not control whether your data is accessible."',
      },
      properties: {},
      orderIndex: 11,
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.pages.add(welcomePage);
  await db.blocks.bulkAdd(welcomeBlocks);

  // 3. Database Page: 📋 Product Roadmap & Sprint Board
  const dbPageId = 'page_sprint_board';
  const databaseId = 'db_sprint_items';

  const dbPage: Page = {
    id: dbPageId,
    workspaceId,
    parentId: null,
    title: 'Product Roadmap & Sprint Board',
    icon: '📋',
    coverUrl: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=1600&q=80',
    coverPosition: 40,
    isDatabase: true,
    isTemplate: false,
    isArchived: false,
    isPinned: true,
    orderIndex: 2,
    createdAt: now - 86400000 * 2,
    updatedAt: now,
    deletedAt: null,
  };
  await db.pages.add(dbPage);

  const databaseObj: Database = {
    id: databaseId,
    workspaceId,
    pageId: dbPageId,
    name: 'Roadmap Tasks',
    description: 'Sprint planning and feature delivery roadmap',
    createdAt: now,
    updatedAt: now,
  };
  await db.databases.add(databaseObj);

  // Properties
  const propStatusId = 'prop_status';
  const propPriorityId = 'prop_priority';
  const propCategoryId = 'prop_category';
  const propDueDateId = 'prop_due_date';
  const propAssigneeId = 'prop_assignee';
  const propEstimateId = 'prop_estimate';

  const properties: DatabaseProperty[] = [
    {
      id: propStatusId,
      databaseId,
      name: 'Status',
      type: 'status',
      config: {
        options: [
          { id: 'opt_backlog', label: 'Backlog', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
          { id: 'opt_in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200' },
          { id: 'opt_review', label: 'In Review', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200' },
          { id: 'opt_done', label: 'Done', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200' },
        ],
      },
      orderIndex: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: propPriorityId,
      databaseId,
      name: 'Priority',
      type: 'priority',
      config: {
        options: [
          { id: 'opt_low', label: 'Low', color: 'bg-slate-100 text-slate-600' },
          { id: 'opt_med', label: 'Medium', color: 'bg-indigo-100 text-indigo-700' },
          { id: 'opt_high', label: 'High', color: 'bg-amber-100 text-amber-700' },
          { id: 'opt_urgent', label: 'Urgent', color: 'bg-rose-100 text-rose-700' },
        ],
      },
      orderIndex: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: propCategoryId,
      databaseId,
      name: 'Tag',
      type: 'select',
      config: {
        options: [
          { id: 'opt_storage', label: 'Storage Engine', color: 'bg-purple-100 text-purple-800' },
          { id: 'opt_ui', label: 'UI & Editor', color: 'bg-sky-100 text-sky-800' },
          { id: 'opt_perf', label: 'Performance', color: 'bg-emerald-100 text-emerald-800' },
          { id: 'opt_security', label: 'Security', color: 'bg-rose-100 text-rose-800' },
        ],
      },
      orderIndex: 3,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: propDueDateId,
      databaseId,
      name: 'Target Date',
      type: 'date',
      config: {},
      orderIndex: 4,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: propAssigneeId,
      databaseId,
      name: 'Owner',
      type: 'text',
      config: {},
      orderIndex: 5,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: propEstimateId,
      databaseId,
      name: 'Story Points',
      type: 'number',
      config: {},
      orderIndex: 6,
      createdAt: now,
      updatedAt: now,
    },
  ];
  await db.databaseProperties.bulkAdd(properties);

  // Rows
  const sampleRows: DatabaseRow[] = [
    {
      id: 'row_1',
      databaseId,
      title: 'Implement Local SQLite WAL & Dexie Persistence',
      values: {
        [propStatusId]: 'Done',
        [propPriorityId]: 'Urgent',
        [propCategoryId]: 'Storage Engine',
        [propDueDateId]: new Date(now + 86400000 * 2).toISOString().split('T')[0],
        [propAssigneeId]: 'Alex Rivera',
        [propEstimateId]: 8,
      },
      orderIndex: 1,
      createdAt: now - 86400000 * 4,
      updatedAt: now,
    },
    {
      id: 'row_2',
      databaseId,
      title: 'Build Notion-Style Block Editor & Slash Menu',
      values: {
        [propStatusId]: 'In Progress',
        [propPriorityId]: 'High',
        [propCategoryId]: 'UI & Editor',
        [propDueDateId]: new Date(now + 86400000 * 4).toISOString().split('T')[0],
        [propAssigneeId]: 'Sarah Chen',
        [propEstimateId]: 13,
      },
      orderIndex: 2,
      createdAt: now - 86400000 * 3,
      updatedAt: now,
    },
    {
      id: 'row_3',
      databaseId,
      title: 'Full-Text Search Index & Cmd+K Palette',
      values: {
        [propStatusId]: 'In Progress',
        [propPriorityId]: 'Medium',
        [propCategoryId]: 'Performance',
        [propDueDateId]: new Date(now + 86400000 * 6).toISOString().split('T')[0],
        [propAssigneeId]: 'David Kim',
        [propEstimateId]: 5,
      },
      orderIndex: 3,
      createdAt: now - 86400000 * 2,
      updatedAt: now,
    },
    {
      id: 'row_4',
      databaseId,
      title: 'Automatic Backups (.rationbackup) & JSON/MD Exporter',
      values: {
        [propStatusId]: 'In Review',
        [propPriorityId]: 'High',
        [propCategoryId]: 'Storage Engine',
        [propDueDateId]: new Date(now + 86400000 * 5).toISOString().split('T')[0],
        [propAssigneeId]: 'Alex Rivera',
        [propEstimateId]: 5,
      },
      orderIndex: 4,
      createdAt: now - 86400000,
      updatedAt: now,
    },
    {
      id: 'row_5',
      databaseId,
      title: 'Local File Attachments with SHA256 Verification',
      values: {
        [propStatusId]: 'Done',
        [propPriorityId]: 'Medium',
        [propCategoryId]: 'Security',
        [propDueDateId]: new Date(now + 86400000 * 1).toISOString().split('T')[0],
        [propAssigneeId]: 'Elena Rostova',
        [propEstimateId]: 3,
      },
      orderIndex: 5,
      createdAt: now - 86400000 * 5,
      updatedAt: now,
    },
    {
      id: 'row_6',
      databaseId,
      title: 'Desktop Linux (.deb) & Tauri Integration',
      values: {
        [propStatusId]: 'Backlog',
        [propPriorityId]: 'Low',
        [propCategoryId]: 'Storage Engine',
        [propDueDateId]: new Date(now + 86400000 * 14).toISOString().split('T')[0],
        [propAssigneeId]: 'Core Team',
        [propEstimateId]: 8,
      },
      orderIndex: 6,
      createdAt: now,
      updatedAt: now,
    },
  ];
  await db.databaseRows.bulkAdd(sampleRows);

  // Views (Table, Board / Kanban, Gallery, Calendar)
  const views: DatabaseView[] = [
    {
      id: 'view_board_1',
      databaseId,
      name: 'Kanban Board',
      type: 'board',
      filters: [],
      sorts: [],
      groupByPropertyId: propStatusId,
      orderIndex: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'view_table_1',
      databaseId,
      name: 'All Tasks Table',
      type: 'table',
      filters: [],
      sorts: [{ propertyId: propDueDateId, direction: 'asc' }],
      orderIndex: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'view_gallery_1',
      databaseId,
      name: 'Gallery Cards',
      type: 'gallery',
      filters: [],
      sorts: [],
      orderIndex: 3,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'view_cal_1',
      databaseId,
      name: 'Calendar View',
      type: 'calendar',
      filters: [],
      sorts: [],
      orderIndex: 4,
      createdAt: now,
      updatedAt: now,
    },
  ];
  await db.databaseViews.bulkAdd(views);

  // 4. Additional Workspace Pages: Engineering Wiki, Daily Notes, Reading List
  const wikiPageId = 'page_engineering_wiki';
  const wikiPage: Page = {
    id: wikiPageId,
    workspaceId,
    parentId: null,
    title: 'Engineering & System Architecture',
    icon: '🏗️',
    coverUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80',
    coverPosition: 50,
    isDatabase: false,
    isTemplate: false,
    isArchived: false,
    isPinned: false,
    orderIndex: 3,
    createdAt: now - 86400000 * 2,
    updatedAt: now,
    deletedAt: null,
  };
  await db.pages.add(wikiPage);

  const wikiBlocks: Block[] = [
    {
      id: 'b_wk_1',
      pageId: wikiPageId,
      parentId: null,
      type: 'heading1',
      content: { text: 'Ration System Architecture' },
      properties: {},
      orderIndex: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'b_wk_2',
      pageId: wikiPageId,
      parentId: null,
      type: 'paragraph',
      content: {
        text: 'Ration is engineered around three non-negotiable principles: zero vendor lock-in, zero required network calls for basic work, and sub-10ms query execution.',
      },
      properties: {},
      orderIndex: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'b_wk_3',
      pageId: wikiPageId,
      parentId: null,
      type: 'callout',
      content: {
        text: 'Desktop directory: ~/.local/share/Ration/ration.db | Web: IndexedDB (Dexie engine). Atomic transactions and sync journaling ensure crash immunity.',
        icon: '📁',
        bgColor: 'bg-blue-50 text-blue-900 border-blue-200',
      },
      properties: {},
      orderIndex: 3,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'b_wk_4',
      pageId: wikiPageId,
      parentId: null,
      type: 'heading2',
      content: { text: 'Storage Subsystems' },
      properties: {},
      orderIndex: 4,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'b_wk_5',
      pageId: wikiPageId,
      parentId: null,
      type: 'bullet',
      content: { text: 'SQLite with WAL mode on desktop (Tauri Debian build)' },
      properties: {},
      orderIndex: 5,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'b_wk_6',
      pageId: wikiPageId,
      parentId: null,
      type: 'bullet',
      content: { text: 'Dexie-backed IndexedDB for Web/PWA with binary blob attachments' },
      properties: {},
      orderIndex: 6,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'b_wk_7',
      pageId: wikiPageId,
      parentId: null,
      type: 'bullet',
      content: { text: 'Local sync queue with mutation journaling and LWW / CRDT conflict models' },
      properties: {},
      orderIndex: 7,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'b_wk_8',
      pageId: wikiPageId,
      parentId: null,
      type: 'divider',
      content: {},
      properties: {},
      orderIndex: 8,
      createdAt: now,
      updatedAt: now,
    },
  ];
  await db.blocks.bulkAdd(wikiBlocks);

  // 5. Daily Notes page
  const dailyPageId = 'page_daily_notes';
  const dailyPage: Page = {
    id: dailyPageId,
    workspaceId,
    parentId: null,
    title: 'Daily Notes & Quick Capture',
    icon: '📝',
    coverUrl: null,
    isDatabase: false,
    isTemplate: false,
    isArchived: false,
    isPinned: false,
    orderIndex: 4,
    createdAt: now - 86400000,
    updatedAt: now,
    deletedAt: null,
  };
  await db.pages.add(dailyPage);

  const dailyBlocks: Block[] = [
    {
      id: 'b_dn_1',
      pageId: dailyPageId,
      parentId: null,
      type: 'heading1',
      content: { text: 'Today\'s Focus & Log' },
      properties: {},
      orderIndex: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'b_dn_2',
      pageId: dailyPageId,
      parentId: null,
      type: 'todo',
      content: { text: 'Review database view filters and sort settings', checked: true },
      properties: {},
      orderIndex: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'b_dn_3',
      pageId: dailyPageId,
      parentId: null,
      type: 'todo',
      content: { text: 'Test offline mode with simulated network disconnection', checked: true },
      properties: {},
      orderIndex: 3,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'b_dn_4',
      pageId: dailyPageId,
      parentId: null,
      type: 'todo',
      content: { text: 'Create complete workspace backup (.rationbackup)', checked: false },
      properties: {},
      orderIndex: 4,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'b_dn_5',
      pageId: dailyPageId,
      parentId: null,
      type: 'heading2',
      content: { text: 'Quick Thoughts & Snippets' },
      properties: {},
      orderIndex: 5,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'b_dn_6',
      pageId: dailyPageId,
      parentId: null,
      type: 'paragraph',
      content: { text: 'Remember that local-first speed is unmatched — zero network lag on every keystroke.' },
      properties: {},
      orderIndex: 6,
      createdAt: now,
      updatedAt: now,
    },
  ];
  await db.blocks.bulkAdd(dailyBlocks);
}
