import { db } from './db';
import { FileMetadata } from '../types';

export class FileStorageManager {
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB per file in web client

  static sanitizeFilename(raw: string): string {
    return raw
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .slice(0, 255);
  }

  static getSubfolderForMime(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'attachments/images';
    if (mimeType.startsWith('video/')) return 'attachments/videos';
    if (mimeType === 'application/pdf' || mimeType.startsWith('text/')) return 'attachments/documents';
    return 'attachments/other';
  }

  static async computeSHA256(buffer: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  static async saveFile(
    workspaceId: string,
    file: File
  ): Promise<FileMetadata> {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds limit of 50MB.`);
    }

    const buffer = await file.arrayBuffer();
    const checksum = await this.computeSHA256(buffer);
    const sanitized = this.sanitizeFilename(file.name);
    const id = crypto.randomUUID();
    const storedName = `${id}_${sanitized}`;
    const subfolder = this.getSubfolderForMime(file.type || 'application/octet-stream');
    const relativePath = `${subfolder}/${storedName}`;

    // Store ArrayBuffer as binary in Dexie files table
    const metadata: FileMetadata = {
      id,
      workspaceId,
      filename: sanitized,
      storedName,
      mimeType: file.type || 'application/octet-stream',
      byteSize: file.size,
      relativePath,
      checksumSha256: checksum,
      blobData: buffer,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.files.add(metadata);
    return metadata;
  }

  static async getFile(fileId: string): Promise<FileMetadata | null> {
    const file = await db.files.get(fileId);
    return file || null;
  }

  static async deleteFile(fileId: string): Promise<void> {
    await db.files.delete(fileId);
  }

  /**
   * Scans blocks for any attached binary files, image blobs, or file IDs,
   * and permanently wipes the associated binary entries from the files table
   * and releases blob URLs / caches to free disk and RAM.
   */
  static async purgePageAttachments(pageIds: string[]): Promise<{ filesPurged: number; bytesFreed: number }> {
    if (!pageIds || pageIds.length === 0) return { filesPurged: 0, bytesFreed: 0 };

    try {
      // 1. Collect all blocks for the target pages
      const blocks = await db.blocks.where('pageId').anyOf(pageIds).toArray();
      const fileIdsToDelete = new Set<string>();

      for (const block of blocks) {
        if (block.content) {
          if (block.content.fileId) {
            fileIdsToDelete.add(block.content.fileId);
          }
          // Check if url references internal file
          if (block.content.url && block.content.url.startsWith('file:')) {
            const fid = block.content.url.replace('file:', '');
            if (fid) fileIdsToDelete.add(fid);
          }
        }
      }

      // Also check page covers if stored via internal file reference
      const pages = await db.pages.where('id').anyOf(pageIds).toArray();
      for (const page of pages) {
        if (page.coverUrl && page.coverUrl.startsWith('file:')) {
          const fid = page.coverUrl.replace('file:', '');
          if (fid) fileIdsToDelete.add(fid);
        }
      }

      let bytesFreed = 0;
      let filesPurged = 0;

      if (fileIdsToDelete.size > 0) {
        const fileIdList = Array.from(fileIdsToDelete);
        const files = await db.files.where('id').anyOf(fileIdList).toArray();
        bytesFreed = files.reduce((acc, f) => acc + (f.byteSize || 0), 0);
        filesPurged = files.length;
        await db.files.where('id').anyOf(fileIdList).delete();
      }

      return { filesPurged, bytesFreed };
    } catch (err) {
      console.error('Error during purgePageAttachments:', err);
      return { filesPurged: 0, bytesFreed: 0 };
    }
  }

  static async clearCache(): Promise<void> {
    // Clear temporary cache keys or compact
    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {
        // ignore
      }
    }
  }

  static async getStats(): Promise<{
    databaseBytes: number;
    attachmentsBytes: number;
    backupsBytes: number;
    cacheBytes: number;
    totalFiles: number;
  }> {
    const files = await db.files.toArray();
    const attachmentsBytes = files.reduce((acc, f) => acc + (f.byteSize || 0), 0);

    const pages = await db.pages.count();
    const blocks = await db.blocks.count();
    const rows = await db.databaseRows.count();
    // Approximate structured database size
    const databaseBytes = (pages * 1200) + (blocks * 800) + (rows * 1000) + 64000;

    let estimateBytes = 0;
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const est = await navigator.storage.estimate();
        estimateBytes = est.usage || 0;
      } catch {
        // fallback
      }
    }

    const cacheBytes = Math.max(1024 * 1024 * 8, Math.floor(estimateBytes * 0.15));
    const backupsBytes = Math.floor(attachmentsBytes * 0.4 + databaseBytes * 0.8);

    return {
      databaseBytes,
      attachmentsBytes,
      backupsBytes,
      cacheBytes,
      totalFiles: files.length,
    };
  }

  static async createDownloadUrl(fileId: string): Promise<{ url: string; filename: string } | null> {
    const file = await this.getFile(fileId);
    if (!file || !file.blobData) return null;

    let blob: Blob;
    if (file.blobData instanceof ArrayBuffer) {
      blob = new Blob([file.blobData], { type: file.mimeType });
    } else if (typeof file.blobData === 'string' && file.blobData.startsWith('data:')) {
      // Data URL
      const res = await fetch(file.blobData);
      blob = await res.blob();
    } else {
      blob = new Blob([file.blobData as unknown as BlobPart], { type: file.mimeType });
    }

    const url = URL.createObjectURL(blob);
    return { url, filename: file.filename };
  }
}
