import type { Page } from 'playwright';
import { SnapshotEngine, type ElementInfo } from './SnapshotEngine.js';
import { SecurityPolicy } from '../security/SecurityPolicy.js';
import { DesktopExecutor } from '../desktop/DesktopExecutor.js';

export interface ExecutionResult {
  ok: boolean;
  action: string;
  output: string;
  error?: string;
  verification?: {
    verified: boolean;
    reason: string;
    urlChanged?: boolean;
    newUrl?: string;
  };
  screenshotPath?: string;
}

export class ActionExecutor {
  private page: Page;
  private snapshotEngine: SnapshotEngine;
  private securityPolicy: SecurityPolicy;
  private desktopExecutor: DesktopExecutor;

  constructor(page: Page, snapshotEngine: SnapshotEngine, securityPolicy: SecurityPolicy) {
    this.page = page;
    this.snapshotEngine = snapshotEngine;
    this.securityPolicy = securityPolicy;
    this.desktopExecutor = new DesktopExecutor();
  }

  /**
   * Dispatches a tool call to the corresponding browser execution logic.
   */
  public async execute(
    toolName: string,
    args: Record<string, any>
  ): Promise<ExecutionResult> {
    // Security check on proposed action
    const risk = this.securityPolicy.assessActionRisk(toolName, args);
    if (risk.risk === 'HIGH' && (toolName === 'browser_run_code_unsafe' || toolName.includes('eval'))) {
      return {
        ok: false,
        action: toolName,
        output: '',
        error: `BLOCKED by SecurityPolicy: ${risk.reason}`,
      };
    }

    const startUrl = this.page.url();

    try {
      switch (toolName) {
        case 'browser_navigate':
          return await this.navigate(args.url);

        case 'browser_click':
          return await this.click(args.ref, args.button, args.clickCount);

        case 'browser_type':
          return await this.type(args.ref, args.text, args.clear, args.pressEnter);

        case 'browser_fill_form':
          return await this.fillForm(args.fields);

        case 'browser_hover':
          return await this.hover(args.ref);

        case 'browser_press_key':
          return await this.pressKey(args.key);

        case 'browser_select_option':
          return await this.selectOption(args.ref, args.value);

        case 'browser_wait_for':
          return await this.waitFor(args.ms, args.text);

        case 'browser_snapshot':
          return await this.forceSnapshot();

        case 'desktop_write_note':
        case 'desktop_launch_app':
        case 'desktop_reveal_file':
        case 'file_read':
        case 'file_list_directory':
        case 'file_organize_directory':
        case 'file_organize_smart':
        case 'file_rename_folder_by_content':
        case 'file_undo_organize':
        case 'file_move':
        case 'file_create_directory':
          return await this.desktopExecutor.execute(toolName, args);

        case 'browser_done':
          return {
            ok: true,
            action: 'browser_done',
            output: `Task completed. Final answer:\n${args.finalAnswer || args.summary || 'Done'}`,
            verification: { verified: true, reason: 'Agent marked task as done.' },
          };

        default:
          return {
            ok: false,
            action: toolName,
            output: '',
            error: `Unknown tool: "${toolName}"`,
          };
      }
    } catch (err: any) {
      return {
        ok: false,
        action: toolName,
        output: '',
        error: err?.message || String(err),
      };
    }
  }

  /**
   * Navigates to a URL safely.
   */
  public async navigate(url: string): Promise<ExecutionResult> {
    const urlCheck = this.securityPolicy.isUrlAllowed(url);
    if (!urlCheck.allowed) {
      return {
        ok: false,
        action: 'browser_navigate',
        output: '',
        error: `Navigation blocked: ${urlCheck.reason}`,
      };
    }

    const previousUrl = this.page.url();
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Fast settle delay for dynamic JS frameworks
    await this.page.waitForTimeout(50);

    const newUrl = this.page.url();
    const title = await this.page.title();

    return {
      ok: true,
      action: 'browser_navigate',
      output: `Navigated to ${newUrl} ("${title}")`,
      verification: {
        verified: true,
        reason: `Successfully loaded ${newUrl}`,
        urlChanged: previousUrl !== newUrl,
        newUrl,
      },
    };
  }

