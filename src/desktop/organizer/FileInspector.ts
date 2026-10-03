import * as fs from 'node:fs';
import * as path from 'node:path';

export interface DocumentProfile {
  filePath: string;
  filename: string;
  extension: string;
  sizeBytes: number;
  mtime: Date;
  excerpt: string;
  detectedType: string;
  identifiedTopic?: string;
  entities: string[];
}

export class FileInspector {
  private static TEXT_EXTENSIONS = new Set([
    '.txt', '.md', '.markdown', '.csv', '.tsv', '.json', '.yaml', '.yml',
    '.xml', '.html', '.htm', '.css', '.js', '.ts', '.jsx', '.tsx', '.py',
    '.java', '.c', '.cpp', '.h', '.sql', '.sh', '.bat', '.cmd', '.log',
    '.ini', '.env', '.toml', '.rtf'
  ]);

  private static IMAGE_EXTENSIONS = new Set([
    '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.bmp', '.ico', '.tiff', '.heic'
  ]);

  private static MEDIA_EXTENSIONS = new Set([
    '.mp4', '.mkv', '.avi', '.mov', '.wmv', '.webm', '.flv',
    '.mp3', '.wav', '.aac', '.flac', '.ogg', '.m4a'
  ]);

  private static ARCHIVE_EXTENSIONS = new Set([
    '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz'
  ]);

  private static DOCUMENT_EXTENSIONS = new Set([
    '.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt', '.odt', '.epub'
  ]);

  /**
   * Generates a compact semantic profile card for a file by inspecting its contents, metadata, and keywords.
   */
  public async inspectFile(filePath: string): Promise<DocumentProfile> {
    const filename = path.basename(filePath);
    const ext = path.extname(filename).toLowerCase();
    const stat = await fs.promises.stat(filePath);

    let excerpt = '';
    let detectedType = 'Other';
    const entities: string[] = [];

    if (FileInspector.TEXT_EXTENSIONS.has(ext)) {
      detectedType = 'Text/Code';
      excerpt = await this.readTextHead(filePath, 4096);
    } else if (ext === '.pdf') {
      detectedType = 'PDF Document';
      excerpt = await this.readPdfTextPreview(filePath);
    } else if (FileInspector.DOCUMENT_EXTENSIONS.has(ext)) {
      detectedType = 'Office Document';
      excerpt = await this.readBinaryStrings(filePath, 4096);
    } else if (FileInspector.IMAGE_EXTENSIONS.has(ext)) {
      detectedType = 'Image';
      excerpt = `Image file: ${filename} (${(stat.size / 1024).toFixed(1)} KB)`;
    } else if (FileInspector.MEDIA_EXTENSIONS.has(ext)) {
      detectedType = 'Media/Video/Audio';
      excerpt = `Media file: ${filename} (${(stat.size / (1024 * 1024)).toFixed(1)} MB)`;
    } else if (FileInspector.ARCHIVE_EXTENSIONS.has(ext)) {
      detectedType = 'Compressed Archive';
      excerpt = `Archive file: ${filename}`;
    }

    // Extract key entities and semantic topic signals from both filename and excerpt
    const combinedContent = `${filename} ${excerpt}`.toLowerCase();
    const topic = this.detectSemanticTopic(filename, combinedContent);

    // Extract dates if present
    const dateMatch = combinedContent.match(/\b(202[0-9]|199[0-9]|january|february|march|april|may|june|july|august|september|october|november|december)\b/gi);
    if (dateMatch) {
      entities.push(...Array.from(new Set(dateMatch.map((d) => d.toLowerCase()))));
    }

    if (topic) {
      entities.push(topic);
    }

    return {
      filePath,
      filename,
      extension: ext,
      sizeBytes: stat.size,
      mtime: stat.mtime,
      excerpt: excerpt.slice(0, 500).replace(/\s+/g, ' ').trim(),
      detectedType,
      identifiedTopic: topic,
      entities: Array.from(new Set(entities)),
    };
  }

