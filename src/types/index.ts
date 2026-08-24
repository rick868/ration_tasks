export type BlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'todo'
  | 'bullet'
  | 'number'
  | 'toggle'
  | 'callout'
  | 'quote'
  | 'code'
  | 'divider'
  | 'image'
  | 'file'
  | 'database'
  | 'bookmark';

export interface Page {
  id: string;
  workspaceId: string;
  parentId: string | null;
  title: string;
  icon: string | null;
  coverUrl: string | null;
  coverPosition?: number;
  isDatabase: boolean;
  isTemplate: boolean;
  isArchived: boolean;
  isPinned: boolean;
  isLocked?: boolean;
  orderIndex: number;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export interface Block {
  id: string;
  pageId: string;
  parentId: string | null;
  type: BlockType;
  content: {
    text?: string;
    checked?: boolean;
    language?: string;
    caption?: string;
    url?: string;
    icon?: string;
    color?: string;
    bgColor?: string;
    isOpen?: boolean; // for toggle block
    databaseId?: string; // for inline database block
    fileId?: string; // for file attachment
    fileName?: string;
    fileSize?: number;
    fileMime?: string;
  };
  properties: Record<string, unknown>;
  orderIndex: number;
  createdAt: number;
  updatedAt: number;
}

export type PropertyType =
  | 'text'
  | 'number'
  | 'select'
  | 'multi_select'
  | 'status'
  | 'date'
  | 'checkbox'
  | 'priority'
  | 'url'
  | 'email';

export interface SelectOption {
  id: string;
  label: string;
  color: string; // e.g. 'bg-red-100 text-red-800'
}

export interface DatabaseProperty {
  id: string;
  databaseId: string;
  name: string;
  type: PropertyType;
  config: {
    options?: SelectOption[];
    numberFormat?: string;
    dateFormat?: string;
  };
  orderIndex: number;
  createdAt: number;
  updatedAt: number;
}

export interface DatabaseRow {
  id: string;
  databaseId: string;
  pageId?: string; // Linked sub-page ID for row detail
  title: string;
  icon?: string | null;
  values: Record<string, unknown>; // propertyId -> value
  orderIndex: number;
  createdAt: number;
  updatedAt: number;
}

export type DatabaseViewType = 'table' | 'board' | 'gallery' | 'calendar' | 'list';

export interface DatabaseView {
  id: string;
  databaseId: string;
  name: string;
  type: DatabaseViewType;
  filters: Array<{
    propertyId: string;
    operator: 'equals' | 'contains' | 'is_empty' | 'is_not_empty' | 'gt' | 'lt';
    value: unknown;
  }>;
  sorts: Array<{
    propertyId: string;
    direction: 'asc' | 'desc';
  }>;
  groupByPropertyId?: string; // For Kanban
  visiblePropertyIds?: string[];
  orderIndex: number;
  createdAt: number;
  updatedAt: number;
}

export interface Database {
  id: string;
  workspaceId: string;
  pageId: string;
  name: string;
  description: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  icon: string;
  settings: {
    theme?: 'light' | 'dark' | 'system';
    autoBackup?: 'never' | 'daily' | 'weekly' | 'monthly';
    lastBackupTime?: number;
    isEncrypted?: boolean;
    storagePath?: string;
  };
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: string;
  workspaceId: string;
  pageId: string | null;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done' | 'cancelled';
  priority: 'none' | 'low' | 'medium' | 'high' | 'urgent';
  dueDate: number | null;
  assignedTo: string | null;
  orderIndex: number;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
}

export interface FileMetadata {
  id: string;
  workspaceId: string;
  filename: string;
  storedName: string;
  mimeType: string;
  byteSize: number;
  relativePath: string;
  checksumSha256: string;
  blobData?: ArrayBuffer | string; // Base64 or Blob storage in Dexie
  createdAt: number;
  updatedAt: number;
}

export interface PageHistoryRecord {
  id: string;
  pageId: string;
  snapshotJson: string; // Serialized { page, blocks }
  changeSummary: string | null;
  authorName: string;
  createdAt: number;
}

export interface SyncQueueEntry {
  id: string;
  entityType: 'pages' | 'blocks' | 'databases' | 'database_rows' | 'tasks' | 'files';
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payloadJson: string;
  attempts: number;
  status: 'PENDING' | 'PROCESSING' | 'FAILED' | 'RETRY';
  lastError: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface SearchResult {
  pageId: string;
  title: string;
  icon: string | null;
  snippet: string;
  type: 'page' | 'block' | 'database' | 'task';
  score: number;
  updatedAt: number;
}

export interface StorageStats {
  databaseBytes: number;
  attachmentsBytes: number;
  backupsBytes: number;
  cacheBytes: number;
  totalPages: number;
  totalBlocks: number;
  totalDatabases: number;
  totalAttachments: number;
  lastBackupDate: number | null;
}

export type SaveStatus = 'SAVED' | 'SAVING' | 'DIRTY' | 'OFFLINE' | 'ERROR' | 'SYNCING';
