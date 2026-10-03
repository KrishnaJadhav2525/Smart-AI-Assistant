import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { BrowserManager } from '../src/browser/BrowserManager.js';
import { OpenRouterClient } from '../src/llm/OpenRouterClient.js';
import { SecurityPolicy } from '../src/security/SecurityPolicy.js';
import { AgentLoop } from '../src/agent/AgentLoop.js';

describe('Roadblock Diagnosis & Persistent Browser Management', () => {
  it('1. detectRoadblock identifies Google login roadblocks and returns clear diagnostics', async () => {
    const browserManager = new BrowserManager({ headless: true });
    const client = new OpenRouterClient();
    const loop = new AgentLoop(browserManager, client, new SecurityPolicy());

    const page = await browserManager.getPage();
    try {
      // Simulate page showing a Google Sign-In wall
      await page.setContent(`
        <html>
          <body>
            <h1>Sign in to Google to continue</h1>
            <p>To fill out this form, you must be signed in with your Google Account.</p>
          </body>
        </html>
      `);

      const roadblock = await loop.detectRoadblock(page, 'fill this google form');
      expect(roadblock).not.toBeNull();
      expect(roadblock).toContain('Google account');
      expect(roadblock).toContain('unauthenticated');
      expect(roadblock).toContain('persistent profile');
    } finally {
      await browserManager.close().catch(() => {});
    }
  });

  it('2. AgentLoop marks success: false and reports exact roadblock when target page requires authentication', async () => {
    const fixtureFile = path.resolve(process.cwd(), 'tests', 'fixtures', 'login-roadblock.html');
    await fs.promises.writeFile(fixtureFile, `
      <!DOCTYPE html>
      <html>
        <body>
          <h2>Sign in to continue</h2>
          <p>To fill out this form, you must be signed in with your Google Account.</p>
        </body>
      </html>
    `, 'utf-8');
    const targetUrl = `file://${fixtureFile.replace(/\\/g, '/')}`;

    const browserManager = new BrowserManager({ headless: true });
    const client = new OpenRouterClient();
    client.setMockHandler(async () => {
      return {
        toolName: 'browser_done',
        args: { summary: 'Completed.' },
        thought: 'Done.',
      };
    });

    const security = new SecurityPolicy({ allowFileProtocol: true, allowedDomains: '*' });
    const loop = new AgentLoop(browserManager, client, security);

    try {
      const result = await loop.run({
        goal: 'fill this form',
        initialUrl: targetUrl,
        maxSteps: 3,
        takeScreenshots: false,
      });

      // Should diagnose that it was blocked by sign-in, NOT claim success
      expect(result.success).toBe(false);
      expect(result.finalAnswer).toContain('Task Blocked');
      expect(result.finalAnswer).toContain('Google account');
    } finally {
      await browserManager.close().catch(() => {});
      await fs.promises.rm(fixtureFile, { force: true }).catch(() => {});
    }
  });
});
