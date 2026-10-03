# Engineering Note: Hulchul AI Engineering Assignment

**Applicant:** Krishna  
**Role:** AI Engineering Intern — HulChul  
**Submission Date:** October 2026  
**Assignment:** Build a Useful Computer Operator (Autonomous Business Workflow Execution)  
**Availability Commitment:** Confirmed immediate availability for 6-month internship with 30+ focused hours/week.

---

## 1. Executive Summary

This submission delivers **BrowserAgent**, an autonomous computer operator designed to execute end-to-end multi-step business operations across local files and web applications with deterministic verification, fault-tolerant self-healing, and human-in-the-loop oversight.

Rather than a toy browser script or a naive prompt wrapper, the operator features a full production-ready architecture:
1. **Direct Application Execution:** Operates any target web application or enterprise portal using Playwright with real coordinate mouse/keyboard events.
2. **Semantic ARIA Snapshot Engine:** Extracts a version-scoped accessibility tree instead of raw HTML or expensive pixel screenshots, reducing token consumption by ~85% while guaranteeing reliable DOM target resolution.
3. **Multi-Model Fallback Chain:** Seamlessly operates across OpenRouter models, featuring an automated fallback chain for free reasoning models (`deepseek-v4-flash`, `qwen3.8-27b`, `gemma-4-26b`) and support for frontier models (Claude 3.5 Sonnet, GPT-4o, Gemini 2.5 Flash).
4. **Task Adaptability & Variations:** Executes diverse business scenarios (standard domestic invoice batches vs. international multi-currency VAT exemptions) without code modifications.
5. **Meaningful Failure Handling & Recovery:** Detects business compliance validation errors (such as mandatory Tax ID requirements on transactions > $500), retrieves fallback compliance data, and completes the transaction without duplicate actions or state corruption.
6. **Verified Completion & Evidence:** Audits the application's resulting ledger state and outputs machine-readable verification evidence (`data/outputs/reconciliation-report.json`) and audit summaries.
7. **Human Control:** Provides continuous progress monitoring via Server-Sent Events (SSE), a Pause/Resume execution state machine, and a Supervisor Approval Gate that halts high-risk operations for explicit human authorization.
8. **Desktop & Local Application Operations:** Beyond browser tasks, features an integrated `DesktopExecutor` enabling the operator to operate native desktop tools (Notepad, File Explorer), record structured research notes live into Notepad (`desktop_write_note`), and safely ingest local business files (`file_read`).
9. **100% Offline Speech Recognition Pipeline:** Active Voice Listening triggered via microphone tap in the Web Studio, utilizing local `faster-whisper` (`small.en`) with client-side Web Audio dynamic VAD, 768ms FIFO pre-roll buffering, and persistent Python daemon IPC.
10. **Content-Aware File Organization & Semantic Folder Renaming:** Operates deep head/tail content inspections across documents, PDF text streams, and CSV tables via `FileInspector`, clusters files into domain topics (`AWS_Invoices`, `Tax_and_Compliance`, `Resumes_and_Careers`), renames folders based on content consensus, and logs transactional rollback manifests (`organizer-manifest-*.json`).
11. **Roadblock & Authentication Diagnosis Engine:** Identifies when tasks are blocked by sign-in walls, login gates (e.g. Google Account login required on Google Forms), permission boundaries, or anti-bot CAPTCHAs, reporting explicit root-cause diagnoses rather than false successes.
12. **Real Signed-In Browser Integration (Persistent Profiles & CDP):** Integrates Playwright persistent contexts (`USE_REAL_CHROME=true`) to retain authenticated Google accounts permanently across sessions, and supports direct connection to active open Chrome browsers via Chrome DevTools Protocol (`CHROME_CDP_URL=http://localhost:9222`).

---

## 2. Technical Choices & Architectural Rationale

### 2.1 DOM Perception: ARIA Accessibility Snapshot vs. Raw HTML vs. Vision-Only Models
- **Why Not Raw HTML:** Dumping raw HTML into LLM context windows introduces 30,000–80,000 tokens of noisy styles, script tags, SVG paths, and hidden elements. It is expensive, slow, and frequently causes context overflow or hallucinated selectors.
- **Why Not Vision-Only (Pure Pixels):** Visual computer-use models (e.g. standard screen coordinate clicking) suffer from high inference latency (3–8s per step), resolution scaling misalignments, and coordinate drift across different display DPIs and zoom levels.
- **Our Approach (ARIA Accessibility Tree + Center-Point Dispatches):**
  - We extract the browser's semantic accessibility tree (`role`, accessible `name`, `value`, `states`), assigning short version-scoped references (`v1:e1`, `v1:e2`).
  - When the operator decides to click or type, `ActionExecutor` locates the referenced element, computes its real viewport bounding box, and dispatches native mouse events to the exact center coordinates (`x + width/2`, `y + height/2`).
  - Version-scoped IDs (`v1` vs `v2`) ensure that any page navigation or DOM rerender immediately flags stale elements, preventing the agent from interacting with outdated UI states.

### 2.2 Model Orchestration & Resilient Fallback Chaining
- Real-world production operators must not fail when a single model provider hits rate limits or experiences downtime.
- `OpenRouterClient` implements an automated fallback chain across free models:
  `deepseek/deepseek-v4-flash-0731:free` → `qwen/qwen3.8-27b:free` → `google/gemma-4-26b-a4b-it:free` → `nex-agi/nex-n2.5-mini:free`.
