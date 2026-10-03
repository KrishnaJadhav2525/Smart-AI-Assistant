import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { DesktopExecutor } from '../src/desktop/DesktopExecutor.js';
import { BrowserManager } from '../src/browser/BrowserManager.js';
import { OpenRouterClient } from '../src/llm/OpenRouterClient.js';
import { SecurityPolicy } from '../src/security/SecurityPolicy.js';
import { AgentLoop } from '../src/agent/AgentLoop.js';

describe('DesktopOperator & Hybrid Computer Operations', () => {
  const fixturePath = path.resolve(process.cwd(), 'tests/fixtures/test-page.html');
  const fixtureUrl = `file://${fixturePath.replace(/\\/g, '/')}`;

  it('1. Atomically writes formatted research notes to disk and verifies content', async () => {
    const desktop = new DesktopExecutor();
    const title = 'LLM Architecture Findings';
    const content = '1. Transformer attention layers scale quadratically.\n2. ARIA snapshots preserve 85% token budget.\n3. Verified execution completes successfully.';

    const result = await desktop.writeNote(title, content, false); // false to avoid popping notepad during automated headless test

    expect(result.ok).toBe(true);
    expect(result.action).toBe('desktop_write_note');
    expect(result.verification?.verified).toBe(true);

    const latestNotePath = path.resolve(process.cwd(), 'data', 'outputs', 'latest-research-note.txt');
    expect(fs.existsSync(latestNotePath)).toBe(true);

    const fileContent = fs.readFileSync(latestNotePath, 'utf-8');
    expect(fileContent).toContain('Title:     LLM Architecture Findings');
    expect(fileContent).toContain('ARIA snapshots preserve 85% token budget');
    expect(fileContent).toContain('Smart AI Assistant: Task & Research Notes');
  });

  it('2. Safely reads local workspace data files and blocks traversal & secrets', async () => {
    const desktop = new DesktopExecutor();

    // Read valid sample data file
    const validResult = await desktop.readFile('data/samples/invoices_standard.json');
    expect(validResult.ok).toBe(true);
    expect(validResult.output).toContain('CloudScale AWS Corp');

    // Attempt path traversal outside workspace
    const traversalResult = await desktop.readFile('../../windows/system32/cmd.exe');
    expect(traversalResult.ok).toBe(false);
    expect(traversalResult.error).toContain('traverses outside');

    // Attempt reading sensitive .env file
    const envResult = await desktop.readFile('.env');
    expect(envResult.ok).toBe(false);
    expect(envResult.error).toContain('Access Denied');
  });

  it('3. Enforces authorized desktop application whitelist', async () => {
    const desktop = new DesktopExecutor();

    // Whitelisted apps
    const allowed = await desktop.launchApp('notepad');
    expect(allowed.ok).toBe(true);
    expect(allowed.output).toContain('Launched desktop application "notepad"');

    // Block non-whitelisted dangerous binaries
    const blocked = await desktop.launchApp('format.com');
    expect(blocked.ok).toBe(false);
    expect(blocked.error).toContain('whitelist');
  });

  it('4. SecurityPolicy correctly evaluates desktop tool risk levels', () => {
    const policy = new SecurityPolicy();

    // Safe note writing and standard app launch
    const safeNote = policy.assessActionRisk('desktop_write_note', { title: 'Test', content: 'Info' });
    expect(safeNote.risk).toBe('LOW');

    const safeApp = policy.assessActionRisk('desktop_launch_app', { app: 'notepad' });
    expect(safeApp.risk).toBe('LOW');

    // Dangerous app requires supervisor confirmation
    const dangerApp = policy.assessActionRisk('desktop_launch_app', { app: 'powershell_malware.exe' });
    expect(dangerApp.risk).toBe('HIGH');
    expect(dangerApp.requiresConfirmation).toBe(true);

    // Reading sensitive credential file requires confirmation
    const sensitiveFile = policy.assessActionRisk('file_read', { filePath: '.env.local' });
    expect(sensitiveFile.risk).toBe('HIGH');
    expect(sensitiveFile.requiresConfirmation).toBe(true);
  });

  it('5. Agent autonomously executes hybrid flow: reads local file, takes research note, and operates web page', async () => {
    const browserManager = new BrowserManager({ headless: true });
    const securityPolicy = new SecurityPolicy({ allowFileProtocol: true, allowedDomains: '*' });
    const openRouterClient = new OpenRouterClient();

    let step = 0;
    openRouterClient.setMockHandler(async (promptText: string) => {
      step++;

      if (step === 1) {
        // Step 1: Read local data file
        return {
          thought: 'I will first read the local invoice data to understand the vendor.',
          toolName: 'file_read',
          args: { filePath: 'data/samples/invoices_standard.json' },
        };
      }

      if (step === 2) {
        // Step 2: Write research note into desktop notepad
        return {
          thought: 'I will record my research summary notes into Notepad.',
          toolName: 'desktop_write_note',
          args: {
            title: 'Vendor Analysis Summary',
            content: 'Identified CloudScale AWS as high-priority infrastructure vendor. Preparing web search.',
            openInNotepad: false,
          },
        };
      }

      if (step === 3) {
        // Step 3: Type search query into browser
        const inputMatch = promptText.match(/textbox[\s\S]*?\[ref=(v\d+:e\d+)/);
        const ref = inputMatch ? inputMatch[1] : 'v1:e2';
        return {
          thought: 'Searching on the web for CloudScale AWS.',
          toolName: 'browser_type',
          args: { ref, text: 'CloudScale AWS' },
        };
      }

      // Step 4: Complete task
      return {
        thought: 'Hybrid desktop and web operation completed.',
        toolName: 'browser_done',
        args: {
          summary: 'Successfully read local data, generated research note in desktop scratchpad, and performed web search.',
          finalAnswer: 'Hybrid workflow complete: Vendor analyzed, research note saved, search dispatched.',
        },
      };
    });

    const agent = new AgentLoop(browserManager, openRouterClient, securityPolicy);

    try {
      const result = await agent.run({
        goal: 'Read vendor data, create research note in Notepad, and search on web',
        initialUrl: fixtureUrl,
        maxSteps: 6,
      });

      expect(result.success).toBe(true);
      expect(result.steps.length).toBe(6); // 1 learn_prompt + 1 navigate + 4 agent steps
      expect(result.steps.some((s) => s.toolName === 'file_read' && s.ok)).toBe(true);
      expect(result.steps.some((s) => s.toolName === 'desktop_write_note' && s.ok)).toBe(true);
      expect(result.steps.some((s) => s.toolName === 'browser_type' && s.ok)).toBe(true);
    } finally {
      await browserManager.close();
    }
  }, 25000);

  it('6. Lists directory contents and safely organizes files by category into folders', async () => {
    const desktop = new DesktopExecutor();
    const testDir = path.resolve(process.cwd(), 'data', 'test_organize_sandbox');

    // Setup temporary test sandbox directory with sample files
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDir, { recursive: true });

    fs.writeFileSync(path.join(testDir, 'invoice_report.pdf'), 'Dummy PDF invoice');
    fs.writeFileSync(path.join(testDir, 'screenshot.png'), 'Dummy PNG photo');
    fs.writeFileSync(path.join(testDir, 'dataset.csv'), 'id,name\n1,test');
    fs.writeFileSync(path.join(testDir, 'backup.zip'), 'Dummy ZIP archive');

    // 1. List directory
    const listRes = await desktop.listDirectory(testDir);
    expect(listRes.ok).toBe(true);
    expect(listRes.output).toContain('invoice_report.pdf');
    expect(listRes.output).toContain('screenshot.png');

    // 2. Organize directory
    const orgRes = await desktop.organizeDirectory(testDir);
    expect(orgRes.ok).toBe(true);
    expect(orgRes.output).toContain('Documents');
    expect(orgRes.output).toContain('Images');

    // Verify files were moved into categorized folders
    expect(fs.existsSync(path.join(testDir, 'Documents', 'invoice_report.pdf'))).toBe(true);
    expect(fs.existsSync(path.join(testDir, 'Documents', 'dataset.csv'))).toBe(true);
    expect(fs.existsSync(path.join(testDir, 'Images', 'screenshot.png'))).toBe(true);
    expect(fs.existsSync(path.join(testDir, 'Archives', 'backup.zip'))).toBe(true);

    // Clean up sandbox
    fs.rmSync(testDir, { recursive: true, force: true });
  });
});
