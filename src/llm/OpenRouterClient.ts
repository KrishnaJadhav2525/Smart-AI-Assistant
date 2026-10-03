import OpenAI from 'openai';
import { ToolSchemas } from './ToolSchemas.js';

export interface OpenRouterConfig {
  apiKey?: string;
  model?: string;
  baseURL?: string;
  temperature?: number;
  maxRetries?: number;
  mockHandler?: (prompt: string, history: string[]) => Promise<{ toolName: string; args: any; thought?: string }>;
}

export function isLocalOrDesktopTask(goal: string): boolean {
  if (!goal) return false;
  const g = goal.toLowerCase();

  // Strip local path segments so folder names (like "browser-agent") do not false-trigger web keywords
  const cleanGoal = g.replace(/[a-z]:[\\/][^\s]+/gi, ' ').replace(/\/[^\s]+/g, ' ');

  const webPatterns = [
    /\bhttps?:\/\//i,
    /\bwww\./i,
    /\b(?:google|wikipedia|hackernews|hacker news)\b/i,
    /\b(?:website|webpage|web page|search the web|online portal)\b/i,
    /\bbrowse\s+(?:to|the|website|internet|online|page)\b/i,
    /\b(?:navigate|open)\s+https?:\/\//i,
  ];

  if (webPatterns.some((pattern) => pattern.test(cleanGoal))) {
    return false;
  }

  const localPatterns = [
    /\b(?:drive\s+[a-z]|[a-z]:\\|[a-z]:\/)\b/i,
    /\b(?:organize|organise|orgnize|cleanup|clean up|sort)\b/i,
    /\b(?:rename|move|copy|delete|list)\b.*(?:folder|folders|file|files|dir|directory)\b/i,
    /\b(?:folder|folders|directory|directories|files?)\b/i,
    /\b(?:desktop|notepad|calculator|calc|explorer)\b/i,
    /\b(?:write note|take note|save note)\b/i,
  ];

  return localPatterns.some((pattern) => pattern.test(g));
}


export interface PromptAnalysisResult {
  understanding: string;
  parameters: Record<string, string>;
  strategy: string[];
  suggestedUrl?: string;
}

export interface NextActionResponse {
  toolName: string;
  args: Record<string, any>;
  thought?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

const MODEL_ALIASES: Record<string, string> = {
  free: 'deepseek/deepseek-v4-flash-0731:free',
  qwen: 'qwen/qwen3.8-27b:free',
  gemma: 'google/gemma-4-26b-a4b-it:free',
  deepseek: 'deepseek/deepseek-v4-flash-0731:free',
  nex: 'nex-agi/nex-n2.5-mini:free',
  'gpt-4o': 'openai/gpt-4o',
  'gpt-4o-mini': 'openai/gpt-4o-mini',
  'gemini-flash': 'google/gemini-2.5-flash',
  'gemini-3.8-flash-tiered[1m]': 'google/gemini-2.5-flash',
  'gemini-3.7-flash-tiered[1m]': 'google/gemini-2.5-flash',
  'gemini-3.1-pro-high[1m]': 'google/gemini-2.5-flash',
  'claude-sonnet-4-6': 'anthropic/claude-sonnet-4',
  claude: 'anthropic/claude-sonnet-4',
  haiku: 'anthropic/claude-3-haiku',
  'claude-3-haiku': 'anthropic/claude-3-haiku',
  'gpt-4-turbo': 'openai/gpt-4-turbo',
  'mistral-large': 'mistralai/mistral-large',
  wizardlm: 'microsoft/wizardlm-2-8x22b',
  'gpt-3.5-turbo': 'openai/gpt-3.5-turbo',
  'anthropic/claude-3.5-sonnet': 'anthropic/claude-sonnet-4',
};

function resolveModelName(name: string): string {
  return MODEL_ALIASES[name] || name;
}

export class OpenRouterClient {
  private client: OpenAI | null = null;
  private model: string;
  private temperature: number;
  private maxRetries: number;
  private fallbackModels: string[];
  private mockHandler?: (prompt: string, history: string[]) => Promise<{ toolName: string; args: any; thought?: string }>;

  constructor(config: OpenRouterConfig = {}) {
    const rawModel = config.model || process.env.OPENROUTER_MODEL || 'deepseek/deepseek-v4-flash-0731:free';
    this.model = resolveModelName(rawModel);
    this.temperature = config.temperature ?? 0.1;
    this.maxRetries = config.maxRetries ?? 3;
    this.mockHandler = config.mockHandler;

    // Resilient fallback chain using FREE models exclusively
    this.fallbackModels = [
      'qwen/qwen3.8-27b:free',
      'google/gemma-4-26b-a4b-it:free',
      'deepseek/deepseek-v4-flash-0731:free',
      'nex-agi/nex-n2.5-mini:free',
      'google/gemma-4-31b-it:free',
      'nvidia/nemotron-3.5-lightning:free',
    ].filter((m) => m !== this.model);

    const apiKey = config.apiKey || process.env.OPENROUTER_API_KEY;
    if (apiKey) {
      this.client = new OpenAI({
        baseURL: config.baseURL || process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
        apiKey,
        defaultHeaders: {
          'HTTP-Referer': 'https://github.com/krishna/browser-agent',
          'X-Title': 'BrowserAgent',
        },
      });
    }
  }

