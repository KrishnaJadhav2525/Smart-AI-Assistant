import * as fs from 'node:fs';
import * as path from 'node:path';
import { spawn } from 'node:child_process';
import type { ExecutionResult } from '../browser/ActionExecutor.js';
import { SmartOrganizer } from './organizer/SmartOrganizer.js';

export interface DesktopNoteOptions {
  title: string;
  content: string;
  openInNotepad?: boolean;
}

export class DesktopExecutor {
  private outputDir: string;
  private smartOrganizer: SmartOrganizer;

  constructor() {
    this.outputDir = path.resolve(process.cwd(), 'data', 'outputs');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    this.smartOrganizer = new SmartOrganizer();
  }

  /**
   * Normalizes arbitrary cross-platform path strings, including Windows drive letters and Git Bash mounts.
   */
  public normalizePath(rawPath?: string): string {
    if (!rawPath || !rawPath.trim()) {
      return process.cwd();
    }
    let target = rawPath.trim();

    // Convert Git Bash mount (/d/ or /c/) to Windows drive (D:\ or C:\)
    if (/^\/[a-zA-Z](\/|$)/.test(target)) {
      const driveLetter = target[1].toUpperCase();
      const rest = target.slice(2).replace(/\//g, path.sep);
      target = `${driveLetter}:${path.sep}${rest}`;
    } else if (/^[a-zA-Z]:$/.test(target)) {
      target = `${target}${path.sep}`;
    }

    return path.resolve(target);
  }

  /**
   * Executes a desktop-level or local file tool.
   */
  public async execute(toolName: string, args: Record<string, any>): Promise<ExecutionResult> {
    switch (toolName) {
      case 'desktop_write_note':
        return await this.writeNote(args.title, args.content, args.openInNotepad === true);

      case 'desktop_launch_app':
        return await this.launchApp(args.app, args.targetPath);

      case 'desktop_reveal_file':
        return await this.revealFile(args.filePath);

      case 'file_read':
        return await this.readFile(args.filePath, args.maxLines);

      case 'file_list_directory':
        return await this.listDirectory(args.dirPath, args.maxItems);

      case 'file_organize_directory':
        return await this.organizeDirectory(args.dirPath, args.mode || (args.smart ? 'smart' : 'extension'));

      case 'file_organize_smart':
        return await this.organizeSmart(args.dirPath, args.dryRun === true);

      case 'file_rename_folder_by_content':
        return await this.renameFolderByContent(args.folderPath);

      case 'file_undo_organize':
        return await this.undoOrganize(args.manifestPath);

      case 'file_move':
        return await this.moveFile(args.sourcePath, args.destinationPath);

      case 'file_create_directory':
        return await this.createDirectory(args.dirPath);

      default:
        return {
          ok: false,
          action: toolName,
          output: '',
          error: `Unknown desktop tool: "${toolName}"`,
        };
    }
  }

  /**
   * Lists files and folders inside a local directory or drive.
   */
  public async listDirectory(rawPath?: string, maxItems: number = 100): Promise<ExecutionResult> {
    const targetDir = this.normalizePath(rawPath);

    if (!fs.existsSync(targetDir)) {
      return {
        ok: false,
        action: 'file_list_directory',
        output: '',
        error: `Directory "${targetDir}" does not exist.`,
      };
    }

    try {
      const stat = await fs.promises.stat(targetDir);
      if (!stat.isDirectory()) {
        return {
          ok: false,
          action: 'file_list_directory',
          output: '',
          error: `Path "${targetDir}" is a file, not a directory.`,
        };
      }

      const entries = await fs.promises.readdir(targetDir, { withFileTypes: true });

      const folders: string[] = [];
      const files: Array<{ name: string; size: number; ext: string }> = [];

      for (const entry of entries) {
        // Skip hidden Windows system volumes
        if (entry.name === '$RECYCLE.BIN' || entry.name === 'System Volume Information') {
          continue;
        }

        if (entry.isDirectory()) {
          folders.push(entry.name);
        } else if (entry.isFile()) {
          try {
            const fileStat = fs.statSync(path.join(targetDir, entry.name));
            files.push({
              name: entry.name,
              size: fileStat.size,
              ext: path.extname(entry.name).toLowerCase(),
            });
          } catch {
            files.push({
              name: entry.name,
              size: 0,
              ext: path.extname(entry.name).toLowerCase(),
            });
          }
        }
      }

      const truncatedFiles = files.slice(0, maxItems);
      const summary = [
        `Directory listing for: ${targetDir}`,
        `Folders (${folders.length}): ${folders.slice(0, 30).join(', ') || 'None'}`,
        `Files (${files.length}):`,
        ...truncatedFiles.map(
          (f) => `  - ${f.name} (${(f.size / 1024).toFixed(1)} KB)`
        ),
      ];

      if (files.length > maxItems) {
        summary.push(`  ... and ${files.length - maxItems} more files.`);
      }

      return {
        ok: true,
        action: 'file_list_directory',
        output: summary.join('\n'),
        verification: {
          verified: true,
          reason: `Found ${folders.length} folders and ${files.length} files in "${targetDir}".`,
        },
      };
    } catch (err: any) {
      return {
        ok: false,
        action: 'file_list_directory',
        output: '',
        error: `Failed to list directory "${targetDir}": ${err?.message || err}`,
      };
    }
  }

  /**
   * Organizes loose files in a directory or local drive by file type or semantic content into clean folders.
   */
  public async organizeDirectory(
    rawPath?: string,
    mode: 'extension' | 'smart' = 'extension'
  ): Promise<ExecutionResult> {
    if (mode === 'smart') {
      return await this.organizeSmart(rawPath);
    }
    const targetDir = this.normalizePath(rawPath);

    if (!fs.existsSync(targetDir)) {
      return {
        ok: false,
        action: 'file_organize_directory',
        output: '',
        error: `Directory "${targetDir}" does not exist.`,
      };
    }

    try {
      const stat = await fs.promises.stat(targetDir);
      if (!stat.isDirectory()) {
        return {
          ok: false,
          action: 'file_organize_directory',
          output: '',
          error: `Target "${targetDir}" is a file, not a directory.`,
        };
      }

      // Extension categorization dictionary
      const CATEGORIES: Record<string, string[]> = {
        Documents: ['.pdf', '.docx', '.doc', '.txt', '.xlsx', '.xls', '.pptx', '.csv', '.rtf', '.epub', '.odt'],
        Images: ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.bmp', '.ico', '.tiff'],
        Videos: ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm'],
        Audio: ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.m4a'],
        Archives: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
        Code: ['.js', '.ts', '.py', '.java', '.cpp', '.c', '.html', '.css', '.json', '.yaml', '.yml', '.xml', '.sql'],
        Installers: ['.exe', '.msi', '.iso', '.dmg', '.pkg', '.deb', '.apk'],
      };

      const entries = await fs.promises.readdir(targetDir, { withFileTypes: true });
      const movedSummary: Record<string, number> = {};
      let totalMoved = 0;

      for (const entry of entries) {
        // Skip system and hidden files
        if (!entry.isFile() || entry.name.startsWith('.') || entry.name === 'desktop.ini') {
          continue;
        }

        const ext = path.extname(entry.name).toLowerCase();
        let targetCategory = 'Other_Files';

        for (const [category, extList] of Object.entries(CATEGORIES)) {
          if (extList.includes(ext)) {
            targetCategory = category;
            break;
          }
        }

        const categoryDir = path.join(targetDir, targetCategory);
        if (!fs.existsSync(categoryDir)) {
          await fs.promises.mkdir(categoryDir, { recursive: true });
        }

        const srcPath = path.join(targetDir, entry.name);
        const destPath = path.join(categoryDir, entry.name);

        // Move file safely
        await this.safeMove(srcPath, destPath);

        movedSummary[targetCategory] = (movedSummary[targetCategory] || 0) + 1;
        totalMoved++;
      }

      const summaryDetails = Object.entries(movedSummary)
        .map(([cat, count]) => `  - ${cat}: ${count} file${count === 1 ? '' : 's'}`)
        .join('\n');

      const outputMsg = totalMoved > 0
        ? `Successfully organized ${totalMoved} files in "${targetDir}":\n${summaryDetails}`
        : `No loose files needed organizing in "${targetDir}". All files are already in folders.`;

      return {
        ok: true,
        action: 'file_organize_directory',
        output: outputMsg,
        verification: {
          verified: true,
          reason: `Organized ${totalMoved} files into category folders.`,
        },
      };
    } catch (err: any) {
      return {
        ok: false,
        action: 'file_organize_directory',
        output: '',
        error: `Failed to organize directory "${targetDir}": ${err?.message || err}`,
      };
    }
  }

  /**
   * Semantically organizes files by inspecting inner content (excerpts, topics, dates) and clustering into smart folders.
   */
  public async organizeSmart(rawPath?: string, dryRun: boolean = false): Promise<ExecutionResult> {
    const targetDir = this.normalizePath(rawPath);
    try {
      const result = await this.smartOrganizer.organizeDirectoryByContent(targetDir, { dryRun });
      const summary = [
        `Content-Aware Smart Organization completed for: ${result.targetDirectory}`,
        `Total Files Scanned: ${result.totalFilesScanned}`,
        `Files Categorized & Moved: ${result.filesMoved}`,
        `Semantic Topic Folders Created (${result.categoriesCreated.length}):`,
        ...result.categoriesCreated.map((c) => `  - ${c}`),
        result.manifestPath ? `Transactional Undo Manifest saved to: ${result.manifestPath}` : '',
      ].filter(Boolean).join('\n');

      return {
        ok: true,
        action: 'file_organize_smart',
        output: summary,
        verification: {
          verified: true,
          reason: `Organized ${result.filesMoved} files semantically into ${result.categoriesCreated.length} topic folders.`,
        },
      };
    } catch (err: any) {
      return {
        ok: false,
        action: 'file_organize_smart',
        output: '',
        error: `Failed content-aware file organization: ${err?.message || err}`,
      };
    }
  }

  /**
   * Inspects files inside a folder, identifies the dominant content/topic theme, and renames the folder accordingly.
   */
  public async renameFolderByContent(rawPath: string): Promise<ExecutionResult> {
    if (!rawPath) {
      return {
        ok: false,
        action: 'file_rename_folder_by_content',
        output: '',
        error: 'Target folder path is required.',
      };
    }

    const targetFolder = this.normalizePath(rawPath);
    try {
      const result = await this.smartOrganizer.renameFolderByContent(targetFolder);
      return {
        ok: true,
        action: 'file_rename_folder_by_content',
        output: `Successfully renamed folder based on its contents:\n` +
          `  Original Name: "${result.originalName}" (${result.originalPath})\n` +
          `  New Name:      "${result.suggestedName}" (${result.newPath})\n` +
          `  Dominant Topic: ${result.dominantTopic} (Confidence: ${result.confidence}% across ${result.fileCount} files)`,
        verification: {
          verified: true,
          reason: `Folder renamed to "${result.suggestedName}" based on dominant topic "${result.dominantTopic}".`,
        },
      };
    } catch (err: any) {
      return {
        ok: false,
        action: 'file_rename_folder_by_content',
        output: '',
        error: `Failed to rename folder by content: ${err?.message || err}`,
      };
    }
  }

  /**
   * Rolls back an organization session using its transactional undo manifest.
   */
  public async undoOrganize(manifestPath: string): Promise<ExecutionResult> {
    if (!manifestPath) {
      return {
        ok: false,
        action: 'file_undo_organize',
        output: '',
        error: 'Manifest file path is required to undo file organization.',
      };
    }

    const resolved = this.normalizePath(manifestPath);
    try {
      const result = await this.smartOrganizer.undoOrganize(resolved);
      return {
        ok: true,
        action: 'file_undo_organize',
        output: `Successfully rolled back organization session. Restored ${result.restoredCount} files to their original locations.`,
        verification: {
          verified: true,
          reason: `Restored ${result.restoredCount} files via manifest "${resolved}".`,
        },
      };
    } catch (err: any) {
      return {
        ok: false,
        action: 'file_undo_organize',
        output: '',
        error: `Failed to undo file organization: ${err?.message || err}`,
      };
    }
  }

  /**
   * Moves a file or folder from source to destination.
   */
  public async moveFile(sourcePath: string, destinationPath: string): Promise<ExecutionResult> {
    if (!sourcePath || !destinationPath) {
      return {
        ok: false,
        action: 'file_move',
        output: '',
        error: 'Both "sourcePath" and "destinationPath" are required.',
      };
    }

    const src = this.normalizePath(sourcePath);
    const dest = this.normalizePath(destinationPath);

    if (!fs.existsSync(src)) {
      return {
        ok: false,
        action: 'file_move',
        output: '',
        error: `Source path "${src}" does not exist.`,
      };
    }

    try {
      const destDir = path.dirname(dest);
      if (!fs.existsSync(destDir)) {
        await fs.promises.mkdir(destDir, { recursive: true });
      }

      await this.safeMove(src, dest);

      return {
        ok: true,
        action: 'file_move',
        output: `Moved "${src}" to "${dest}".`,
        verification: {
          verified: true,
          reason: `File moved successfully.`,
        },
      };
    } catch (err: any) {
      return {
        ok: false,
        action: 'file_move',
        output: '',
        error: `Failed to move file: ${err?.message || err}`,
      };
    }
  }

  /**
   * Creates a directory at the given path.
   */
  public async createDirectory(dirPath: string): Promise<ExecutionResult> {
    if (!dirPath) {
      return {
        ok: false,
        action: 'file_create_directory',
        output: '',
        error: 'Directory path is required.',
      };
    }

    const targetDir = this.normalizePath(dirPath);

    try {
      await fs.promises.mkdir(targetDir, { recursive: true });
      return {
        ok: true,
        action: 'file_create_directory',
        output: `Created directory "${targetDir}".`,
        verification: {
          verified: true,
          reason: `Directory verified on disk.`,
        },
      };
    } catch (err: any) {
      return {
        ok: false,
        action: 'file_create_directory',
        output: '',
        error: `Failed to create directory: ${err?.message || err}`,
      };
    }
  }

  /**
   * Writes research or task notes to a local text file and optionally launches Notepad to display it.
   */
  public async writeNote(
    title: string,
    content: string,
    openInNotepad: boolean = false
  ): Promise<ExecutionResult> {
    if (!title || !content) {
      return {
        ok: false,
        action: 'desktop_write_note',
        output: '',
        error: 'Both "title" and "content" are required to write a desktop note.',
      };
    }

    try {
      const sanitizedTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '_')
        .slice(0, 50);
      const timestamp = new Date().toISOString();
      const filename = `${sanitizedTitle}-${Date.now().toString().slice(-6)}.txt`;
      const filePath = path.join(this.outputDir, filename);

      const formattedContent = [
        '============================================================',
        'Smart AI Assistant: Task & Research Notes',
        `Title:     ${title}`,
        `Timestamp: ${timestamp}`,
        '============================================================',
        '',
        content.trim(),
        '',
        '------------------------------------------------------------',
        `Generated autonomously by Smart AI Assistant Computer Operator.`,
        '============================================================',
      ].join('\n');

      await fs.promises.writeFile(filePath, formattedContent, 'utf-8');

      // Keep latest copy symlinked/named for instant reference
      const latestPath = path.join(this.outputDir, 'latest-research-note.txt');
      await fs.promises.writeFile(latestPath, formattedContent, 'utf-8');

      let appOpened = false;
      if (openInNotepad) {
        appOpened = this.spawnDesktopEditor(filePath);
      }

      const launchMsg = appOpened ? ' and displayed in desktop Notepad' : '';
      return {
        ok: true,
        action: 'desktop_write_note',
        output: `Successfully saved research notes to "${filePath}"${launchMsg}.`,
        verification: {
          verified: true,
          reason: `Note file written to disk (${Buffer.byteLength(formattedContent, 'utf-8')} bytes)${launchMsg}`,
        },
      };
    } catch (err: any) {
      return {
        ok: false,
        action: 'desktop_write_note',
        output: '',
        error: `Failed to write desktop note: ${err?.message || err}`,
      };
    }
  }

