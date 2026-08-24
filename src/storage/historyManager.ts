import { db } from './db';
import { Page, Block, PageHistoryRecord } from '../types';

export class HistoryManager {
  private static readonly MAX_REVISIONS_PER_PAGE = 30;

  static async createSnapshot(
    page: Page,
    blocks: Block[],
    summary?: string,
    authorName = 'Local User'
  ): Promise<void> {
    const snapshotJson = JSON.stringify({
      page,
      blocks,
      timestamp: Date.now(),
    });

    const record: PageHistoryRecord = {
      id: crypto.randomUUID(),
      pageId: page.id,
      snapshotJson,
      changeSummary: summary || `Auto-save checkpoint (${blocks.length} blocks)`,
      authorName,
      createdAt: Date.now(),
    };

    await db.pageHistory.add(record);
    await this.pruneRevisions(page.id);
  }

  static async listRevisions(pageId: string): Promise<PageHistoryRecord[]> {
    const records = await db.pageHistory.where('pageId').equals(pageId).toArray();
    return records.sort((a, b) => b.createdAt - a.createdAt);
  }

  static async getRevision(revisionId: string): Promise<{
    page: Page;
    blocks: Block[];
    timestamp: number;
  } | null> {
    const record = await db.pageHistory.get(revisionId);
    if (!record) return null;
    try {
      return JSON.parse(record.snapshotJson);
    } catch {
      return null;
    }
  }

  static async pruneRevisions(pageId: string): Promise<void> {
    const records = await db.pageHistory.where('pageId').equals(pageId).toArray();
    if (records.length > this.MAX_REVISIONS_PER_PAGE) {
      records.sort((a, b) => b.createdAt - a.createdAt);
      const toDelete = records.slice(this.MAX_REVISIONS_PER_PAGE);
      for (const item of toDelete) {
        await db.pageHistory.delete(item.id);
      }
    }
  }
}
