import * as fs from 'node:fs';
import * as path from 'node:path';
import { FileInspector, DocumentProfile } from './FileInspector.js';

export interface MoveRecord {
  originalPath: string;
  newPath: string;
  filename: string;
  category: string;
  type?: 'file' | 'folder';
}

export interface OrganizeResult {
  targetDirectory: string;
  totalFilesScanned: number;
  totalFoldersScanned?: number;
  filesMoved: number;
  foldersMoved?: number;
  categoriesCreated: string[];
  manifestPath: string;
  moves: MoveRecord[];
  summaryMessage?: string;
}

export interface FolderRenameResult {
  originalPath: string;
  newPath: string;
  originalName: string;
  suggestedName: string;
  dominantTopic: string;
  confidence: number;
  fileCount: number;
}

export class SmartOrganizer {
  private inspector: FileInspector;

  private static PROTECTED_DIR_NAMES = new Set([
    '$recycle.bin', 'system volume information', 'boot', 'programdata',
    'program files', 'program files (x86)', 'users', 'windows',
    'recovery', 'appdata', 'msocache', 'documents_and_reports',
    'development_and_projects', 'studies_and_assignments', 'archives_and_backups',
    'media_and_audio', 'general_files', 'other_files', 'code_and_scripts'
  ]);

  constructor() {
    this.inspector = new FileInspector();
  }

