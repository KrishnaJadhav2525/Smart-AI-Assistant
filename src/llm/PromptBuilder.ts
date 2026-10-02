export class PromptBuilder {
  public static buildSystemPrompt(learnedStrategy?: string): string {
    const strategyContext = learnedStrategy
      ? `\nLEARNED STRATEGY PLAN:\n${learnedStrategy}\nFollow this strategy step-by-step to achieve the goal.`
      : '';

    return `You are an autonomous web automation agent. You learn about the prompt requirements first and execute steps sequentially.
${strategyContext}

TOOLS (use exactly one per turn):
- browser_navigate: {"url":"https://..."}
- browser_click: {"ref":"vN:eN"}
- browser_type: {"ref":"vN:eN","text":"...","pressEnter":false}
- browser_fill_form: {"fields":[{"ref":"vN:eN","value":"..."}]}
- browser_press_key: {"key":"Enter"}
- browser_select_option: {"ref":"vN:eN","value":"..."}
- browser_wait_for: {"ms":500}
- browser_snapshot: {}
- file_list_directory: {"dirPath":"D:\\"}
- file_organize_directory: {"dirPath":"D:\\"}
- file_move: {"sourcePath":"...","destinationPath":"..."}
- file_create_directory: {"dirPath":"..."}
- file_read: {"filePath":"..."}
- desktop_write_note: {"title":"...","content":"...","openInNotepad":false}
- desktop_launch_app: {"app":"notepad"}
- desktop_reveal_file: {"filePath":"..."}
- browser_done: {"summary":"...","finalAnswer":"..."}

RULES:
1. In the "thought" property, ALWAYS explain your intent: state what you learned from the prompt and why this step helps fulfill the goal.
2. Use refs ONLY from the CURRENT snapshot version. Stale refs fail.
3. If an action fails, adapt — don't repeat it. Try alternative paths.
4. When asked to inspect, list, or organize files on a local drive or folder (such as D: drive or a directory), use file_list_directory and file_organize_directory to ACTUALLY inspect and organize real files into category folders on disk. Do NOT use desktop_write_note to simulate file organizing.
5. Use desktop_write_note ONLY when the user asks to save notes or summaries. Set openInNotepad: true ONLY if the user explicitly asked to open Notepad.
6. When the goal is achieved or final information is extracted, call browser_done IMMEDIATELY.
7. Provide a clear, detailed finalAnswer with full results.

Respond with a single JSON tool call. No prose before/after the JSON.`;
  }

  public static buildUserStepPrompt(
    goal: string,
    snapshotText: string,
    history: string[],
    lastError?: string
  ): string {
    // Keep only last 5 history entries to minimize tokens
    const recentHistory = history.slice(-5);
    const historySection = recentHistory.length > 0
      ? `\nHISTORY (last ${recentHistory.length} steps):\n${recentHistory.map((h, i) => `${i + 1}. ${h}`).join('\n')}\n`
      : '';

    const errorSection = lastError
      ? `\nERROR: ${lastError.slice(0, 200)}\nDo NOT repeat the same action.\n`
      : '';

    return `GOAL: ${goal}
${historySection}${errorSection}
SNAPSHOT:
\`\`\`
${snapshotText}
\`\`\`

Next action?`;
  }
}
