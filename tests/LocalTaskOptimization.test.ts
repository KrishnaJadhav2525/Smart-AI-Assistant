import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { isLocalOrDesktopTask, OpenRouterClient } from '../src/llm/OpenRouterClient.js';
import { AgentLoop } from '../src/agent/AgentLoop.js';
import { BrowserManager } from '../src/browser/BrowserManager.js';
import { SecurityPolicy } from '../src/security/SecurityPolicy.js';

describe('Local Task Optimization & Non-Web Execution', () => {
  it('1. Accurately discriminates local filesystem / desktop tasks from web automation tasks', () => {
    // Local / desktop prompts
    expect(isLocalOrDesktopTask('orgnize folderss in the drive d')).toBe(true);
    expect(isLocalOrDesktopTask('organize files in drive d')).toBe(true);
    expect(isLocalOrDesktopTask('please neatly organize folders in D:\\')).toBe(true);
    expect(isLocalOrDesktopTask('rename folders based on content')).toBe(true);
    expect(isLocalOrDesktopTask('open notepad and write note on findings')).toBe(true);
    expect(isLocalOrDesktopTask('list directory files in d')).toBe(true);

    // Web automation prompts
    expect(isLocalOrDesktopTask('search for bus tickets from chennai to vellore')).toBe(false);
    expect(isLocalOrDesktopTask('Search Wikipedia for quantum computing')).toBe(false);
    expect(isLocalOrDesktopTask('go to https://news.ycombinator.com and summarize top story')).toBe(false);
    expect(isLocalOrDesktopTask('search google for AI engineering')).toBe(false);
  });

  it('2. analyzePrompt omits suggestedUrl and generates local filesystem strategy for drive tasks', async () => {
    const client = new OpenRouterClient();
    const analysis = await client.analyzePrompt('orgnize folderss in the drive d');

    // Should NOT suggest google.com
    expect(analysis.suggestedUrl).toBeUndefined();
    expect(analysis.understanding).toContain('Local');
    expect(analysis.parameters.targetPath).toBe('D:\\');
    expect(analysis.strategy.some((s) => s.toLowerCase().includes('google') || s.toLowerCase().includes('search engine'))).toBe(false);
    expect(analysis.strategy.some((s) => s.toLowerCase().includes('disk') || s.toLowerCase().includes('drive') || s.toLowerCase().includes('directory'))).toBe(true);
  });

  it('3. AgentLoop does NOT execute browser_navigate or navigate to Google for local file tasks', async () => {
    const testDir = path.resolve(process.cwd(), 'tests', 'sandbox-local-loop');
    await fs.promises.mkdir(testDir, { recursive: true });
    await fs.promises.writeFile(path.join(testDir, 'sample_invoice.txt'), 'AWS cloud billing invoice receipt March 2026', 'utf-8');

    const browserManager = new BrowserManager({ headless: true });
    const client = new OpenRouterClient();
    client.setMockHandler(async () => {
      return {
        toolName: 'file_organize_smart',
        args: { dirPath: testDir },
        thought: 'Organizing files by content locally.',
      };
    });

    const security = new SecurityPolicy();
    const loop = new AgentLoop(browserManager, client, security);

    try {
      const result = await loop.run({
        goal: `organize files in ${testDir}`,
        maxSteps: 3,
        takeScreenshots: false,
      });

      // Verify that no step navigated to Google
      const navSteps = result.steps.filter((s) => s.toolName === 'browser_navigate');
      expect(navSteps.length).toBe(0);

      // Verify that step 1 was learn_prompt with local strategy
      expect(result.steps[0].toolName).toBe('learn_prompt');
      expect(result.steps[0].output).not.toContain('Navigate to target web service or search engine');

      // Verify that file_organize_smart was executed
      const organizeStep = result.steps.find((s) => s.toolName === 'file_organize_smart');
      expect(organizeStep).toBeDefined();
    } finally {
      await browserManager.close().catch(() => {});
      await fs.promises.rm(testDir, { recursive: true, force: true }).catch(() => {});
    }
  }, 15000);

  it('4. Accurately extracts URL embedded in prompt text and navigates directly to target URL', async () => {
    const fixturePath = path.resolve(process.cwd(), 'tests', 'fixtures', 'test-page.html');
    const targetUrl = `file://${fixturePath.replace(/\\/g, '/').replace(/ /g, '%20')}`;

    const browserManager = new BrowserManager({ headless: true });
    const client = new OpenRouterClient();
    client.setMockHandler(async () => {
      return {
        toolName: 'browser_done',
        args: { summary: 'Arrived at form page' },
        thought: 'Navigated to the target form URL.',
      };
    });

    const security = new SecurityPolicy({ allowFileProtocol: true, allowedDomains: '*' });
    const loop = new AgentLoop(browserManager, client, security);

    try {
      const result = await loop.run({
        goal: `${targetUrl} fill this form`,
        maxSteps: 3,
        takeScreenshots: false,
      });

      // Verify that step 2 navigated directly to targetUrl, NOT google.com
      const navStep = result.steps.find((s) => s.toolName === 'browser_navigate');
      expect(navStep).toBeDefined();
      expect(navStep?.args.url).toBe(targetUrl);
      expect(navStep?.args.url).not.toContain('google.com');
    } finally {
      await browserManager.close().catch(() => {});
    }
  }, 15000);
});