  public hasApiKey(): boolean {
    return !!this.client || !!this.mockHandler;
  }

  public setMockHandler(
    handler: (prompt: string, history: string[]) => Promise<{ toolName: string; args: any; thought?: string }>
  ): void {
    this.mockHandler = handler;
  }

  /**
   * Parses tool call from text if model responded via JSON block instead of native tool_calls.
   */
  private extractToolFromText(text: string): { toolName: string; args: Record<string, any>; thought?: string } | null {
    if (!text || !text.trim()) return null;

    // 1. Try markdown ```json ... ``` block
    const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const candidateStrings = [
      jsonBlockMatch ? jsonBlockMatch[1] : null,
      text,
    ].filter(Boolean) as string[];

    for (const str of candidateStrings) {
      // Find outermost JSON object
      const startIdx = str.indexOf('{');
      const endIdx = str.lastIndexOf('}');
      if (startIdx !== -1 && endIdx > startIdx) {
        const jsonSubstring = str.slice(startIdx, endIdx + 1);
        try {
          const parsed = JSON.parse(jsonSubstring);
          const toolName = parsed.tool || parsed.name || parsed.action;
          if (toolName && typeof toolName === 'string') {
            let args = parsed.arguments || parsed.parameters || parsed.args;
            if (!args || typeof args !== 'object') {
              // Extract top-level properties other than tool/name
              const { tool, name, action, thought, reason, ...rest } = parsed;
              args = rest;
            }
            return {
              toolName,
              args,
              thought: parsed.thought || text.slice(0, startIdx).trim() || undefined,
            };
          }
        } catch {
          // continue to next candidate
        }
      }
    }

    return null;
  }

  /**
   * Sends snapshot and context to OpenRouter and parses the selected tool call.
   */
  public async predictNextAction(
    systemPrompt: string,
    userPrompt: string,
    history: string[] = []
  ): Promise<NextActionResponse> {
    if (this.mockHandler) {
      const mockResult = await this.mockHandler(userPrompt, history);
      return {
        toolName: mockResult.toolName,
        args: mockResult.args,
        thought: mockResult.thought || 'Mock reasoning',
      };
    }

    if (!this.client) {
      throw new Error(
        'OPENROUTER_API_KEY is not configured. Please set the environment variable OPENROUTER_API_KEY or pass --api-key.'
      );
    }

    let attempt = 0;
    let lastError: any = null;
    let tryWithToolsParam = true;

    while (attempt < this.maxRetries) {
      attempt += 1;
      try {
        const payload: any = {
          model: this.model,
          temperature: this.temperature,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        };

        if (tryWithToolsParam) {
          payload.tools = ToolSchemas;
          payload.tool_choice = 'auto';
        }

        const response = await this.client.chat.completions.create(payload);

        const choice = response.choices[0];
        if (!choice) {
          throw new Error('No choice returned by OpenRouter API.');
        }

        const message = choice.message;

        // 1. Native tool calls
        if (message.tool_calls && message.tool_calls.length > 0) {
          const firstCall = message.tool_calls[0];
          let parsedArgs = {};
          try {
            parsedArgs = JSON.parse(firstCall.function.arguments || '{}');
          } catch {
            parsedArgs = { raw: firstCall.function.arguments };
          }

          return {
            toolName: firstCall.function.name,
            args: parsedArgs,
            thought: message.content || undefined,
            usage: {
              promptTokens: response.usage?.prompt_tokens,
              completionTokens: response.usage?.completion_tokens,
              totalTokens: response.usage?.total_tokens,
            },
          };
        }

        // 2. Text-based tool call parsing (for free models that output JSON in content)
        if (message.content) {
          const extracted = this.extractToolFromText(message.content);
          if (extracted) {
            return {
              toolName: extracted.toolName,
              args: extracted.args,
              thought: extracted.thought,
              usage: {
                promptTokens: response.usage?.prompt_tokens,
                completionTokens: response.usage?.completion_tokens,
                totalTokens: response.usage?.total_tokens,
              },
            };
          }

          // Fallback if model answered in text saying it completed or answered
          return {
            toolName: 'browser_done',
            args: {
              summary: 'Completed with text response',
              finalAnswer: message.content,
            },
            thought: message.content,
          };
        }

        throw new Error('Model produced neither tool calls nor text response.');
      } catch (err: any) {
        lastError = err;
        const errorMsg = String(err?.message || '');

        // If provider complains about the tools parameter, switch to text-only mode
        if (tryWithToolsParam && (err?.status === 400 || errorMsg.includes('tools') || errorMsg.includes('tool_choice'))) {
          tryWithToolsParam = false;
          continue;
        }

        // Check if model has 404 No endpoints or provider error
        const isEndpointUnavailable =
          err?.status === 404 ||
          err?.status === 502 ||
          err?.status === 503 ||
          errorMsg.includes('No endpoints found') ||
          errorMsg.includes('not found') ||
          errorMsg.includes('rate limit');

        if (isEndpointUnavailable && this.fallbackModels.length > 0) {
          const nextFreeModel = this.fallbackModels.shift()!;
          console.warn(`\n[Notice] Free model "${this.model}" encountered error (${errorMsg.slice(0, 80)}...). Switching to free fallback "${nextFreeModel}"...`);
          this.model = nextFreeModel;
          attempt = 0;
          tryWithToolsParam = true;
          continue;
        }

        if (err?.status === 401 || err?.status === 403) {
          throw new Error(`OpenRouter Authentication Failed (${err.status}): ${err.message}`);
        }

        if (attempt < this.maxRetries) {
          const backoff = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, backoff));
        }
      }
    }