  /**
   * Semantically organizes both files AND folders in a target directory or drive,
   * grouping by business topics (e.g. Invoices, Projects, Studies, Archives) rather than mere extensions.
   */
  public async organizeDirectoryByContent(
    targetDir: string,
    options: { dryRun?: boolean; recursive?: boolean } = {}
  ): Promise<OrganizeResult> {
    const resolvedTarget = path.resolve(targetDir);
    if (!fs.existsSync(resolvedTarget)) {
      throw new Error(`Target directory does not exist: ${resolvedTarget}`);
    }

    const entries = await fs.promises.readdir(resolvedTarget, { withFileTypes: true });
    const fileEntries = entries.filter((e) => e.isFile());
    const dirEntries = entries.filter((e) => e.isDirectory());

    const moves: MoveRecord[] = [];
    const categories = new Set<string>();

    // 1. Organize loose files in target directory
    for (const entry of fileEntries) {
      const fullPath = path.join(resolvedTarget, entry.name);
      if (entry.name.startsWith('.') || entry.name.startsWith('organizer-manifest')) {
        continue;
      }

      const profile = await this.inspector.inspectFile(fullPath);
      const destinationFolder = this.determineSemanticCategory(profile);

      const targetFolder = path.join(resolvedTarget, destinationFolder);
      const targetFilePath = path.join(targetFolder, entry.name);

      if (fullPath === targetFilePath) {
        continue;
      }

      if (!options.dryRun) {
        await fs.promises.mkdir(targetFolder, { recursive: true });
        const safeDestination = this.getUniqueDestination(targetFilePath);
        await fs.promises.rename(fullPath, safeDestination);

        moves.push({
          originalPath: fullPath,
          newPath: safeDestination,
          filename: entry.name,
          category: destinationFolder,
          type: 'file',
        });
      } else {
        moves.push({
          originalPath: fullPath,
          newPath: targetFilePath,
          filename: entry.name,
          category: destinationFolder,
          type: 'file',
        });
      }

      categories.add(destinationFolder);
    }

    // 2. Organize user subfolders in target directory (e.g. on D:\ drive)
    for (const entry of dirEntries) {
      const lowerName = entry.name.toLowerCase();
      // Skip hidden, manifest, Windows system, or already-categorized folders
      if (
        entry.name.startsWith('.') ||
        SmartOrganizer.PROTECTED_DIR_NAMES.has(lowerName) ||
        categories.has(entry.name) ||
        lowerName.startsWith('others_acer') ||
        lowerName.startsWith('g-11.')
      ) {
        continue;
      }

      const folderCategory = this.determineFolderCategory(entry.name);
      // Don't move a folder into itself
      if (entry.name === folderCategory) {
        categories.add(folderCategory);
        continue;
      }

      const targetParentFolder = path.join(resolvedTarget, folderCategory);
      const targetFolderPath = path.join(targetParentFolder, entry.name);

      if (!options.dryRun) {
        await fs.promises.mkdir(targetParentFolder, { recursive: true });
        const safeDestination = this.getUniqueDestination(targetFolderPath);
        await fs.promises.rename(path.join(resolvedTarget, entry.name), safeDestination);

        moves.push({
          originalPath: path.join(resolvedTarget, entry.name),
          newPath: safeDestination,
          filename: entry.name,
          category: folderCategory,
          type: 'folder',
        });
      } else {
        moves.push({
          originalPath: path.join(resolvedTarget, entry.name),
          newPath: targetFolderPath,
          filename: entry.name,
          category: folderCategory,
          type: 'folder',
        });
      }

      categories.add(folderCategory);
    }

    // Save transactional undo manifest
    const manifestDir = path.resolve('data/outputs');
    await fs.promises.mkdir(manifestDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const manifestPath = path.join(manifestDir, `organizer-manifest-${timestamp}.json`);

    const summaryDetails = Array.from(categories).map((c) => {
      const items = moves.filter((m) => m.category === c).map((m) => `${m.type === 'folder' ? '📁 ' : ''}${m.filename}`);
      return `  - ${c} (${items.length}): ${items.slice(0, 8).join(', ')}${items.length > 8 ? ' ...' : ''}`;
    }).join('\n');

    const summaryMessage = moves.length > 0
      ? `Successfully organized ${moves.length} items in "${resolvedTarget}" (${dirEntries.length} folders, ${fileEntries.length} files scanned):\n${summaryDetails}`
      : `Scanned ${fileEntries.length} files and ${dirEntries.length} folders in "${resolvedTarget}". All items are already cleanly structured.`;

    const result: OrganizeResult = {
      targetDirectory: resolvedTarget,
      totalFilesScanned: fileEntries.length,
      totalFoldersScanned: dirEntries.length,
      filesMoved: moves.filter((m) => m.type === 'file').length,
      foldersMoved: moves.filter((m) => m.type === 'folder').length,
      categoriesCreated: Array.from(categories),
      manifestPath,
      moves,
      summaryMessage,
    };

    if (!options.dryRun && moves.length > 0) {
      await fs.promises.writeFile(manifestPath, JSON.stringify(result, null, 2), 'utf-8');
    }

    return result;
  }

  /**
   * Categorizes user folder names into logical domain topics.
   */
  private determineFolderCategory(folderName: string): string {
    const fn = folderName.toLowerCase();

    // Coding, Development, AI & Projects
    if (
      fn.includes('project') || fn.includes('ai-') || fn.includes('video') ||
      fn.includes('post') || fn.includes('workflow') || fn.includes('portfolio') ||
      fn.includes('dev') || fn.includes('code') || fn.includes('src') ||
      fn.includes('repo') || fn.includes('bot') || fn.includes('agent') ||
      fn.includes('automation') || fn.includes('robonuggets')
    ) {
      return 'Development_and_Projects';
    }

    // Studies, Exams, Assignments & Courses
    if (
      fn.includes('assignment') || fn.includes('internshala') || fn.includes('exam') ||
      fn.includes('study') || fn.includes('course') || fn.includes('dbms') ||
      fn.includes('college') || fn.includes('school') || fn.includes('lecture') ||
      fn.includes('apk') || fn.includes('learn')
    ) {
      return 'Studies_and_Assignments';
    }

    // Archives & Backups
    if (
      fn.includes('archive') || fn.includes('backup') || fn.includes('7z') ||
      fn.includes('zip') || fn.includes('rar') || fn.includes('tar') ||
      fn.includes('old') || fn.includes('temp')
    ) {
      return 'Archives_and_Backups';
    }

    // Media & Audio / Music
    if (
      fn.includes('music') || fn.includes('audio') || fn.includes('song') ||
      fn.includes('sound') || fn.includes('movie') || fn.includes('photo') ||
      fn.includes('picture') || fn.includes('image')
    ) {
      return 'Media_and_Audio';
    }

    // Documents & Reports
    if (
      fn.includes('doc') || fn.includes('report') || fn.includes('paper') ||
      fn.includes('pdf') || fn.includes('invoice') || fn.includes('bill') ||
      fn.includes('tax') || fn.includes('receipt')
    ) {
      return 'Documents_and_Reports';
    }

    return 'Other_Folders';
  }

  /**
   * Analyzes all files inside a folder, identifies the dominant content/topic theme,
   * and renames the folder to accurately reflect what is inside it.
   */
  public async renameFolderByContent(folderPath: string): Promise<FolderRenameResult> {
    const resolvedFolder = path.resolve(folderPath);
    if (!fs.existsSync(resolvedFolder)) {
      throw new Error(`Target folder does not exist: ${resolvedFolder}`);
    }

    const stat = await fs.promises.stat(resolvedFolder);
    if (!stat.isDirectory()) {
      throw new Error(`Target path is not a directory: ${resolvedFolder}`);
    }

    const entries = await fs.promises.readdir(resolvedFolder, { withFileTypes: true });
    const files = entries.filter((e) => e.isFile() && !e.name.startsWith('.'));

    if (files.length === 0) {
      throw new Error(`Folder is empty or contains no readable files: ${resolvedFolder}`);
    }

    const topicCounts: Record<string, number> = {};
    const entityCounts: Record<string, number> = {};

    for (const f of files) {
      const p = path.join(resolvedFolder, f.name);
      const profile = await this.inspector.inspectFile(p);

      const topic = profile.identifiedTopic || profile.detectedType;
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;

      for (const ent of profile.entities) {
        entityCounts[ent] = (entityCounts[ent] || 0) + 1;
      }
    }

    // Find highest frequency topic
    let bestTopic = 'General_Documents';
    let maxTopicCount = 0;
    for (const [topic, count] of Object.entries(topicCounts)) {
      if (count > maxTopicCount) {
        maxTopicCount = count;
        bestTopic = topic;
      }
    }

    // Find most prominent entity/date if applicable (e.g. "2026", "AWS")
    let prominentEntity = '';
    let maxEntCount = 0;
    for (const [ent, count] of Object.entries(entityCounts)) {
      if (count > maxEntCount && count >= Math.ceil(files.length / 2)) {
        maxEntCount = count;
        prominentEntity = ent.charAt(0).toUpperCase() + ent.slice(1);
      }
    }

    let suggestedName = bestTopic;
    if (prominentEntity && !bestTopic.toLowerCase().includes(prominentEntity.toLowerCase())) {
      suggestedName = `${prominentEntity}_${bestTopic}`;
    }

    // Sanitize folder name
    suggestedName = suggestedName.replace(/[^A-Za-z0-9_-]/g, '_');
    const parentDir = path.dirname(resolvedFolder);
    const originalName = path.basename(resolvedFolder);
    const targetPath = path.join(parentDir, suggestedName);

    if (resolvedFolder !== targetPath) {
      const finalNewPath = this.getUniqueDestination(targetPath);
      await fs.promises.rename(resolvedFolder, finalNewPath);
      return {
        originalPath: resolvedFolder,
        newPath: finalNewPath,
        originalName,
        suggestedName: path.basename(finalNewPath),
        dominantTopic: bestTopic,
        confidence: Math.round((maxTopicCount / files.length) * 100),
        fileCount: files.length,
      };
    }

    return {
      originalPath: resolvedFolder,
      newPath: resolvedFolder,
      originalName,
      suggestedName: originalName,
      dominantTopic: bestTopic,
      confidence: Math.round((maxTopicCount / files.length) * 100),
      fileCount: files.length,
    };
  }

  /**
   * Reverts all file moves from a previously executed organization session using its manifest.
   */
  public async undoOrganize(manifestPath: string): Promise<{ restoredCount: number }> {
    const resolved = path.resolve(manifestPath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Manifest file does not exist: ${resolved}`);
    }

    const data: OrganizeResult = JSON.parse(await fs.promises.readFile(resolved, 'utf-8'));
    let restored = 0;

    for (const move of data.moves) {
      if (fs.existsSync(move.newPath)) {
        const origDir = path.dirname(move.originalPath);
        await fs.promises.mkdir(origDir, { recursive: true });
        await fs.promises.rename(move.newPath, move.originalPath);
        restored++;
      }
    }

    return { restoredCount: restored };
  }

  /**
   * Determines semantic category for a file based on topic detection and content analysis.
   */
  private determineSemanticCategory(profile: DocumentProfile): string {
    if (profile.identifiedTopic) {
      return profile.identifiedTopic;
    }

    const ext = profile.extension.toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].includes(ext)) return 'Images_and_Media';
    if (['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext)) return 'Videos';
    if (['.mp3', '.wav', '.flac', '.aac'].includes(ext)) return 'Audio_Recordings';
    if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(ext)) return 'Archives_and_Backups';
    if (['.csv', '.xlsx', '.xls', '.tsv'].includes(ext)) return 'Spreadsheets_and_Data';
    if (['.pdf', '.docx', '.doc', '.pptx', '.txt', '.md'].includes(ext)) return 'Documents_and_Reports';
    if (['.ts', '.js', '.py', '.json', '.html', '.css', '.sh', '.bat'].includes(ext)) return 'Code_and_Scripts';

    return 'General_Files';
  }

  private getUniqueDestination(targetPath: string): string {
    if (!fs.existsSync(targetPath)) return targetPath;

    const dir = path.dirname(targetPath);
    const ext = path.extname(targetPath);
    const base = path.basename(targetPath, ext);

    let counter = 1;
    let candidate = path.join(dir, `${base}_${counter}${ext}`);
    while (fs.existsSync(candidate)) {
      counter++;
      candidate = path.join(dir, `${base}_${counter}${ext}`);
    }
    return candidate;
  }
}
