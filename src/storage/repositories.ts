import { db } from './db';
import {
  Page,
  Block,
  Database,
  DatabaseProperty,
  DatabaseRow,
  DatabaseView,
  Task,
  SearchResult,
  Workspace,
} from '../types';
import { FileStorageManager } from './fileManager';

export class PageRepository {
  async getById(id: string): Promise<Page | null> {
    const page = await db.pages.get(id);
    return page || null;
  }

  async listByWorkspace(workspaceId: string, includeArchived = false): Promise<Page[]> {
    let collection = db.pages.where('workspaceId').equals(workspaceId);
    if (!includeArchived) {
      collection = collection.filter((p) => !p.isArchived && p.deletedAt === null);
    }
    const pages = await collection.toArray();
    return pages.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async listTrash(workspaceId: string): Promise<Page[]> {
    const pages = await db.pages
      .where('workspaceId')
      .equals(workspaceId)
      .filter((p) => p.isArchived || p.deletedAt !== null)
      .toArray();
    return pages.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async create(pageData: Omit<Page, 'createdAt' | 'updatedAt'>): Promise<Page> {
    const now = Date.now();
    const page: Page = {
      ...pageData,
      createdAt: now,
      updatedAt: now,
    };

    await db.transaction('rw', [db.pages, db.syncQueue], async () => {
      await db.pages.add(page);
      await db.syncQueue.add({
        id: crypto.randomUUID(),
        entityType: 'pages',
        entityId: page.id,
        operation: 'CREATE',
        payloadJson: JSON.stringify(page),
        attempts: 0,
        status: 'PENDING',
        lastError: null,
        createdAt: now,
        updatedAt: now,
      });
    });

    return page;
  }

  async update(id: string, updates: Partial<Omit<Page, 'id' | 'workspaceId' | 'createdAt'>>): Promise<Page> {
    const now = Date.now();
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Page with ID ${id} not found.`);
    }

    const updatedPage: Page = {
      ...existing,
      ...updates,
      updatedAt: now,
    };

    await db.transaction('rw', [db.pages, db.syncQueue], async () => {
      await db.pages.put(updatedPage);
      await db.syncQueue.add({
        id: crypto.randomUUID(),
        entityType: 'pages',
        entityId: id,
        operation: 'UPDATE',
        payloadJson: JSON.stringify(updates),
        attempts: 0,
        status: 'PENDING',
        lastError: null,
        createdAt: now,
        updatedAt: now,
      });
    });

    return updatedPage;
  }

  async delete(id: string, softDelete = true): Promise<void> {
    const now = Date.now();
    if (softDelete) {
      await db.transaction('rw', [db.pages, db.syncQueue], async () => {
        await db.pages.update(id, { deletedAt: now, isArchived: true, updatedAt: now });
        await db.syncQueue.add({
          id: crypto.randomUUID(),
          entityType: 'pages',
          entityId: id,
          operation: 'UPDATE',
          payloadJson: JSON.stringify({ deletedAt: now, isArchived: true }),
          attempts: 0,
          status: 'PENDING',
          lastError: null,
          createdAt: now,
          updatedAt: now,
        });
      });
    } else {
      // Find all nested subpages recursively to ensure 100% complete removal
      const allSubpageIds: string[] = [id];
      const findChildren = async (parentId: string) => {
        const children = await db.pages.where('parentId').equals(parentId).toArray();
        for (const child of children) {
          if (!allSubpageIds.includes(child.id)) {
            allSubpageIds.push(child.id);
            await findChildren(child.id);
          }
        }
      };
      await findChildren(id);

      // First trigger filesystem-level attachments and binary blob cleanup
      await FileStorageManager.purgePageAttachments(allSubpageIds);

      await db.transaction(
        'rw',
        [
          db.pages,
          db.blocks,
          db.databases,
          db.databaseProperties,
          db.databaseRows,
          db.databaseViews,
          db.tasks,
          db.files,
          db.pageHistory,
          db.syncQueue,
        ],
        async () => {
          for (const pageId of allSubpageIds) {
            // Find and delete linked databases and their metadata
            const dbs = await db.databases.where('pageId').equals(pageId).toArray();
            for (const d of dbs) {
              await db.databaseProperties.where('databaseId').equals(d.id).delete();
              await db.databaseRows.where('databaseId').equals(d.id).delete();
              await db.databaseViews.where('databaseId').equals(d.id).delete();
            }
            await db.databases.where('pageId').equals(pageId).delete();
            await db.databaseRows.where('pageId').equals(pageId).delete();
            await db.blocks.where('pageId').equals(pageId).delete();
            await db.pageHistory.where('pageId').equals(pageId).delete();
            await db.tasks.where('pageId').equals(pageId).delete();
            await db.pages.delete(pageId);

            await db.syncQueue.add({
              id: crypto.randomUUID(),
              entityType: 'pages',
              entityId: pageId,
              operation: 'DELETE',
              payloadJson: JSON.stringify({ id: pageId }),
              attempts: 0,
              status: 'PENDING',
              lastError: null,
              createdAt: now,
              updatedAt: now,
            });
          }
        }
      );
    }
  }

  async emptyTrash(workspaceId: string): Promise<void> {
    const trash = await this.listTrash(workspaceId);
    for (const page of trash) {
      await this.delete(page.id, false);
    }
  }

  async restore(id: string): Promise<void> {
    const now = Date.now();
    await db.pages.update(id, { deletedAt: null, isArchived: false, updatedAt: now });
  }

  async search(query: string, workspaceId: string): Promise<SearchResult[]> {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return [];

    const results: SearchResult[] = [];

    // Search active pages
    const pages = await db.pages
      .where('workspaceId')
      .equals(workspaceId)
      .filter((p) => !p.deletedAt && !p.isArchived)
      .toArray();

    for (const page of pages) {
      if (page.title.toLowerCase().includes(normalized)) {
        results.push({
          pageId: page.id,
          title: page.title || 'Untitled',
          icon: page.icon,
          snippet: `Matched page title: "${page.title}"`,
          type: 'page',
          score: 10,
          updatedAt: page.updatedAt,
        });
      }
    }

    // Search blocks
    const blocks = await db.blocks.toArray();
    for (const block of blocks) {
      const text = block.content.text || '';
      if (text.toLowerCase().includes(normalized)) {
        const page = pages.find((p) => p.id === block.pageId);
        if (page) {
          const matchIdx = text.toLowerCase().indexOf(normalized);
          const snippetStart = Math.max(0, matchIdx - 25);
          const snippetEnd = Math.min(text.length, matchIdx + normalized.length + 35);
          const snippet = (snippetStart > 0 ? '...' : '') + text.slice(snippetStart, snippetEnd) + (snippetEnd < text.length ? '...' : '');

          results.push({
            pageId: page.id,
            title: page.title || 'Untitled',
            icon: page.icon,
            snippet: snippet || `Matched in ${block.type} block`,
            type: 'block',
            score: 5,
            updatedAt: block.updatedAt,
          });
        }
      }
    }

    return results.sort((a, b) => b.score - a.score || b.updatedAt - a.updatedAt);
  }
}

export class BlockRepository {
  async getByPageId(pageId: string): Promise<Block[]> {
    const blocks = await db.blocks.where('pageId').equals(pageId).toArray();
    return blocks.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async saveBatch(pageId: string, blocks: Block[]): Promise<void> {
    const now = Date.now();
    await db.transaction('rw', [db.blocks, db.pages, db.syncQueue], async () => {
      // Clear existing for this page to keep consistent ordering and avoid ghost blocks
      await db.blocks.where('pageId').equals(pageId).delete();
      if (blocks.length > 0) {
        await db.blocks.bulkAdd(blocks);
      }
      await db.pages.update(pageId, { updatedAt: now });

      await db.syncQueue.add({
        id: crypto.randomUUID(),
        entityType: 'blocks',
        entityId: pageId,
        operation: 'UPDATE',
        payloadJson: JSON.stringify({ count: blocks.length }),
        attempts: 0,
        status: 'PENDING',
        lastError: null,
        createdAt: now,
        updatedAt: now,
      });
    });
  }

  async addBlock(block: Block): Promise<void> {
    await db.blocks.put(block);
  }

  async deleteBlock(id: string): Promise<void> {
    await db.blocks.delete(id);
  }
}

export class DatabaseRepository {
  async getByPageId(pageId: string): Promise<Database | null> {
    const database = await db.databases.where('pageId').equals(pageId).first();
    return database || null;
  }

  async getById(id: string): Promise<Database | null> {
    const database = await db.databases.get(id);
    return database || null;
  }

  async create(database: Database): Promise<Database> {
    await db.databases.add(database);
    return database;
  }

  async getProperties(databaseId: string): Promise<DatabaseProperty[]> {
    const props = await db.databaseProperties.where('databaseId').equals(databaseId).toArray();
    return props.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async createProperty(property: DatabaseProperty): Promise<DatabaseProperty> {
    await db.databaseProperties.add(property);
    return property;
  }

  async saveProperty(property: DatabaseProperty): Promise<void> {
    await db.databaseProperties.put(property);
  }

  async deleteProperty(propertyId: string): Promise<void> {
    await db.databaseProperties.delete(propertyId);
  }

  async getRows(databaseId: string): Promise<DatabaseRow[]> {
    const rows = await db.databaseRows.where('databaseId').equals(databaseId).toArray();
    return rows.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async createRow(row: DatabaseRow): Promise<DatabaseRow> {
    await db.databaseRows.add(row);
    return row;
  }

  async updateRow(rowId: string, row: DatabaseRow): Promise<void> {
    await db.databaseRows.put(row);
  }

  async saveRow(row: DatabaseRow): Promise<void> {
    await db.databaseRows.put(row);
  }

  async deleteRow(rowId: string): Promise<void> {
    await db.databaseRows.delete(rowId);
  }

  async getViews(databaseId: string): Promise<DatabaseView[]> {
    const views = await db.databaseViews.where('databaseId').equals(databaseId).toArray();
    return views.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async saveView(view: DatabaseView): Promise<void> {
    await db.databaseViews.put(view);
  }

  async deleteView(viewId: string): Promise<void> {
    await db.databaseViews.delete(viewId);
  }
}

export class WorkspaceRepository {
  async getAll(): Promise<Workspace[]> {
    return await db.workspaces.toArray();
  }

  async getById(id: string): Promise<Workspace | null> {
    const ws = await db.workspaces.get(id);
    return ws || null;
  }

  async create(ws: Workspace): Promise<Workspace> {
    await db.workspaces.add(ws);
    return ws;
  }

  async update(id: string, updates: Partial<Workspace>): Promise<void> {
    await db.workspaces.update(id, { ...updates, updatedAt: Date.now() });
  }
}

export const pageRepo = new PageRepository();
export const blockRepo = new BlockRepository();
export const databaseRepo = new DatabaseRepository();
export const workspaceRepo = new WorkspaceRepository();
