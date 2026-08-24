import { db } from './db';
import { Page, Block, Database, DatabaseProperty, DatabaseRow, DatabaseView, Workspace } from '../types';

export interface RationBackupManifest {
  version: '1.0.0';
  appName: 'Ration';
  exportDate: string;
  timestamp: number;
  workspace: Workspace;
  pages: Page[];
  blocks: Block[];
  databases: Database[];
  databaseProperties: DatabaseProperty[];
  databaseRows: DatabaseRow[];
  databaseViews: DatabaseView[];
  stats: {
    pageCount: number;
    blockCount: number;
    databaseCount: number;
  };
}

export class BackupExportManager {
  static async createBackupPackage(workspaceId: string): Promise<{ data: string; filename: string }> {
    const ws = await db.workspaces.get(workspaceId);
    const pages = await db.pages.where('workspaceId').equals(workspaceId).toArray();
    const pageIds = pages.map((p) => p.id);

    const blocks = await db.blocks.where('pageId').anyOf(pageIds).toArray();
    const databases = await db.databases.where('workspaceId').equals(workspaceId).toArray();
    const dbIds = databases.map((d) => d.id);

    const properties = await db.databaseProperties.where('databaseId').anyOf(dbIds).toArray();
    const rows = await db.databaseRows.where('databaseId').anyOf(dbIds).toArray();
    const views = await db.databaseViews.where('databaseId').anyOf(dbIds).toArray();

    const timestamp = Date.now();
    const dateStr = new Date(timestamp).toISOString().split('T')[0];
    const wsName = (ws?.name || 'Workspace').replace(/[^a-zA-Z0-9]/g, '_');

    const manifest: RationBackupManifest = {
      version: '1.0.0',
      appName: 'Ration',
      exportDate: new Date(timestamp).toISOString(),
      timestamp,
      workspace: ws || {
        id: workspaceId,
        name: 'My Workspace',
        slug: 'my-workspace',
        icon: '🚀',
        settings: {},
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      pages,
      blocks,
      databases,
      databaseProperties: properties,
      databaseRows: rows,
      databaseViews: views,
      stats: {
        pageCount: pages.length,
        blockCount: blocks.length,
        databaseCount: databases.length,
      },
    };

    const jsonString = JSON.stringify(manifest, null, 2);
    const filename = `${wsName}-${dateStr}.rationbackup`;
    return { data: jsonString, filename };
  }

  static async restoreBackupPackage(jsonContent: string): Promise<{ success: boolean; message: string }> {
    try {
      const manifest: RationBackupManifest = JSON.parse(jsonContent);
      if (manifest.appName !== 'Ration' || !Array.isArray(manifest.pages)) {
        throw new Error('Invalid backup file. Missing Ration manifest structure.');
      }

      await db.transaction(
        'rw',
        [
          db.workspaces,
          db.pages,
          db.blocks,
          db.databases,
          db.databaseProperties,
          db.databaseRows,
          db.databaseViews,
        ],
        async () => {
          if (manifest.workspace) {
            await db.workspaces.put(manifest.workspace);
          }
          if (manifest.pages.length > 0) {
            await db.pages.bulkPut(manifest.pages);
          }
          if (manifest.blocks.length > 0) {
            await db.blocks.bulkPut(manifest.blocks);
          }
          if (manifest.databases.length > 0) {
            await db.databases.bulkPut(manifest.databases);
          }
          if (manifest.databaseProperties.length > 0) {
            await db.databaseProperties.bulkPut(manifest.databaseProperties);
          }
          if (manifest.databaseRows.length > 0) {
            await db.databaseRows.bulkPut(manifest.databaseRows);
          }
          if (manifest.databaseViews.length > 0) {
            await db.databaseViews.bulkPut(manifest.databaseViews);
          }
        }
      );

      return {
        success: true,
        message: `Restored ${manifest.pages.length} pages, ${manifest.blocks.length} blocks, and ${manifest.databases.length} databases.`,
      };
    } catch (err) {
      return {
        success: false,
        message: `Restore failed: ${(err as Error).message}`,
      };
    }
  }

  static async exportPageToMarkdown(page: Page, blocks: Block[]): Promise<string> {
    const lines: string[] = [];
    lines.push(`---`);
    lines.push(`title: "${page.title || 'Untitled'}"`);
    lines.push(`created: "${new Date(page.createdAt).toISOString()}"`);
    lines.push(`updated: "${new Date(page.updatedAt).toISOString()}"`);
    if (page.icon) lines.push(`icon: "${page.icon}"`);
    lines.push(`---\n`);

    lines.push(`# ${page.icon ? page.icon + ' ' : ''}${page.title || 'Untitled'}\n`);

    for (const b of blocks) {
      const text = b.content.text || '';
      switch (b.type) {
        case 'heading1':
          lines.push(`\n# ${text}\n`);
          break;
        case 'heading2':
          lines.push(`\n## ${text}\n`);
          break;
        case 'heading3':
          lines.push(`\n### ${text}\n`);
          break;
        case 'todo':
          lines.push(`- [${b.content.checked ? 'x' : ' '}] ${text}`);
          break;
        case 'bullet':
          lines.push(`- ${text}`);
          break;
        case 'number':
          lines.push(`1. ${text}`);
          break;
        case 'quote':
          lines.push(`> ${text}`);
          break;
        case 'callout':
          lines.push(`> 💡 **${b.content.icon || 'Note'}:** ${text}`);
          break;
        case 'code':
          lines.push(`\n\`\`\`${b.content.language || 'text'}\n${text}\n\`\`\`\n`);
          break;
        case 'divider':
          lines.push(`\n---\n`);
          break;
        case 'image':
          lines.push(`\n![${b.content.caption || 'Image'}](${b.content.url || ''})\n`);
          break;
        case 'bookmark':
          lines.push(`\n[🔗 ${b.content.caption || b.content.url}](${b.content.url})\n`);
          break;
        case 'toggle':
          lines.push(`\n<details><summary>${text}</summary>\n\n</details>\n`);
          break;
        case 'paragraph':
        default:
          lines.push(`${text}\n`);
          break;
      }
    }

    return lines.join('\n');
  }

  static async exportPageById(pageId: string): Promise<{ page: Page; blocks: Block[] } | null> {
    const page = await db.pages.get(pageId);
    if (!page) return null;
    const blocks = await db.blocks.where('pageId').equals(pageId).sortBy('orderIndex');
    return { page, blocks };
  }

  static async exportPageToHTML(pageId: string): Promise<string> {
    const res = await this.exportPageById(pageId);
    if (!res) return '';
    const { page, blocks } = res;
    const md = await this.exportPageToMarkdown(page, blocks);
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${page.title || 'Untitled'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 760px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #1c1917; }
    h1 { font-size: 2rem; border-bottom: 1px solid #e7e5e4; padding-bottom: 8px; }
    pre { background: #1c1917; color: #6ee7b7; padding: 12px; border-radius: 8px; overflow-x: auto; }
    blockquote { border-left: 3px solid #1c1917; margin: 0; padding-left: 12px; font-style: italic; color: #57534e; }
  </style>
</head>
<body>
  <h1>${page.icon || ''} ${page.title || 'Untitled'}</h1>
  <div><pre style="background:transparent;color:inherit;font-family:inherit;white-space:pre-wrap;">${md}</pre></div>
</body>
</html>`;
  }

  static async exportPageToJSON(pageId: string): Promise<string> {
    const res = await this.exportPageById(pageId);
    if (!res) return '{}';
    return JSON.stringify(res, null, 2);
  }

  static async exportDatabaseToCSV(databaseId: string): Promise<string> {
    const props = await db.databaseProperties.where('databaseId').equals(databaseId).toArray();
    props.sort((a, b) => a.orderIndex - b.orderIndex);
    const rows = await db.databaseRows.where('databaseId').equals(databaseId).toArray();

    const headers = ['Title', ...props.map((p) => p.name)];
    const escapeCsv = (val: unknown) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvLines = [headers.map(escapeCsv).join(',')];

    for (const row of rows) {
      const rowValues = [row.title || 'Untitled'];
      for (const p of props) {
        const val = row.values[p.id];
        if (Array.isArray(val)) {
          rowValues.push(val.join('; '));
        } else if (typeof val === 'object' && val !== null) {
          rowValues.push(JSON.stringify(val));
        } else {
          rowValues.push(val !== undefined ? String(val) : '');
        }
      }
      csvLines.push(rowValues.map(escapeCsv).join(','));
    }

    return csvLines.join('\n');
  }

  static triggerDownload(filename: string, content: string, mimeType = 'application/json'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