  /**
   * Performs bounding box click on element designated by ref or fallback selector.
   */
  public async click(
    ref: string,
    button: 'left' | 'right' | 'middle' = 'left',
    clickCount: number = 1
  ): Promise<ExecutionResult> {
    let locator;
    let label = ref;

    const isVersionedRef = /^v\d+:e\d+$/i.test(ref);
    const refLookup = this.snapshotEngine.getLocatorForRef(this.page, ref);
    if (!refLookup.isStale && refLookup.locator) {
      locator = refLookup.locator;
      const info = refLookup.elementInfo;
      label = `${info?.role || 'element'} "${info?.name || ref}" [${ref}]`;
    } else if (isVersionedRef) {
      return {
        ok: false,
        action: 'browser_click',
        output: '',
        error: refLookup.error || `Stale element reference "${ref}". Please inspect fresh snapshot.`,
      };
    } else {
      // Fallback selector by ID, name, or button text
      const candidates = [
        this.page.locator(`[data-agent-ref="${ref}"]`),
        this.page.locator(`#${ref}`),
        this.page.locator(`button:has-text("${ref}")`),
        this.page.locator(`[role="button"]:has-text("${ref}")`),
        this.page.locator(`input[type="submit"][value*="${ref}"]`),
      ];

      for (const cand of candidates) {
        const count = await cand.count().catch(() => 0);
        if (count > 0) {
          locator = cand.first();
          label = `element matched by fallback selector "${ref}"`;
          break;
        }
      }
    }

    if (!locator) {
      return {
        ok: false,
        action: 'browser_click',
        output: '',
        error: refLookup.error || `Element reference or selector "${ref}" could not be located in page.`,
      };
    }

    const previousUrl = this.page.url();

    // Scroll element into view if needed
    await locator.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});

    // Compute bounding box coordinates
    let box = await locator.boundingBox().catch(() => null);
    if (!box || box.width === 0 || box.height === 0) {
      // Fallback to locator click directly if bounding box calculation is not possible
      await locator.click({ button, clickCount, timeout: 5000 });
    } else {
      const clickX = box.x + box.width / 2;
      const clickY = box.y + box.height / 2;
      await this.page.mouse.click(clickX, clickY, { button, clickCount });
    }

    // Delay to allow triggered DOM events / navigations to settle
    await this.page.waitForTimeout(250);

    const currentUrl = this.page.url();
    const urlChanged = previousUrl !== currentUrl;

    return {
      ok: true,
      action: 'browser_click',
      output: `Clicked ${label} successfully.`,
      verification: {
        verified: true,
        reason: urlChanged ? `URL changed to ${currentUrl}` : `Click dispatched on ${label}`,
        urlChanged,
        newUrl: currentUrl,
      },
    };
  }

  /**
   * Types text into field designated by ref or fallback selector.
   */
  public async type(
    ref: string,
    text: string,
    clear: boolean = false,
    pressEnter: boolean = false
  ): Promise<ExecutionResult> {
    let locator;
    let label = ref;

    const isVersionedRef = /^v\d+:e\d+$/i.test(ref);
    const refLookup = this.snapshotEngine.getLocatorForRef(this.page, ref);
    if (!refLookup.isStale && refLookup.locator) {
      locator = refLookup.locator;
      const info = refLookup.elementInfo;
      label = `${info?.role || 'input'} "${info?.name || ref}" [${ref}]`;
    } else if (isVersionedRef) {
      return {
        ok: false,
        action: 'browser_type',
        output: '',
        error: refLookup.error || `Stale reference "${ref}".`,
      };
    } else {
      const candidates = [
        this.page.locator(`[data-agent-ref="${ref}"]`),
        this.page.locator(`#${ref}`),
        this.page.locator(`[name="${ref}"]`),
        this.page.locator(`[placeholder*="${ref}" i]`),
      ];
      for (const cand of candidates) {
        const count = await cand.count().catch(() => 0);
        if (count > 0) {
          locator = cand.first();
          label = `input field "${ref}"`;
          break;
        }
      }
    }

    if (!locator) {
      return {
        ok: false,
        action: 'browser_type',
        output: '',
        error: refLookup.error || `Input element "${ref}" could not be located in page.`,
      };
    }

    await locator.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
    await locator.focus().catch(() => {});

    if (clear) {
      await locator.fill('');
    }

    await locator.fill(text);

    if (pressEnter) {
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(100);
    }

    return {
      ok: true,
      action: 'browser_type',
      output: `Typed "${this.securityPolicy.maskSensitive(text)}" into ${label}.`,
      verification: {
        verified: true,
        reason: `Value set in field ${ref}`,
      },
    };
  }

  /**
   * Fills multiple form fields in one batch. Supports array of items or key-value object map.
   */
  public async fillForm(fields: any): Promise<ExecutionResult> {
    let normalizedList: Array<{ ref: string; value: string }> = [];

    if (Array.isArray(fields)) {
      normalizedList = fields.map((item) => ({
        ref: String(item.ref || item.name || item.id || item.selector || ''),
        value: String(item.value ?? ''),
      }));
    } else if (fields && typeof fields === 'object') {
      normalizedList = Object.entries(fields).map(([k, v]) => ({
        ref: String(k),
        value: String(v ?? ''),
      }));
    }

    if (normalizedList.length === 0) {
      return {
        ok: false,
        action: 'browser_fill_form',
        output: '',
        error: 'No valid fields provided in fill_form arguments.',
      };
    }

    const filled: string[] = [];

    for (const item of normalizedList) {
      let locator;

      const isVersionedRef = /^v\d+:e\d+$/i.test(item.ref);
      const refLookup = this.snapshotEngine.getLocatorForRef(this.page, item.ref);
      if (!refLookup.isStale && refLookup.locator) {
        locator = refLookup.locator;
      } else if (isVersionedRef) {
        return {
          ok: false,
          action: 'browser_fill_form',
          output: `Partially filled: ${filled.join(', ')}`,
          error: `Failed on field "${item.ref}": ${refLookup.error || 'Stale ref'}`,
        };
      } else {
        const candidates = [
          this.page.locator(`[data-agent-ref="${item.ref}"]`),
          this.page.locator(`#${item.ref}`),
          this.page.locator(`[name="${item.ref}"]`),
          this.page.locator(`[placeholder*="${item.ref}" i]`),
        ];
        for (const cand of candidates) {
          const count = await cand.count().catch(() => 0);
          if (count > 0) {
            locator = cand.first();
            break;
          }
        }
      }

      if (!locator) {
        return {
          ok: false,
          action: 'browser_fill_form',
          output: `Partially filled: ${filled.join(', ')}`,
          error: `Could not locate input field for "${item.ref}".`,
        };
      }

      await locator.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
      await locator.fill(item.value);
      filled.push(item.ref);
    }

    return {
      ok: true,
      action: 'browser_fill_form',
      output: `Successfully filled ${filled.length} fields: [${filled.join(', ')}]`,
      verification: {
        verified: true,
        reason: `Batch filled ${filled.length} inputs.`,
      },
    };
  }

  /**
   * Hovers mouse over element designated by ref.
   */
  public async hover(ref: string): Promise<ExecutionResult> {
    const refLookup = this.snapshotEngine.getLocatorForRef(this.page, ref);
    if (refLookup.isStale || !refLookup.locator) {
      return {
        ok: false,
        action: 'browser_hover',
        output: '',
        error: refLookup.error || `Stale ref "${ref}".`,
      };
    }

    const box = await refLookup.locator.boundingBox();
    if (box) {
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    } else {
      await refLookup.locator.hover();
    }

    await this.page.waitForTimeout(100);

    return {
      ok: true,
      action: 'browser_hover',
      output: `Hovered over element [${ref}].`,
      verification: { verified: true, reason: 'Mouse position updated.' },
    };
  }

  /**
   * Presses a specific keyboard key.
   */
  public async pressKey(key: string): Promise<ExecutionResult> {
    await this.page.keyboard.press(key);
    await this.page.waitForTimeout(100);

    return {
      ok: true,
      action: 'browser_press_key',
      output: `Pressed key "${key}".`,
      verification: { verified: true, reason: `Keyboard event "${key}" emitted.` },
    };
  }

  /**
   * Selects an option from a dropdown combobox.
   */
  public async selectOption(ref: string, value: string): Promise<ExecutionResult> {
    const refLookup = this.snapshotEngine.getLocatorForRef(this.page, ref);
    if (refLookup.isStale || !refLookup.locator) {
      return {
        ok: false,
        action: 'browser_select_option',
        output: '',
        error: refLookup.error || `Stale ref "${ref}".`,
      };
    }

    await refLookup.locator.selectOption({ label: value }).catch(async () => {
      await refLookup.locator?.selectOption({ value: value });
    });

    return {
      ok: true,
      action: 'browser_select_option',
      output: `Selected "${value}" on [${ref}].`,
      verification: { verified: true, reason: `Option "${value}" selected.` },
    };
  }

  /**
   * Waits for a specified duration or for text to appear.
   */
  public async waitFor(ms: number = 1000, text?: string): Promise<ExecutionResult> {
    if (text) {
      await this.page.getByText(text).first().waitFor({ state: 'visible', timeout: Math.max(ms, 5000) });
      return {
        ok: true,
        action: 'browser_wait_for',
        output: `Waited and found visible text: "${text}".`,
        verification: { verified: true, reason: `Text "${text}" appeared.` },
      };
    }

    const delay = Math.min(Math.max(ms, 100), 10000);
    await this.page.waitForTimeout(delay);

    return {
      ok: true,
      action: 'browser_wait_for',
      output: `Waited for ${delay}ms.`,
      verification: { verified: true, reason: `Timer elapsed (${delay}ms).` },
    };
  }

  /**
   * Explicitly triggers fresh accessibility snapshot.
   */
  public async forceSnapshot(): Promise<ExecutionResult> {
    const snap = await this.snapshotEngine.takeSnapshot(this.page);
    return {
      ok: true,
      action: 'browser_snapshot',
      output: `Captured fresh snapshot v${snap.version} with ${snap.elementCount} interactive elements.`,
      verification: { verified: true, reason: `Snapshot updated to v${snap.version}` },
    };
  }
}