- If an endpoint returns a `429`, `502`, or `503`, the client logs diagnostic telemetry, switches to the next verified free model, and retries the step seamlessly.

### 2.3 Two-Phase Execution Loop
1. **Phase 1: Prompt Learning & Strategy Formulation:** Before touching the browser, the operator analyzes the user's high-level goal, extracts structured business parameters (invoice IDs, vendor names, amounts, URLs), and generates an explicit step-by-step strategy plan.
2. **Phase 2: Action-Observation Cycle:** The operator takes an accessibility snapshot, predicts the next atomic action, validates security policies, dispatches native browser events, captures screenshot frames, and repeats until verified completion.

---

## 3. HulChul Assignment Rubric Alignment

| Rubric Requirement | Implementation Evidence in Codebase |
|---|---|
| **1. Meaningful Business Workflow** | **Automated Invoice & Expense Reconciliation**: The operator ingests local files (`data/samples/invoices_standard.json`) and interacts directly with web intake applications, populating intake forms, validating categories, and submitting records into the ledger. |
| **2. Task Adaptability (Variation)** | **International Contractor Processing**: Handled by the same operator via prompt instructions without modifying code (`data/samples/invoices_international.json`). Accurately switches currencies (EUR, GBP), applies international contractor categories, and fills foreign VAT identifiers. |
| **3. Meaningful Failure Handling & Recovery** | **Compliance Error Detection & Self-Correction**: When an invoice exceeding $500 is submitted without a mandatory Tax ID, the ERP triggers a compliance error toast. The operator detects the error from the snapshot, fetches fallback tax compliance data from `invoices_with_error.json`, populates the field, and retries successfully without duplicating actions. |
| **4. Verified Completion & Evidence** | **Independent DOM Audit & Artifact Generation**: Upon calling `browser_done`, `AgentLoop.verifyAndGenerateArtifacts()` directly queries the application's `#records-table`, validates confirmation codes (e.g. `CONF-HUL-9281X`), and writes `data/outputs/reconciliation-report.json` and Markdown summaries with full execution traces. |
| **5. Human Control & Safety** | **Pause/Resume & High-Risk Approval Gate**: The UI and `AgentLoop` provide interactive Pause/Resume controls. `SecurityPolicy.assessActionRisk()` automatically flags high-risk actions (transactions $\ge \$1,000$ or destructive actions), halts execution, and requires supervisor authorization via UI modal or API. |

---

## 4. Disclosure of AI Tools & External Libraries

In accordance with Hulchul's submission guidelines, all tools and libraries used in this project are disclosed below:

### Libraries Used
- **Playwright (`playwright`):** Browser automation driver for Chromium (headless and headed execution, event dispatching, viewport streaming).
- **OpenAI Node SDK (`openai`):** Structured HTTP client used to interact with OpenRouter endpoints.
- **Tailwind CSS & Google Fonts:** Studio web dashboard styling.
- **Commander.js & Chalk:** Command-line interface and terminal formatting.
- **Vitest:** Automated integration and unit testing framework (17 passing tests).

### AI Coding Tools Disclosed
- **AI Coding Assistant (Claude 3.8 / Gemini):** Used during development for brainstorming edge cases, scaffolding TypeScript interfaces, refining Tailwind CSS layouts, and drafting initial test assertions.
- **Personal Contribution & Ownership:**
  - Architecture and design of the ARIA accessibility snapshot engine with versioned reference tracking.
  - End-to-end architecture and implementation of the business operator validation engine, action dispatchers, and test fixture suites.
  - Implementation of the Pause/Resume Promise-gate state machine and Supervisor Approval Gate.
  - Implementation of DOM state verification and output report artifact generation.
  - Formulating the 5 automated integration test suites ensuring 100% test pass rate.

---

## 5. Known Limitations & Edge Cases

1. **Complex Canvas & WebGL Elements:** Applications built with pure HTML5 Canvas (such as Google Earth, Figma canvas, or custom charting engines) do not expose semantic ARIA nodes. For such targets, visual coordinate models or hybrid pixel-clicking fallbacks would be required.
2. **Cross-Origin Iframes:** Modern browsers sandbox cross-origin iframes with strict same-origin policies. While Playwright can access nested frames via `page.frames()`, elements inside restricted third-party payment widgets (e.g. Stripe Elements) require explicit frame locators.
3. **Session Re-Authentication:** If an external enterprise session expires mid-operation, the operator currently relies on the user to re-authenticate or uses saved session cookies in `.sessions/`.

---

## 6. Future Production Roadmap

If selected for the AI Engineering Internship at HulChul, I would extend this architecture for enterprise production scale:
1. **OS-Level Desktop Operator:** Extend beyond the browser by integrating native accessibility APIs (`UIAutomation` on Windows, `AXUIElement` on macOS) to automate desktop enterprise tools (Excel, SAP GUI, Slack, terminal).
2. **Multi-Tenant Enterprise RBAC & Vault Integration:** Integrate HashiCorp Vault or AWS Secrets Manager to inject credentials directly into form fields without exposing secrets in logs, prompts, or snapshots.
3. **Predictive Verification & Visual Regression Diffs:** Compare pre- and post-action visual perceptual hashes to catch subtle visual UI errors that do not throw explicit exceptions.
4. **WhatsApp/Slack Conversational Trigger (Raj Agent Integration):** Connect the operator to Hulchul's WhatsApp-first career agent ("Raj") to allow users to trigger automations (e.g. submitting job applications or updating profiles) directly via chat messages.
