import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface BrowserOptions {
  headless?: boolean;
  slowMo?: number;
  sessionId?: string;
  viewport?: { width: number; height: number };
  sessionDir?: string;
  screenshotDir?: string;
  userAgent?: string;
  useSystemChrome?: boolean;
  userDataDir?: string;
  cdpUrl?: string;
}

export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private options: BrowserOptions;
  private sessionDir: string;
  private screenshotDir: string;

  constructor(options: BrowserOptions = {}) {
    this.options = {
      headless: options.headless !== undefined ? options.headless : (process.env.HEADLESS === 'false' ? false : true),
      slowMo: options.slowMo !== undefined ? options.slowMo : (process.env.SLOW_MO_MS ? parseInt(process.env.SLOW_MO_MS, 10) : 0),
      sessionId: options.sessionId,
      viewport: options.viewport ?? { width: 1280, height: 800 },
      userAgent:
        options.userAgent ??
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      useSystemChrome: options.useSystemChrome ?? (process.env.USE_REAL_CHROME === 'true'),
      userDataDir: options.userDataDir || process.env.CHROME_USER_DATA_DIR,
      cdpUrl: options.cdpUrl || process.env.CHROME_CDP_URL,
    };

    this.sessionDir = options.sessionDir ?? path.resolve(process.cwd(), '.sessions');
    this.screenshotDir = options.screenshotDir ?? path.resolve(process.cwd(), 'screenshots');

    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  /**
   * Initializes or reuses a browser instance and page.
   */
  public async getPage(): Promise<Page> {
    if (this.page && !this.page.isClosed()) {
      return this.page;
    }

    // 1. Connect to an already-open real Chrome browser via CDP (Remote Debugging)
    const cdpEndpoint = this.options.cdpUrl || process.env.CHROME_CDP_URL;
    if (cdpEndpoint) {
      try {
        this.browser = await chromium.connectOverCDP(cdpEndpoint);
        const contexts = this.browser.contexts();
        this.context = contexts.length > 0 ? contexts[0] : await this.browser.newContext({ viewport: this.options.viewport });
        const pages = this.context.pages();
        this.page = pages.length > 0 ? pages[0] : await this.context.newPage();
        this.page.setDefaultTimeout(30000);
        this.page.setDefaultNavigationTimeout(45000);
        return this.page;
      } catch (err: any) {
        console.warn(`[BrowserManager] Failed to connect to CDP at ${cdpEndpoint}: ${err?.message}. Falling back to standard browser.`);
      }
    }

    // 2. Persistent Profile (real signed-in Google Chrome or persistent profile context)
    const shouldUsePersistent =
      this.options.userDataDir ||
      this.options.useSystemChrome ||
      process.env.USE_REAL_CHROME === 'true' ||
      process.env.USE_PERSISTENT_PROFILE === 'true';

    if (shouldUsePersistent) {
      const defaultProfileDir = path.resolve(this.sessionDir, 'chrome-profile');
      const profileDir = this.options.userDataDir || process.env.CHROME_USER_DATA_DIR || defaultProfileDir;

      if (!fs.existsSync(profileDir)) {
        fs.mkdirSync(profileDir, { recursive: true });
      }

      const persistentOptions: any = {
        headless: this.options.headless,
        slowMo: this.options.slowMo,
        viewport: this.options.viewport,
        userAgent: this.options.userAgent,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled',
        ],
      };

      if (this.options.useSystemChrome || process.env.USE_REAL_CHROME === 'true') {
        persistentOptions.channel = 'chrome';
      }

      this.context = await chromium.launchPersistentContext(profileDir, persistentOptions);
      const pages = this.context.pages();
      this.page = pages.length > 0 ? pages[0] : await this.context.newPage();
      this.page.setDefaultTimeout(30000);
      this.page.setDefaultNavigationTimeout(45000);
      return this.page;
    }

    // 3. Standard clean Chromium launch
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: this.options.headless,
        slowMo: this.options.slowMo,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled',
        ],
      });
    }

    const sessionFile = this.options.sessionId
      ? path.join(this.sessionDir, `${this.options.sessionId}.json`)
      : null;

    const storageState = sessionFile && fs.existsSync(sessionFile) ? sessionFile : undefined;

    this.context = await this.browser.newContext({
      viewport: this.options.viewport,
      userAgent: this.options.userAgent,
      storageState,
      locale: 'en-US',
      timezoneId: 'America/New_York',
    });

    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(30000);
    this.page.setDefaultNavigationTimeout(45000);

    return this.page;
  }

  /**
   * Persists the session storage state (cookies, localStorage) if sessionId is configured.
   */
  public async saveSession(): Promise<string | null> {
    if (!this.context || !this.options.sessionId) return null;

    const sessionFile = path.join(this.sessionDir, `${this.options.sessionId}.json`);
    await this.context.storageState({ path: sessionFile });
    return sessionFile;
  }

  /**
   * Captures a full PNG screenshot of the current page.
   */
  public async captureScreenshot(prefix: string = 'screenshot'): Promise<string> {
    const page = await this.getPage();
    const filename = `${prefix}-${Date.now()}.png`;
    const filePath = path.join(this.screenshotDir, filename);
    await page.screenshot({ path: filePath, fullPage: false });
    return filePath;
  }

  /**
   * Captures a compressed JPEG frame (faster, smaller) for live streaming.
   */
  public async captureFrameJpeg(prefix: string = 'frame'): Promise<string | null> {
    if (!this.page || this.page.isClosed()) return null;
    try {
      const filename = `${prefix}-${Date.now()}.jpg`;
      const filePath = path.join(this.screenshotDir, filename);
      await this.page.screenshot({ path: filePath, fullPage: false, type: 'jpeg', quality: 55 });
      return filePath;
    } catch {
      return null;
    }
  }

  /**
   * Closes browser, contexts, and persists session.
   */
  public async close(): Promise<void> {
    try {
      if (this.options.sessionId) {
        await this.saveSession();
      }
    } catch {
      // Ignore save error on teardown
    }

    if (this.page && !this.page.isClosed()) {
      await this.page.close().catch(() => {});
      this.page = null;
    }

    if (this.context) {
      await this.context.close().catch(() => {});
      this.context = null;
    }

    if (this.browser) {
      await this.browser.close().catch(() => {});
      this.browser = null;
    }
  }

  public getSessionId(): string | undefined {
    return this.options.sessionId;
  }

  public isHeadless(): boolean {
    return !!this.options.headless;
  }
}
