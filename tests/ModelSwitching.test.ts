import { describe, it, expect } from 'vitest';
import { OpenRouterClient, isLocalOrDesktopTask } from '../src/llm/OpenRouterClient.js';
import { AgentLoop } from '../src/agent/AgentLoop.js';
import { BrowserManager } from '../src/browser/BrowserManager.js';
import { SecurityPolicy } from '../src/security/SecurityPolicy.js';

describe('Model Switching & Custom Provider Routing', () => {
  it('1. Strips UI bracket tags and preserves custom model IDs when using custom endpoint', () => {
    const client = new OpenRouterClient({
      baseURL: 'http://localhost:8080',
      apiFormat: 'anthropic',
      model: 'gemini-3.8-flash-tiered[1m]',
    });

    expect(client.getModel()).toBe('gemini-3.8-flash-tiered');
    expect(client.getApiFormat()).toBe('anthropic');
    expect(client.getBaseURL()).toBe('http://localhost:8080');
  });

  it('2. Does NOT alias custom proxy models to OpenRouter presets when custom baseURL is set', () => {
    const client = new OpenRouterClient({
      baseURL: 'http://localhost:8080',
      model: 'gemini-3.7-flash-tiered[1m]',
    });

    expect(client.getModel()).toBe('gemini-3.7-flash-tiered');
    expect(client.getModel()).not.toBe('google/gemini-2.5-flash');
  });

  it('3. analyzePrompt does NOT fallback to https://www.google.com when prompt lacks a URL', async () => {
    const client = new OpenRouterClient({
      baseURL: 'http://localhost:8080',
      apiFormat: 'anthropic',
    });

    const analysis = await client.analyzePrompt('what is the system memory usage');
    // Without an explicit URL or search engine query, suggestedUrl MUST NOT be google.com
    expect(analysis.suggestedUrl).not.toBe('https://www.google.com');
  });

  it('4. AgentLoop does NOT blindly navigate to Google when prompt does not request web search', async () => {
    const browserManager = new BrowserManager({ headless: true });
    const client = new OpenRouterClient();
    client.setMockHandler(async () => {
      return {
        toolName: 'browser_done',
        args: { summary: 'Answered without web search' },
        thought: 'No web search required for this query.',
      };
    });

    const security = new SecurityPolicy({ allowedDomains: '*' });
    const loop = new AgentLoop(browserManager, client, security);

    try {
      const result = await loop.run({
        goal: 'Calculate 25 * 40 and report total',
        maxSteps: 2,
        takeScreenshots: false,
      });

      // Assert that browser_navigate to google.com was NOT executed as step 1
      const navSteps = result.steps.filter((s) => s.toolName === 'browser_navigate');
      const googleNav = navSteps.find((s) => s.args.url && s.args.url.includes('google.com'));
      expect(googleNav).toBeUndefined();
      expect(result.success).toBe(true);
    } finally {
      await browserManager.close().catch(() => {});
    }
  });

  it('5. Successfully communicates with local Anthropic proxy on port 8080 if running', async () => {
    let proxyRunning = false;
    try {
      const check = await fetch('http://localhost:8080/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'gemini-3.8-flash-tiered',
          max_tokens: 100,
          messages: [{ role: 'user', content: 'respond with ping' }],
        }),
      });
      proxyRunning = check.ok;
    } catch {
      proxyRunning = false;
    }

    if (!proxyRunning) {
      console.log('Local proxy at :8080 is not currently active, skipping live integration test');
      return;
    }

    const client = new OpenRouterClient({
      baseURL: 'http://localhost:8080',
      apiFormat: 'anthropic',
      model: 'gemini-3.8-flash-tiered[1m]',
    });

    const response = await client.predictNextAction(
      'You are a computer operator. Respond using JSON tool calls.',
      'Open the camera application'
    );

    expect(response).toBeDefined();
    expect(response.toolName).toBeDefined();
    expect(response.toolName).toMatch(/desktop_launch_app|camera/);
  }, 30000);
});