  /**
   * Launches a recognized desktop application safely.
   */
  public async launchApp(app: string, targetPath?: string): Promise<ExecutionResult> {
    const normalizedApp = (app || '').toLowerCase().trim();
    const resolvedPath = targetPath ? this.normalizePath(targetPath) : undefined;

    const allowedApps = ['notepad', 'calc', 'calculator', 'explorer', 'code'];
    if (!allowedApps.includes(normalizedApp)) {
      return {
        ok: false,
        action: 'desktop_launch_app',
        output: '',
        error: `Application "${app}" is not in the authorized desktop applications whitelist: [${allowedApps.join(', ')}].`,
      };
    }

    try {
      if (process.platform === 'win32') {
        const cmd = normalizedApp === 'notepad'
          ? 'notepad.exe'
          : normalizedApp === 'calc' || normalizedApp === 'calculator'
          ? 'calc.exe'
          : normalizedApp === 'explorer'
          ? 'explorer.exe'
          : 'code.cmd';

        const args = resolvedPath ? [resolvedPath] : [];
        const proc = spawn(cmd, args, { detached: true, stdio: 'ignore' });
        proc.unref();
      } else if (process.platform === 'darwin') {
        const appName = normalizedApp === 'notepad' ? 'TextEdit' : 'Calculator';
        const args = resolvedPath ? ['-a', appName, resolvedPath] : ['-a', appName];
        const proc = spawn('open', args, { detached: true, stdio: 'ignore' });
        proc.unref();
      } else {
        const cmd = normalizedApp === 'notepad' ? 'gedit' : 'xdg-open';
        const args = resolvedPath ? [resolvedPath] : [];
        const proc = spawn(cmd, args, { detached: true, stdio: 'ignore' });
        proc.unref();
      }

      return {
        ok: true,
        action: 'desktop_launch_app',
        output: `Launched desktop application "${app}" successfully${resolvedPath ? ` targeting "${resolvedPath}"` : ''}.`,
        verification: {
          verified: true,
          reason: `Spawned process for application "${app}"`,
        },
      };
    } catch (err: any) {
      return {
        ok: false,
        action: 'desktop_launch_app',
        output: '',
        error: `Failed to launch desktop application "${app}": ${err?.message || err}`,
      };
    }
  }

