import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { FileInspector } from '../src/desktop/organizer/FileInspector.js';
import { SmartOrganizer } from '../src/desktop/organizer/SmartOrganizer.js';
import { DesktopExecutor } from '../src/desktop/DesktopExecutor.js';

describe('Smart Content-Aware File Organizer & Folder Renamer', () => {
  const testSandboxDir = path.resolve(process.cwd(), 'tests', 'sandbox-organizer');

  beforeEach(async () => {
    if (fs.existsSync(testSandboxDir)) {
      await fs.promises.rm(testSandboxDir, { recursive: true, force: true });
    }
    await fs.promises.mkdir(testSandboxDir, { recursive: true });
  });

  afterEach(async () => {
    if (fs.existsSync(testSandboxDir)) {
      await fs.promises.rm(testSandboxDir, { recursive: true, force: true });
    }
  });

  it('1. FileInspector inspects document content and accurately detects semantic topics & entities', async () => {
    const inspector = new FileInspector();

    // Create sample test files
    const invoiceFile = path.join(testSandboxDir, 'bill_march.txt');
    await fs.promises.writeFile(
      invoiceFile,
      'Amazon Web Services (AWS) Monthly Cloud Invoice\nAccount ID: 9482-1102\nTotal Billing: $4,250.00\nDate: March 2026',
      'utf-8'
    );

    const taxFile = path.join(testSandboxDir, 'tax_form.txt');
    await fs.promises.writeFile(
      taxFile,
      'IRS Form 1099-MISC & W2 Tax Compliance Statement\nFederal Employer Identification EIN: 82-938210\nTax Year: 2026',
      'utf-8'
    );

    const resumeFile = path.join(testSandboxDir, 'candidate_cv.md');
    await fs.promises.writeFile(
      resumeFile,
      '# Senior AI Engineer Resume\n\nExperience:\n- Deep learning researcher\nEducation:\n- MS in Computer Science\nSkills: PyTorch, LLMs, TypeScript',
      'utf-8'
    );

    const medicalFile = path.join(testSandboxDir, 'clinical_trial.txt');
    await fs.promises.writeFile(
      medicalFile,
      'CuraLink Phase II Clinical Research Study\nPatient Cohort: 450 subjects\nEfficacy and health evaluation metrics reported.',
      'utf-8'
    );

    const profileInvoice = await inspector.inspectFile(invoiceFile);
    expect(profileInvoice.identifiedTopic).toBe('AWS_Invoices');
    expect(profileInvoice.entities).toContain('2026');

    const profileTax = await inspector.inspectFile(taxFile);
    expect(profileTax.identifiedTopic).toBe('Tax_and_Compliance');

    const profileResume = await inspector.inspectFile(resumeFile);
    expect(profileResume.identifiedTopic).toBe('Resumes_and_Careers');

    const profileMedical = await inspector.inspectFile(medicalFile);
    expect(profileMedical.identifiedTopic).toBe('Healthcare_and_Research');
  });

  it('2. SmartOrganizer semantically clusters files by content rather than simple file extension', async () => {
    const organizer = new SmartOrganizer();

    // Create 4 files with different content
    const f1 = path.join(testSandboxDir, 'doc1.txt');
    await fs.promises.writeFile(f1, 'AWS monthly hosting invoice receipt and cloud bill #10293', 'utf-8');

    const f2 = path.join(testSandboxDir, 'doc2.txt');
    await fs.promises.writeFile(f2, 'W2 tax compliance form and quarterly IRS deduction summary', 'utf-8');

    const f3 = path.join(testSandboxDir, 'doc3.txt');
    await fs.promises.writeFile(f3, 'Applicant resume curriculum vitae: 8 years fullstack experience', 'utf-8');

    const f4 = path.join(testSandboxDir, 'sample_image.png');
    await fs.promises.writeFile(f4, 'fake-png-binary-data', 'utf-8');

    const result = await organizer.organizeDirectoryByContent(testSandboxDir);

    expect(result.filesMoved).toBe(4);
    expect(result.categoriesCreated).toContain('AWS_Invoices');
    expect(result.categoriesCreated).toContain('Tax_and_Compliance');
    expect(result.categoriesCreated).toContain('Resumes_and_Careers');
    expect(result.categoriesCreated).toContain('Images_and_Media');

    // Verify files actually moved to these specific semantic folders
    expect(fs.existsSync(path.join(testSandboxDir, 'AWS_Invoices', 'doc1.txt'))).toBe(true);
    expect(fs.existsSync(path.join(testSandboxDir, 'Tax_and_Compliance', 'doc2.txt'))).toBe(true);
    expect(fs.existsSync(path.join(testSandboxDir, 'Resumes_and_Careers', 'doc3.txt'))).toBe(true);
    expect(fs.existsSync(path.join(testSandboxDir, 'Images_and_Media', 'sample_image.png'))).toBe(true);

    // Verify transactional undo manifest was created
    expect(fs.existsSync(result.manifestPath)).toBe(true);
  });

  it('3. SmartOrganizer renames a folder based on dominant file content consensus', async () => {
    const organizer = new SmartOrganizer();
    const folderToRename = path.join(testSandboxDir, 'misc_dump_folder');
    await fs.promises.mkdir(folderToRename, { recursive: true });

    // Populate with 3 AWS invoice files
    await fs.promises.writeFile(path.join(folderToRename, 'bill1.txt'), 'AWS Cloud invoice statement January 2026', 'utf-8');
    await fs.promises.writeFile(path.join(folderToRename, 'bill2.txt'), 'AWS Cloud invoice statement February 2026', 'utf-8');
    await fs.promises.writeFile(path.join(folderToRename, 'bill3.txt'), 'Amazon Web Services billing receipt March 2026', 'utf-8');

    const renameResult = await organizer.renameFolderByContent(folderToRename);

    expect(renameResult.dominantTopic).toBe('AWS_Invoices');
    expect(renameResult.confidence).toBe(100);
    expect(renameResult.fileCount).toBe(3);
    expect(fs.existsSync(renameResult.newPath)).toBe(true);
    expect(fs.existsSync(folderToRename)).toBe(false); // Old folder was moved/renamed
    expect(renameResult.suggestedName).toContain('AWS_Invoices');
  });

  it('4. SmartOrganizer undo reversibility restores files back to their original locations', async () => {
    const organizer = new SmartOrganizer();

    const origFile = path.join(testSandboxDir, 'important_contract.txt');
    await fs.promises.writeFile(origFile, 'Confidential non-disclosure agreement and legal contract terms', 'utf-8');

    const organizeRes = await organizer.organizeDirectoryByContent(testSandboxDir);
    expect(organizeRes.filesMoved).toBe(1);
    expect(fs.existsSync(origFile)).toBe(false);

    // Now execute rollback using manifest
    const undoRes = await organizer.undoOrganize(organizeRes.manifestPath);
    expect(undoRes.restoredCount).toBe(1);
    expect(fs.existsSync(origFile)).toBe(true); // Restored!
  });

  it('5. DesktopExecutor seamlessly routes file_organize_smart, file_rename_folder_by_content, and file_undo_organize', async () => {
    const executor = new DesktopExecutor();

    const sampleFile = path.join(testSandboxDir, 'w2_doc.txt');
    await fs.promises.writeFile(sampleFile, 'Official IRS Tax return and 1099 compliance statement', 'utf-8');

    // Test file_organize_smart via executor
    const organizeExec = await executor.execute('file_organize_smart', {
      dirPath: testSandboxDir,
    });
    expect(organizeExec.ok).toBe(true);
    expect(organizeExec.action).toBe('file_organize_smart');
    expect(organizeExec.output).toContain('Tax_and_Compliance');

    // Extract manifest path from output
    const manifestMatch = organizeExec.output.match(/Transactional Undo Manifest saved to: (.*)/);
    expect(manifestMatch).not.toBeNull();
    const manifestPath = manifestMatch![1].trim();

    // Test file_undo_organize via executor
    const undoExec = await executor.execute('file_undo_organize', {
      manifestPath,
    });
    expect(undoExec.ok).toBe(true);
    expect(undoExec.action).toBe('file_undo_organize');
    expect(undoExec.output).toContain('Successfully rolled back organization session');
    expect(fs.existsSync(sampleFile)).toBe(true);

    // Test file_rename_folder_by_content via executor
    const tempDir = path.join(testSandboxDir, 'unnamed_files');
    await fs.promises.mkdir(tempDir, { recursive: true });
    await fs.promises.writeFile(path.join(tempDir, 'resume_mary.txt'), 'Candidate resume: software engineering professional', 'utf-8');

    const renameExec = await executor.execute('file_rename_folder_by_content', {
      folderPath: tempDir,
    });
    expect(renameExec.ok).toBe(true);
    expect(renameExec.action).toBe('file_rename_folder_by_content');
    expect(renameExec.output).toContain('Resumes_and_Careers');
  });
});