    throw new Error(`OpenRouter request failed after ${this.maxRetries} attempts: ${lastError?.message || lastError}`);
  }

  
  public async analyzePrompt(goal: string): Promise<PromptAnalysisResult> {
    const isLocal = isLocalOrDesktopTask(goal);
    const urlMatch = goal.match(/(?:https?|file):\/\/[^\s]+/i);
    const urlInGoal = urlMatch ? urlMatch[0].replace(/[),;.]+$/, '') : undefined;
    let extractedPath = 'D:\\';
    const driveMatch = goal.match(/\b(?:drive\s+([a-zA-Z])|([a-zA-Z]):[\\/]?)/i);
    if (driveMatch) {
      const letter = (driveMatch[1] || driveMatch[2]).toUpperCase();
      extractedPath = `${letter}:\\`;
    }

    const defaultResult: PromptAnalysisResult = isLocal
      ? {
          understanding: `Local computer & file operations: ${goal}`,
          parameters: { targetPath: extractedPath, operation: 'file_organize_smart' },
          strategy: [
            `Identify target directory or drive (${extractedPath})`,
            `Inspect existing folders and scan file contents semantically`,
            `Execute content-aware file organization or folder renaming on disk`,
            `Verify disk structure changes and report completed summary`
          ],
          suggestedUrl: undefined
        }
      : {
          understanding: `Task goal: ${goal}`,
          parameters: { prompt: goal, url: urlInGoal || 'https://www.google.com' },
          strategy: [
            `Navigate to ${urlInGoal || 'target web service or search engine'}`,
            `Inspect page accessibility snapshot and interact with elements`,
            `Fill form fields or extract required data`,
            `Submit or conclude task and present final answer`
          ],
          suggestedUrl: urlInGoal || 'https://www.google.com'
        };

    if (!this.client || this.mockHandler) {
      return defaultResult;
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: `You are an AI task planner. Analyze the user's prompt and output JSON.
If the prompt contains a specific URL, set "suggestedUrl" to that exact URL.
If the prompt is for local desktop or filesystem tasks (organizing files, drives like D:, folders, notes, local apps):
- Set "suggestedUrl" to null.
- Formulate a 3-4 step strategy using local filesystem tools (inspecting content, smart categorization, renaming folders).
If the prompt requires web navigation:
- Suggest a relevant web URL and web navigation steps.

Return ONLY valid JSON matching this schema:
{
  "understanding": "...",
  "parameters": {"key": "val"},
  "strategy": ["step 1", "step 2"],
  "suggestedUrl": "https://..." or null
}`
          },
          {
            role: 'user',
            content: `PROMPT: ${goal}`
          }
        ]
      });

      const content = response.choices[0]?.message?.content || '';
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        let suggestedUrl = urlInGoal || parsed.suggestedUrl || defaultResult.suggestedUrl;
        if (isLocal) {
          suggestedUrl = undefined;
        }
        return {
          understanding: parsed.understanding || defaultResult.understanding,
          parameters: parsed.parameters || defaultResult.parameters,
          strategy: Array.isArray(parsed.strategy) && parsed.strategy.length > 0 ? parsed.strategy : defaultResult.strategy,
          suggestedUrl
        };
      }
    } catch {
      // Fallback on error
    }

    return defaultResult;
  }

public getModel(): string {
    return this.model;
  }
}
