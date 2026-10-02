import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { BrowserManager } from '../src/browser/BrowserManager.js';
import { OpenRouterClient } from '../src/llm/OpenRouterClient.js';
import { SecurityPolicy } from '../src/security/SecurityPolicy.js';
import { AgentLoop } from '../src/agent/AgentLoop.js';

describe('HulChul Computer Operator: End-to-End Business Scenarios', () => {
  const fixturePath = path.resolve(process.cwd(), 'tests/fixtures/business-portal.html');
  const erpUrl = `file://${fixturePath.replace(/\\/g, '/')}`;

  it('1. Executes base business workflow & generates verified completion artifacts', async () => {
    const browserManager = new BrowserManager({ headless: true });
    const securityPolicy = new SecurityPolicy({ allowFileProtocol: true, allowedDomains: '*' });
    const openRouterClient = new OpenRouterClient();

    let step = 0;
    openRouterClient.setMockHandler(async (promptText: string) => {
      step++;

      if (step === 1) {
        // Step 1: Fill out the invoice form using browser_fill_form
        return {
          thought: 'I will populate the invoice intake form with CloudScale AWS details.',
          toolName: 'browser_fill_form',
          args: {
            fields: {
              'invoice-id': 'INV-2026-001',
              'vendor-name': 'CloudScale AWS Corp',
              'amount': '420.00',
              'notes': 'Monthly production infrastructure clusters',
            },
          },
        };
      }

      if (step === 2) {
        // Step 2: Click the submit button
        const btnMatch = promptText.match(/button "File & Reconcile Invoice" \[ref=(v\d+:e\d+)/);
        const ref = btnMatch ? btnMatch[1] : 'btn-submit';
        return {
          thought: 'I will click the File & Reconcile Invoice button.',
          toolName: 'browser_click',
          args: { ref, element: 'File & Reconcile Invoice button' },
        };
      }

      // Step 3: Finish task and report verified completion
      return {
        thought: 'Invoice submitted and visible in the audit ledger.',
        toolName: 'browser_done',
        args: {
          summary: 'Successfully filed INV-2026-001 into HulChul ERP.',
          finalAnswer: 'Invoice INV-2026-001 for CloudScale AWS Corp ($420.00) verified in audit ledger.',
        },
      };
    });

    const agent = new AgentLoop(browserManager, openRouterClient, securityPolicy);

    try {
      const result = await agent.run({
        goal: 'File invoice INV-2026-001 into Enterprise Operations portal',
        initialUrl: erpUrl,
        maxSteps: 6,
      });

      expect(result.success).toBe(true);
      expect(result.verification).toBeDefined();
      expect(result.verification?.verified).toBe(true);
      expect(result.verification?.recordsCount).toBeGreaterThanOrEqual(1);

      // Check that verification report artifact was created on disk
      const reportPath = path.resolve(process.cwd(), 'data', 'outputs', 'reconciliation-report.json');
      expect(fs.existsSync(reportPath)).toBe(true);
      const reportJson = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
      expect(reportJson.verified).toBe(true);
      expect(reportJson.records.some((r: any) => r.invoiceId === 'INV-2026-001')).toBe(true);
    } finally {
      await browserManager.close();
    }
  }, 25000);

  it('2. Demonstrates task variation: international contractor expense with tax ID', async () => {
    const browserManager = new BrowserManager({ headless: true });
    const securityPolicy = new SecurityPolicy({ allowFileProtocol: true, allowedDomains: '*' });
    const openRouterClient = new OpenRouterClient();

    let step = 0;
    openRouterClient.setMockHandler(async (promptText: string) => {
      step++;

      if (step === 1) {
        return {
          thought: 'I will populate international contractor invoice with EUR currency and tax ID.',
          toolName: 'browser_fill_form',
          args: {
            fields: {
              'invoice-id': 'INV-2026-INTL-1',
              'vendor-name': 'Berlin AI Research Labs GmbH',
              'amount': '1250.00',
              'tax-id': 'DE-VAT-9921481',
              'notes': 'LLM fine-tuning research dataset',
            },
          },
        };
      }

      if (step === 2) {
        const btnMatch = promptText.match(/button "File & Reconcile Invoice" \[ref=(v\d+:e\d+)/);
        const ref = btnMatch ? btnMatch[1] : 'btn-submit';
        return {
          thought: 'Submitting international invoice with VAT compliance.',
          toolName: 'browser_click',
          args: { ref, element: 'File & Reconcile Invoice button' },
        };
      }

      return {
        thought: 'International invoice verified in ledger.',
        toolName: 'browser_done',
        args: {
          summary: 'Filed international invoice INV-2026-INTL-1 with VAT exemption.',
          finalAnswer: 'INV-2026-INTL-1 confirmed with Tax ID DE-VAT-9921481.',
        },
      };
    });

    const agent = new AgentLoop(browserManager, openRouterClient, securityPolicy);

    try {
      const result = await agent.run({
        goal: 'File international invoice INV-2026-INTL-1 with VAT exemption',
        initialUrl: erpUrl,
        maxSteps: 6,
        onApprovalRequest: async () => true, // Supervisor approves high-value amount
      });

      expect(result.success).toBe(true);
      expect(result.verification?.records.some((r: any) => r.invoiceId === 'INV-2026-INTL-1')).toBe(true);
    } finally {
      await browserManager.close();
    }
  }, 25000);

  it('3. Demonstrates meaningful failure handling & self-healing error recovery', async () => {
    const browserManager = new BrowserManager({ headless: true });
    const securityPolicy = new SecurityPolicy({ allowFileProtocol: true, allowedDomains: '*' });
    const openRouterClient = new OpenRouterClient();

    let step = 0;
    openRouterClient.setMockHandler(async (promptText: string) => {
      step++;

      if (step === 1) {
        // Step 1: Deliberately submit high-value invoice without required Tax ID
        return {
          thought: 'Attempting to file invoice INV-2026-RECOV-01 for $1,850.',
          toolName: 'browser_fill_form',
          args: {
            fields: {
              'invoice-id': 'INV-2026-RECOV-01',
              'vendor-name': 'HighCompute Cloud',
              'amount': '1850.00',
              'tax-id': '', // Intentionally blank!
            },
          },
        };
      }

      if (step === 2) {
        // Step 2: Click submit -> will trigger validation error banner
        const btnMatch = promptText.match(/button "File & Reconcile Invoice" \[ref=(v\d+:e\d+)/);
        const ref = btnMatch ? btnMatch[1] : 'btn-submit';
        return {
          thought: 'Clicking submit to test validation.',
          toolName: 'browser_click',
          args: { ref, element: 'File & Reconcile Invoice button' },
        };
      }

      if (step === 3) {
        // Step 3: Agent detects error in snapshot and recovers by entering fallback Tax ID
        return {
          thought: 'Form error banner detected ("Tax ID is mandatory for expense transactions exceeding $500.00"). Recovering with backup Tax ID US-EIN-88492019.',
          toolName: 'browser_fill_form',
          args: {
            fields: {
              'tax-id': 'US-EIN-88492019',
            },
          },
        };
      }

      if (step === 4) {
        // Step 4: Re-submit after self-healing
        const btnMatch = promptText.match(/button "File & Reconcile Invoice" \[ref=(v\d+:e\d+)/);
        const ref = btnMatch ? btnMatch[1] : 'btn-submit';
        return {
          thought: 'Re-submitting corrected form.',
          toolName: 'browser_click',
          args: { ref, element: 'File & Reconcile Invoice button' },
        };
      }

      return {
        thought: 'Self-healing complete. Record verified in audit ledger.',
        toolName: 'browser_done',
        args: {
          summary: 'Successfully detected tax error, recovered with fallback Tax ID, and filed invoice.',
          finalAnswer: 'INV-2026-RECOV-01 successfully reconciled after automated error recovery.',
        },
      };
    });

    const agent = new AgentLoop(browserManager, openRouterClient, securityPolicy);

    try {
      const result = await agent.run({
        goal: 'Recover from validation error and reconcile invoice INV-2026-RECOV-01',
        initialUrl: erpUrl,
        maxSteps: 8,
        onApprovalRequest: async () => true, // Supervisor authorizes
      });

      expect(result.success).toBe(true);
      expect(result.verification?.records.some((r: any) => r.invoiceId === 'INV-2026-RECOV-01')).toBe(true);
    } finally {
      await browserManager.close();
    }
  }, 25000);

  it('4. Human Control: Pause and Resume functionality', async () => {
    const browserManager = new BrowserManager({ headless: true });
    const securityPolicy = new SecurityPolicy({ allowFileProtocol: true, allowedDomains: '*' });
    const openRouterClient = new OpenRouterClient();

    let step = 0;
    openRouterClient.setMockHandler(async () => {
      step++;
      if (step === 1) {
        return {
          thought: 'First step before pause.',
          toolName: 'browser_wait_for',
          args: { ms: 100 },
        };
      }
      return {
        thought: 'Second step after resume.',
        toolName: 'browser_done',
        args: { summary: 'Resumed and finished.' },
      };
    });

    const agent = new AgentLoop(browserManager, openRouterClient, securityPolicy);

    let pausedTriggered = false;

    try {
      const runPromise = agent.run({
        goal: 'Test pause and resume mechanics',
        initialUrl: erpUrl,
        maxSteps: 5,
        onStep: (s) => {
          if (s.stepNumber === 2) {
            agent.pause();
            pausedTriggered = true;
          }
        },
      });

      // Wait until pause is actively triggered
      const pauseWaitDeadline = Date.now() + 10000;
      while (!agent.getIsPaused() && Date.now() < pauseWaitDeadline) {
        await new Promise((r) => setTimeout(r, 50));
      }

      expect(agent.getIsPaused()).toBe(true);
      expect(pausedTriggered).toBe(true);

      // Resume execution
      agent.resume();
      expect(agent.getIsPaused()).toBe(false);

      const result = await runPromise;
      expect(result.success).toBe(true);
    } finally {
      await browserManager.close();
    }
  }, 20000);

  it('5. Human Control: Approval Gate blocks unauthorized high-risk action', async () => {
    const browserManager = new BrowserManager({ headless: true });
    const securityPolicy = new SecurityPolicy({ allowFileProtocol: true, allowedDomains: '*' });
    const openRouterClient = new OpenRouterClient();

    let approvalRequested = false;
    let step = 0;

    openRouterClient.setMockHandler(async () => {
      step++;
      if (step === 1) {
        // High amount ($1,850) triggers HIGH risk in SecurityPolicy
        return {
          thought: 'Filing high-value expense.',
          toolName: 'browser_fill_form',
          args: {
            fields: {
              'invoice-id': 'INV-HIGH-RISK-1',
              'amount': '1850.00',
            },
          },
        };
      }
      return {
        thought: 'Supervisor denied high-risk action, reporting blocker to user.',
        toolName: 'browser_done',
        args: {
          summary: 'Stopped because supervisor rejected high-risk transaction.',
          finalAnswer: 'Action halted by supervisor policy.',
        },
      };
    });

    const agent = new AgentLoop(browserManager, openRouterClient, securityPolicy);

    try {
      const result = await agent.run({
        goal: 'Process high-value transaction with approval gate',
        initialUrl: erpUrl,
        maxSteps: 5,
        onApprovalRequest: async (req) => {
          approvalRequested = true;
          expect(req.reason).toContain('threshold');
          return false; // Human Supervisor REJECTS
        },
      });

      expect(approvalRequested).toBe(true);
      expect(result.success).toBe(true);
      expect(result.steps.some((s) => s.error && s.error.includes('Human supervisor rejected'))).toBe(true);
    } finally {
      await browserManager.close();
    }
  }, 20000);
});