  /**
   * Opens the file explorer with the given file selected/highlighted.
   */
  public async revealFile(filePath: string): Promise<ExecutionResult> {
    if (!filePath) {
      return {
        ok: false,
        action: 'desktop_reveal_file',
        output: '',
        error: 'File path is required to reveal file in desktop file manager.',
      };
    }

    const resolved = this.normalizePath(filePath);
    if (!fs.existsSync(resolved)) {
      return {
        ok: false,
        action: 'desktop_reveal_file',
        output: '',
        error: `File path "${filePath}" does not exist on disk.`,
      };
    }

    try {
      if (process.platform === 'win32') {
        const proc = spawn('explorer.exe', [`/select,${resolved}`], { detached: true, stdio: 'ignore' });
        proc.unref();
      } else if (process.platform === 'darwin') {
        const proc = spawn('open', ['-R', resolved], { detached: true, stdio: 'ignore' });
        proc.unref();
      } else {
        const proc = spawn('xdg-open', [path.dirname(resolved)], { detached: true, stdio: 'ignore' });
        proc.unref();
      }

      return {
        ok: true,
        action: 'desktop_reveal_file',
        output: `Revealed "${resolved}" in system file manager.`,
        verification: {
          verified: true,
          reason: `Highlighted file in desktop file explorer.`,
        },
      };
    } catch (err: any) {
      return {
        ok: false,
        action: 'desktop_reveal_file',
        output: '',
        error: `Failed to reveal file: ${err?.message || err}`,
      };
    }
  }

