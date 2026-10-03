# 5-Minute Demo Video Guide: HulChul Computer Operator

This document provides a concise, time-stamped script for recording the 5-minute submission video required by Hulchul.

---

## ⏱️ Video Breakdown (Total Time: ~4:30 – 5:00)

| Timestamp | Segment Title | Core Actions to Showcase |
|---|---|---|
| **0:00 – 0:45** | **Architecture & Setup** | Quick terminal overview, running `npm start`, and introducing the dual studio UI (Browser Canvas + Chat Feed). |
| **0:45 – 1:50** | **Scenario A: Base Workflow** | Ingesting domestic vendor invoices from `data/samples/invoices_standard.json` into the target enterprise intake form, watching live bounding-box clicks, and viewing ledger verification. |
| **1:50 – 2:50** | **Scenario B: Task Variation** | Running the international contractor batch (`data/samples/invoices_international.json`) with multi-currency (EUR, GBP) and foreign VAT tax exemptions without code changes. |
| **2:50 – 3:50** | **Scenario C: Failure Recovery** | Submitting a high-value invoice without a Tax ID, showing the application validation error toast, watching the operator detect the error in snapshot, retrieve the fallback Tax ID, and complete the filing. |
| **3:50 – 4:40** | **Human Control: Approval & Pause** | Demonstrating the Pause/Resume button and the Supervisor Approval Gate for transactions $\ge \$1,000$. |
| **4:40 – 5:00** | **Verified Evidence & Conclusion** | Inspecting `data/outputs/reconciliation-report.json`, summary of technical choices, and closing. |

---

## 🎙️ Step-by-Step Recording Script

### Part 1: Introduction & Architecture (0:00 – 0:45)
- **Visual:** Terminal showing `npm test` (all 17 tests green) and starting the server with `npm start`.
- **Spoken:**
  > "Hello Hulchul team! I'm Krishna, applying for the AI Engineering Internship. Today I'm presenting **BrowserAgent**, an autonomous computer operator built to complete real-world multi-step enterprise workflows.
  > Instead of raw HTML dumps or expensive vision models, BrowserAgent uses an ARIA accessibility snapshot engine with version-scoped reference IDs and native bounding-box center coordinates, reducing token overhead by 85% while guaranteeing reliable execution. Let's look at the web studio."
- **Action:** Open browser at `http://localhost:3000`. Show the split studio view: live browser stream on the right, agent conversation feed on the left.

---

### Part 2: Base Business Workflow Execution (0:45 – 1:50)
- **Visual:** In the BrowserAgent studio, enter the task:
  `Reconcile domestic invoices from data/samples/invoices_standard.json into the enterprise portal` (providing start URL of the portal)
- **Spoken:**
  > "For our primary business workflow, the operator takes local vendor invoice data from `data/samples/invoices_standard.json` and files it into the enterprise intake portal.
  > Notice Phase 1: the agent first analyzes the prompt, formulates an execution strategy, and learns the key parameters before touching the browser.
  > Now in Phase 2, watch the live feed: it navigates to the form, fills the fields, and submits the transaction. The confirmation code is generated, and the record lands directly in the audit ledger."
- **Action:** Point out the confirmation code (e.g. `CONF-HUL-4819A`) and the verified row in the table.

---

### Part 3: Task Variation — International Contractors (1:50 – 2:50)
- **Visual:** Enter the task:
  `Reconcile international invoices with currency and VAT tax handling from data/samples/invoices_international.json`
- **Spoken:**
  > "To demonstrate adaptability without code modifications, we present Scenario B: international contractor expenses from `invoices_international.json`.
  > Here the operator dynamically adapts to different currencies—EUR and GBP—selects consulting categories, and applies German and British VAT identification numbers."
- **Action:** Watch the operator switch currency dropdown to EUR, fill the VAT ID, submit, and show the updated ledger counter.

---

### Part 4: Meaningful Failure Handling & Self-Correction (2:50 – 3:50)
- **Visual:** Enter the task:
  `Process invoice from data/samples/invoices_with_error.json, detect $500 Tax ID validation error, retrieve tax ID from backup and complete submission`
- **Spoken:**
  > "Now for the critical failure recovery test. The target application enforces a strict compliance rule: any transaction over $500 must include a valid Tax ID.
  > We deliberately feed an invoice without a Tax ID. The application rejects it with an error banner: '⚠️ Compliance Validation Failed: Tax ID is mandatory for expense transactions exceeding $500.00'.
  > Notice how the operator inspects the error banner from the snapshot, reads the fallback Tax ID from the backup record, updates only the missing field, and retries successfully without duplicating actions or corrupting state."
- **Action:** Show the error banner appearing, followed by the operator entering the Tax ID and completing the filing.

---

### Part 5: Human Control & Verified Evidence Artifacts (3:50 – 5:00)
- **Visual:** Show Pause / Resume and Supervisor Approval Gate.
- **Spoken:**
  > "Human safety is paramount. First, the operator includes an interactive Pause and Resume button right in the studio header, allowing the supervisor to inspect intermediate browser states at any moment.
  > Second, we implemented a Supervisor Approval Gate. For high-risk actions—such as transactions exceeding $1,000—the operator halts execution and triggers a confirmation modal requiring explicit approval before proceeding.
  > Finally, upon completion, the operator performs an independent DOM audit and writes a structured artifact to `data/outputs/reconciliation-report.json` with proof of every record and confirmation code.
  > With 17 automated integration tests passing and full compatibility with free OpenRouter models or Gemini Flash, this system is reliable, auditable, and ready for production ownership. Thank you!"
- **Action:** Open `data/outputs/reconciliation-report.json` in VS Code / text editor to show the verified records and execution trace.

---

## 🚀 Quick Setup Commands for Demo Recording

```bash
# 1. Install dependencies
npm install

# 2. Run all 17 automated tests
npm test

# 3. Start the studio server
npm start
# -> Opens http://localhost:3000 (Studio Dashboard)
# -> Opens http://localhost:3000/app (HulChul ERP Sandbox)
```
