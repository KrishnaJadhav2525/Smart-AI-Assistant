# BrowserAgent: Autonomous LLM-Driven Web Automation Studio

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-Chromium-green.svg)](https://playwright.dev/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-API-purple.svg)](https://openrouter.ai/)
[![Tests](https://img.shields.io/badge/Vitest-28%2F28%20Passing-brightgreen.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Author](https://img.shields.io/badge/Author-Krishna-6366f1.svg)]()

An enterprise-grade autonomous web automation agent and interactive web studio built upon the specifications in [deep-research-report.md](./deep-research-report.md). BrowserAgent bridges LLMs (via the **OpenRouter API**) with modern browser automation (**Playwright**) using **Semantic Accessibility Snapshots**, **Bounding-Box Coordinate Interactions**, and **Live Viewport Streaming**.

<p align="center">
  <img src="docs/assets/web-studio-preview.png" alt="BrowserAgent Autonomous Web Studio Dashboard" width="100%" />
</p>

---

## 🌟 Core Architecture & Key Features

### 1. 🖥 Interactive Web Studio Dashboard
Run the agent in a modern visual dashboard (`npm run ui`) featuring:
- **Live Viewport Streaming:** Real-time JPEG canvas updates (~800ms) with address bar synchronization.
- **Split & Focus Views:** Seamlessly toggle between Split View, Browser Focus, and Agent Chat.
- **Accessibility DOM Inspector:** Live inspection of the semantic ARIA tree as the agent navigates.
- **Task History & Quick Chips:** Persistent `localStorage` history for fast re-runs and one-click execution.
- **Live Model Switcher:** Switch between free models and frontier models on the fly.

### 2. 🧠 Prompt Learning & Strategy Formulation
Before executing browser actions, BrowserAgent engages a **Prompt Learning Phase** (`learn_prompt`). It deconstructs your goal into:
- Core understanding & intent extraction
- Extracted parameters & constraints
- Ordered step-by-step navigation strategy plan
- Suggested entrypoint URL

### 3. 🎯 Semantic Accessibility Snapshots
Instead of passing token-heavy, noisy raw HTML or relying on brittle CSS/XPath selectors, the agent extracts a compact **ARIA Accessibility Tree**. Every interactive element is tagged with a unique, version-scoped reference identifier:
```yaml
PAGE TITLE: "Example Store"
SNAPSHOT VERSION: v1
INTERACTIVE ELEMENTS:
  - textbox "Search query" [ref=v1:e1, placeholder="Search products..."]
  - button "Search" [ref=v1:e2]
  - link "Cart (0)" [ref=v1:e3]
```

### 4. 🖱 Bounding-Box Coordinate Clicks & Humanlike Input
To mimic natural human interactions and avoid synthetic JavaScript event detection:
- Clicks map an element's `ref` to its Playwright locator, compute its actual viewport bounding box, and dispatch real mouse clicks at its center:
  $$\text{clickX} = \text{box.x} + \frac{\text{box.width}}{2}, \quad \text{clickY} = \text{box.y} + \frac{\text{box.height}}{2}$$
- Text typing supports automatic clearing, realistic keystroke intervals, and optional Enter key dispatch.

### 5. 🌐 OpenRouter Multi-Model Support
Natively integrates with OpenRouter (`https://openrouter.ai/api/v1`), supporting both free and premium reasoning models:
- **Free Models (Default):**
  - `deepseek/deepseek-v4-flash-0731:free`
  - `qwen/qwen3.8-27b:free`
  - `google/gemma-4-26b-a4b-it:free`
  - `nex-agi/nex-n2.5-mini:free`
- **Frontier Models:**
  - `anthropic/claude-3.5-sonnet`
  - `openai/gpt-4o` / `openai/gpt-4o-mini`
  - `mistralai/mistral-large`

### 6. 🛡 Self-Healing & Stale Reference Recovery
Web pages are dynamic. BrowserAgent incorporates snapshot versioning (e.g. `v1:e5` $\to$ `v2:e5`):
- **Stale Ref Detection:** Catches references targeted from outdated page states, delivers actionable diagnostics, and requests a fresh snapshot.
- **Anti-Repetition Heuristics:** Detects loops or repeated action failures and injects recovery advice (scrolling, waiting, keyboard fallbacks).
- **Post-Action Verification:** Confirms whether clicks triggered URL transitions, modals, or DOM mutations.

### 7. 🔒 Security & Session Layer
- **Domain Whitelisting (`allowedDomains`):** Restricts navigation to authorized domains or wildcard patterns to prevent SSRF.
- **Credential & Secret Masking:** Automatically redacts Authorization Bearer tokens, API keys, and passwords from logs and prompts.
- **Session Persistence:** Supports `--session <id>` to persist and restore authentication states (cookies and localStorage) across tasks.

### 8. 💻 Desktop Application & Research Note Operations
Beyond browser automation, BrowserAgent operates as a full hybrid **Computer Operator**:
- **`desktop_write_note` (Notepad Scratchpad):** Formats research summaries, discrepancy logs, or audit findings into `data/outputs/` and displays notes to the user.
- **`desktop_launch_app`:** Launches authorized desktop utilities (`notepad`, `calc`, `explorer`).
- **`desktop_reveal_file`:** Opens the desktop file manager (Windows File Explorer) with the generated report or output artifact highlighted.
- **`file_read`:** Safely reads local project data files (JSON, CSV, text) within workspace boundaries to cross-reference data against web portals.
- **`file_list_directory`:** Inspects directories and drives (e.g. `D:\`) to discover local files and folder structures.

### 9. 📁 Content-Aware File Organization & Semantic Folder Renaming
Unlike basic file sorters that only check filename extensions, BrowserAgent features a deep semantic inspection and organization engine:
- **`FileInspector` (Deep Content Sampling):** Reads head/tail snippets, parsed PDF text streams, CSV column headers, and entities to uncover real document intent.
- **`file_organize_smart`:** Intelligently groups files by business topic (`AWS_Invoices`, `Tax_and_Compliance`, `Resumes_and_Careers`, `Healthcare_and_Research`) rather than generic `Documents/` or `Images/` folders.
- **`file_rename_folder_by_content`:** Inspects all documents inside a folder, calculates the dominant topic consensus, and renames the folder on disk to match its actual contents.
- **Transactional Undo Reversibility (`file_undo_organize`):** Emits machine-readable manifests (`data/outputs/organizer-manifest-<timestamp>.json`) with one-click full rollback capability.

### 10. 🎙 100% Offline Active Voice Listening Pipeline (`faster-whisper` `small.en`)
Zero cloud audio latency, 100% local privacy:
- **Dynamic VAD:** Real-time Web Audio API energy analysis with adaptive background noise calibration.
- **Zero Consonant Clipping:** Pre-roll circular audio buffer (768ms) captures speech onset before speech threshold trigger.
- **Persistent Python STT Daemon:** Node controller keeps a pre-warmed `faster-whisper` `small.en` worker in memory via stdin/stdout IPC, achieving near-instantaneous transcription without model cold starts.

---

## 🏗 System Architecture Flow

```mermaid
sequenceDiagram
  autonumber
  actor User as User / Web Studio / CLI
  participant Agent as AgentLoop (Orchestrator)
  participant OpenRouter as OpenRouter API (LLM)
  participant Browser as BrowserManager (Playwright)
  participant Snapshot as SnapshotEngine
  participant Exec as ActionExecutor
  participant Security as SecurityPolicy

  User->>Agent: Run Task ("Search bus tickets from Chennai to Vellore")
  Agent->>OpenRouter: Phase 1: Learn Prompt (Strategy + Parameters)
  OpenRouter->>Agent: Strategy Plan & Suggested URL
  Agent->>Security: Validate target URL against domain policy
  Agent->>Browser: Launch / Attach Session & Navigate
  loop Until browser_done or Max Steps
    Agent->>Snapshot: Capture Accessibility Snapshot (vN)
    Snapshot->>Agent: ARIA Tree + Versioned Refs (vN:e1, vN:e2...)
    Agent->>OpenRouter: Prompt with Goal + Snapshot + History + Tools
    OpenRouter->>Agent: Tool Call (e.g. browser_type ref="vN:e1", browser_click ref="vN:e2")
    Agent->>Security: Check action risk & domain permissions
    Agent->>Exec: Execute Tool Call (bounding-box center click / human typing)
    Exec->>Browser: Dispatch realistic Playwright mouse/keyboard events
    Browser-->>Exec: DOM Updates & URL changes
    Exec->>Agent: Post-Action Verification & Result
    alt If Failure or Stale Ref
      Agent->>Agent: Trigger Recovery Strategy (refresh snapshot, scroll, retry)
    end
  end
  Agent-->>User: Final Result & Evidence (Screenshots / Extracted Data)
```

---

## 🏢 HulChul AI Engineering Assignment: Computer Operator Showcase

This repository contains the complete implementation for the **HulChul AI Engineering Internship Build Assignment**.

Detailed documentation:
- 📄 **[ENGINEERING_NOTE.md](./ENGINEERING_NOTE.md)**: Architecture trade-offs, AI tool disclosures, personal engineering ownership, limitations, and future roadmap.
- 🎬 **[DEMO_SCRIPT.md](./DEMO_SCRIPT.md)**: 5-minute video recording guide and timestamped walkthrough.

### 🌟 Business Scenario: Enterprise Invoice & Expense Reconciliation

The computer operator bridges local business data files (`data/samples/`) with the internal **HulChul Operations ERP Portal** (`http://localhost:3000/app`).

| HulChul Requirement | Demonstrated Scenario | How to Run / Inspect |
|---|---|---|
| **1. Base Working Execution** | Reconciles standard domestic invoices from `data/samples/invoices_standard.json` into the ERP form, generating verified confirmation tokens. | Click quick chip **"Domestic Batch (Scenario A)"** in the studio or run test suite. |
| **2. Task Adaptability (Variation)** | Reconciles international contractor expenses with EUR/GBP currencies and foreign VAT tax exemptions without code changes. | Click quick chip **"International VAT (Variation B)"** or run `npm test`. |
| **3. Meaningful Failure Handling** | Submits a high-value invoice (> $500) missing Tax ID, detects the validation error banner, retrieves fallback Tax ID from backup, and completes filing without duplicate actions. | Click quick chip **"Failure Self-Correction (Scenario C)"**. |
| **4. Verified Completion & Evidence** | Operator independently audits `#records-table`, validates confirmation codes, and generates `data/outputs/reconciliation-report.json` with execution trace. | Generated automatically on completion; view in studio **Data** tab. |
| **5. Human Control & Safety** | Interactive **Pause/Resume** button in studio header, plus an automatic **Supervisor Approval Gate** for high-risk actions (transactions $\ge \$1,000$). | Demonstrated interactively in Studio UI and validated in tests. |

---

## 🚀 Quickstart

### 1. Prerequisites
- **Node.js**: v20+ or v24+
- **OpenRouter API Key**: Get one for free at [openrouter.ai](https://openrouter.ai)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/krishna/browser-agent.git
cd browser-agent

# Install dependencies
npm install

# Install Playwright browser binaries (Chromium)
npx playwright install chromium
```

### 3. Configure Environment
Create your `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Edit `.env` and provide your OpenRouter API key:
```ini
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key-here
OPENROUTER_MODEL=deepseek/deepseek-v4-flash-0731:free
ALLOWED_DOMAINS=*
HEADLESS=false
MAX_STEPS=20
SLOW_MO_MS=50
```

---

## 🖥 Launching the Web Studio Dashboard (`npm run ui`)

Launch the visual web dashboard with one simple command:

```bash
npm run ui
# or:
npm run dev
```

Open your browser at:
👉 **`http://localhost:3000`**

<p align="center">
  <img src="docs/assets/web-studio-result.png" alt="BrowserAgent Web Studio Task Results" width="100%" />
</p>

### What You Can Do in the Web Studio:
- 🚀 **Natural Language Task Execution:** Enter any browsing goal with an optional starting URL.
- ⚡ **Quick Action Chips & History:** Preset task shortcuts and persistent `localStorage` history for instant re-runs.
- 🌐 **Live 800ms Viewport Feed:** Real-time visual canvas synchronized with the agent's browser navigation.
- 🧠 **Strategy & Step Inspector:** Review prompt understanding, execution strategy plans, bounding-box click coordinates, and thoughts.
- 🎯 **DOM Accessibility Tree:** Switch to the **DOM** tab to see the compact ARIA tree representation in real time.
- 📊 **Structured Final Answers:** Formatted summaries, source citations, and raw JSON artifacts in the **Data** tab.

---

## 💻 CLI Usage

You can also operate BrowserAgent directly from your terminal.

### Run an Autonomous Task
```bash
# Basic run with automatic strategy formulation
npx tsx bin/agent.ts run "Search for latest AI agent news and summarize top 3 headlines" --url "https://news.ycombinator.com"

# Visible/headed browser window with slow-motion execution
npx tsx bin/agent.ts run "Find the documentation for Playwright locators" --url "https://playwright.dev" --headed --slow-mo 200

# Persistent session storage (cookies/logins preserved)
npx tsx bin/agent.ts run "Check notification inbox" --url "https://github.com" --session my-github-profile

# Restrict agent to specific domain whitelist
npx tsx bin/agent.ts run "Explore articles" --url "https://example.com" --allowed-domains "example.com,*.example.com"

# Capture screenshots at each step
npx tsx bin/agent.ts run "Test checkout flow" --url "https://demo.store.com" --screenshot
```

### Inspect Page Accessibility Snapshot
Inspect the exact ARIA tree representation generated for any website:
```bash
npx tsx bin/agent.ts snapshot https://news.ycombinator.com
```

---

## 🛠 Programmatic SDK Usage

Embed BrowserAgent directly into your TypeScript/Node.js microservices or workflows:

```typescript
import {
  BrowserManager,
  OpenRouterClient,
  SecurityPolicy,
  AgentLoop,
} from './src/index.js';

async function main() {
  const browserManager = new BrowserManager({
    headless: true,
    sessionId: 'session-demo',
  });

  const openRouterClient = new OpenRouterClient({
    apiKey: process.env.OPENROUTER_API_KEY,
    model: 'deepseek/deepseek-v4-flash-0731:free',
  });

  const securityPolicy = new SecurityPolicy({
    allowedDomains: ['wikipedia.org', '*.wikipedia.org'],
  });

  const agent = new AgentLoop(browserManager, openRouterClient, securityPolicy);

  try {
    const result = await agent.run({
      goal: 'Find who created JavaScript and in what year',
      initialUrl: 'https://en.wikipedia.org/wiki/JavaScript',
      maxSteps: 10,
      onStep: (step) => {
        console.log(`[Step ${step.stepNumber}] ${step.toolName}: ${step.output}`);
      },
    });

    console.log('Result:', result.finalAnswer);
    console.log('Total Tokens Used:', result.totalTokens);
  } finally {
    await browserManager.close();
  }
}

main();
```

---

## 🧪 Testing & Validation

BrowserAgent is fully tested with unit and end-to-end integration test suites:
- **`tests/SecurityPolicy.test.ts`**: Tests domain whitelisting, SSRF protections, dangerous tool execution blocks, and credential masking.
- **`tests/SnapshotEngine.test.ts`**: Verifies semantic ARIA tree generation, versioned reference assignment, and element deduplication.
- **`tests/ActionExecutor.test.ts`**: Tests bounding-box coordinate calculations, typing, batch form filling, and DOM verification.
- **`tests/AgentIntegration.test.ts`**: Full autonomous multi-step browser agent loop running against local mock HTML fixtures.

Run all tests:
```bash
npm test
```

Strict TypeScript check:
```bash
npm run typecheck
```

---

## 🐳 Docker Deployment

Run BrowserAgent in a containerized Linux environment with Playwright and Chromium pre-configured:

### 1. Web Studio Dashboard (Recommended)
```bash
# Build the container
docker build -t browser-agent .

# Run the web dashboard container on port 3000
docker run -d -p 3000:3000 \
  -e OPENROUTER_API_KEY="your-api-key" \
  -v $(pwd)/data:/app/data \
  --name browser-agent browser-agent

# Open in browser
open http://localhost:3000
```

### 2. Using Docker Compose
```bash
docker compose up -d
```

### 3. Headless CLI Task Run
```bash
docker run --rm -it \
  -e OPENROUTER_API_KEY="your-api-key" \
  browser-agent agent run "Search AI breakthroughs" --url "https://news.ycombinator.com"
```

---

## 📜 Tool Schema Reference

| Tool Name | Parameters | Description |
|---|---|---|
| `browser_navigate` | `url: string` | Safely navigates to a URL. |
| `browser_click` | `ref: string, button?: string, clickCount?: number` | Clicks element at bounding box center coordinates. |
| `browser_type` | `ref: string, text: string, clear?: boolean, pressEnter?: boolean` | Types text into input field with realistic keystrokes. |
| `browser_fill_form` | `fields: Array<{ ref: string, value: string }>` | Fills multiple form fields in one atomic batch. |
| `browser_hover` | `ref: string` | Hovers mouse over element center coordinates. |
| `browser_press_key` | `key: string` | Presses keyboard key (e.g. `Enter`, `Tab`, `Escape`). |
| `browser_select_option` | `ref: string, value: string` | Selects dropdown combobox option. |
| `browser_wait_for` | `ms?: number, text?: string` | Waits for a time duration or for visible text to appear. |
| `browser_snapshot` | *none* | Forces an immediate fresh accessibility snapshot. |
| `browser_done` | `summary: string, finalAnswer: string, sources?: string[]` | Concludes task with structured final answer. |

---

## 🎨 Design System

BrowserAgent's Web Studio follows the token-driven **ChatGPT Design System** for all studio and web interfaces. See [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) for full token tables, color palette, component density, typography, accessibility rules, and Definition of Done.

---

## 📄 License

MIT License. See [LICENSE](./LICENSE) for details.
"# Smart-AI-Assistant" 
"# Smart-AI-Assistant" 