  /**
   * Safely reads local project data files (JSON, CSV, text).
   */
  public async readFile(filePath: string, maxLines: number = 100): Promise<ExecutionResult> {
    if (!filePath) {
      return {
        ok: false,
        action: 'file_read',
        output: '',
        error: 'File path is required.',
      };
    }

    const resolved = this.normalizePath(filePath);

    // Security check: prevent directory traversal outside workspace
    if (filePath.includes('..') || (!path.isAbsolute(filePath) && !resolved.startsWith(process.cwd()))) {
      return {
        ok: false,
        action: 'file_read',
        output: '',
        error: `Access Denied: Path "${filePath}" traverses outside the current workspace.`,
      };
    }

    // Security check: prevent reading secret environment files
    const basename = path.basename(resolved);
    if (basename.startsWith('.env') || basename.includes('id_rsa') || basename.includes('credentials')) {
      return {
        ok: false,
        action: 'file_read',
        output: '',
        error: `Access Denied: Reading sensitive environment or key files is blocked by security policy.`,
      };
    }

    if (!fs.existsSync(resolved)) {
      return {
        ok: false,
        action: 'file_read',
        output: '',
        error: `File "${filePath}" does not exist.`,
      };
    }

    try {
      const content = await fs.promises.readFile(resolved, 'utf-8');
      const lines = content.split('\n');
      const truncated = lines.length > maxLines;
      const displayContent = truncated ? lines.slice(0, maxLines).join('\n') + `\n\n... [Truncated: ${lines.length - maxLines} more lines]` : content;

      return {
        ok: true,
        action: 'file_read',
        output: displayContent,
        verification: {
          verified: true,
          reason: `Successfully read ${lines.length} lines from "${filePath}".`,
        },
      };
    } catch (err: any) {
      return {
        ok: false,
        action: 'file_read',
        output: '',
        error: `Error reading file "${filePath}": ${err?.message || err}`,
      };
    }
  }

  private async safeMove(source: string, destination: string): Promise<void> {
    try {
      await fs.promises.rename(source, destination);
    } catch (err: any) {
      // Cross-device fallback (EXDEV)
      if (err.code === 'EXDEV') {
        await fs.promises.copyFile(source, destination);
        await fs.promises.unlink(source);
      } else {
        throw err;
      }
    }
  }

  private spawnDesktopEditor(filePath: string): boolean {
    try {
      if (process.platform === 'win32') {
        const proc = spawn('notepad.exe', [filePath], { detached: true, stdio: 'ignore' });
        proc.unref();
        return true;
      } else if (process.platform === 'darwin') {
        const proc = spawn('open', ['-a', 'TextEdit', filePath], { detached: true, stdio: 'ignore' });
        proc.unref();
        return true;
      } else {
        const proc = spawn('xdg-open', [filePath], { detached: true, stdio: 'ignore' });
        proc.unref();
        return true;
      }
    } catch {
      return false;
    }
  }
}