  /**
   * Reads up to maxBytes from the start of a text file safely.
   */
  private async readTextHead(filePath: string, maxBytes: number): Promise<string> {
    try {
      const fd = await fs.promises.open(filePath, 'r');
      const buffer = Buffer.alloc(maxBytes);
      const { bytesRead } = await fd.read(buffer, 0, maxBytes, 0);
      await fd.close();
      return buffer.toString('utf-8', 0, bytesRead);
    } catch {
      return '';
    }
  }

  /**
   * Reads readable plain text snippets from PDF files without heavy external dependencies.
   */
  private async readPdfTextPreview(filePath: string): Promise<string> {
    try {
      const fd = await fs.promises.open(filePath, 'r');
      const buffer = Buffer.alloc(8192);
      const { bytesRead } = await fd.read(buffer, 0, 8192, 0);
      await fd.close();

      const raw = buffer.toString('binary', 0, bytesRead);
      // Extract text inside PDF parenthesis /Text blocks or /Title metadata
      const titleMatch = raw.match(/\/Title\s*\(([^)]+)\)/i);
      const textMatches = raw.match(/\(([^)]{3,60})\)\s*Tj/g);

      const snippets: string[] = [];
      if (titleMatch) snippets.push(`Title: ${titleMatch[1]}`);
      if (textMatches) {
        snippets.push(
          ...textMatches
            .map((m) => m.replace(/[()]/g, '').replace(/Tj/g, '').trim())
            .filter((s) => s.length > 3)
            .slice(0, 10)
        );
      }

      return snippets.join(' ') || `PDF document: ${path.basename(filePath)}`;
    } catch {
      return `PDF document: ${path.basename(filePath)}`;
    }
  }

  /**
   * Reads printable ASCII/UTF-8 strings from binary Office/document containers.
   */
  private async readBinaryStrings(filePath: string, maxBytes: number): Promise<string> {
    try {
      const fd = await fs.promises.open(filePath, 'r');
      const buffer = Buffer.alloc(maxBytes);
      const { bytesRead } = await fd.read(buffer, 0, maxBytes, 0);
      await fd.close();

      const str = buffer.toString('utf-8', 0, bytesRead);
      const words = str.match(/[A-Za-z0-9_-]{4,30}/g) || [];
      return words.slice(0, 30).join(' ');
    } catch {
      return '';
    }
  }

  /**
   * Detects semantic business topics (e.g., Invoices, Taxes, Healthcare, Resumes, Project Code).
   */
  private detectSemanticTopic(filename: string, content: string): string | undefined {
    const text = content.toLowerCase();
    const fn = filename.toLowerCase();

    if (text.includes('invoice') || text.includes('receipt') || text.includes('billing') || fn.includes('inv_') || fn.includes('bill')) {
      if (text.includes('aws') || text.includes('amazon web services')) return 'AWS_Invoices';
      if (text.includes('google') || text.includes('cloud')) return 'Cloud_Invoices';
      if (text.includes('contractor') || text.includes('consulting')) return 'Contractor_Invoices';
      return 'Invoices_and_Billing';
    }

    if (text.includes('tax') || text.includes('w2') || text.includes('1099') || text.includes('vat') || text.includes('ein')) {
      return 'Tax_and_Compliance';
    }

    if (text.includes('resume') || text.includes('curriculum vitae') || text.includes('experience') || text.includes('education') || fn.includes('resume') || fn.includes('cv')) {
      return 'Resumes_and_Careers';
    }

    if (text.includes('clinical') || text.includes('medical') || text.includes('pubmed') || text.includes('curalink') || text.includes('patient') || text.includes('health')) {
      return 'Healthcare_and_Research';
    }

    if (text.includes('statement') || text.includes('bank') || text.includes('balance') || text.includes('transaction')) {
      return 'Bank_Statements';
    }

    if (text.includes('contract') || text.includes('agreement') || text.includes('terms') || text.includes('nda')) {
      return 'Legal_Contracts';
    }

    if (text.includes('dataset') || text.includes('csv') || text.includes('database') || text.includes('postgres') || text.includes('mysql')) {
      return 'Data_and_Analytics';
    }

    if (text.includes('meeting') || text.includes('transcript') || text.includes('notes') || text.includes('agenda')) {
      return 'Meeting_Notes';
    }

    return undefined;
  }
}
