import Dexie, { type Table } from 'dexie';
import {
  Workspace,
  Page,
  Block,
  Database,
  DatabaseProperty,
  DatabaseRow,
  DatabaseView,
  Task,
  FileMetadata,
  PageHistoryRecord,
  SyncQueueEntry,
} from '../types';

export class RationLocalDB extends Dexie {
  workspaces!: Table<Workspace, string>;
  pages!: Table<Page, string>;
  blocks!: Table<Block, string>;
  databases!: Table<Database, string>;
  databaseProperties!: Table<DatabaseProperty, string>;
  databaseRows!: Table<DatabaseRow, string>;
  databaseViews!: Table<DatabaseView, string>;
  tasks!: Table<Task, string>;
  files!: Table<FileMetadata, string>;
  pageHistory!: Table<PageHistoryRecord, string>;
  syncQueue!: Table<SyncQueueEntry, string>;

  constructor() {
    super('RationLocalDatabase_v1');

    this.version(1).stores({
      workspaces: 'id, slug, createdAt, updatedAt',
      pages: 'id, workspaceId, parentId, title, isDatabase, isTemplate, isArchived, isPinned, orderIndex, createdAt, updatedAt, deletedAt',
      blocks: 'id, pageId, parentId, type, orderIndex, createdAt, updatedAt',
      databases: 'id, workspaceId, pageId, name, createdAt, updatedAt',
      databaseProperties: 'id, databaseId, orderIndex, createdAt, updatedAt',
      databaseRows: 'id, databaseId, pageId, orderIndex, createdAt, updatedAt',
      databaseViews: 'id, databaseId, orderIndex, createdAt, updatedAt',
      tasks: 'id, workspaceId, pageId, status, priority, dueDate, assignedTo, orderIndex, createdAt, updatedAt',
      files: 'id, workspaceId, filename, storedName, mimeType, checksumSha256, createdAt',
      pageHistory: 'id, pageId, createdAt',
      syncQueue: 'id, status, entityType, entityId, createdAt',
    });
  }
}

export const db = new RationLocalDB();
