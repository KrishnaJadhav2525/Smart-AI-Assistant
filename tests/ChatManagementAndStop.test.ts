import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as http from 'node:http';
import { saveChatSession, getChatSession, deleteChatSession, listChatSessions, type ChatSession } from '../src/ui/chatStorage.js';
import { startDashboardServer } from '../src/ui/server.js';

describe('Chat Management & Stop Task Execution', () => {
  let server: http.Server;
  const testPort = 3199;
  const baseUrl = `http://localhost:${testPort}`;

  beforeAll(async () => {
    server = startDashboardServer({ port: testPort, openBrowser: false });
    await new Promise((resolve) => setTimeout(resolve, 600));
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('1. saveChatSession saves and deleteChatSession cleanly deletes a chat session from disk', () => {
    const testId = 'test-del-chat-' + Date.now();
    const session: ChatSession = {
      id: testId,
      goal: 'organize files on desktop',
      model: 'deepseek/deepseek-v4-flash-0731:free',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'completed',
      steps: [],
    };

    saveChatSession(session);
    const retrieved = getChatSession(testId);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(testId);

    const deleted = deleteChatSession(testId);
    expect(deleted).toBe(true);

    const afterDelete = getChatSession(testId);
    expect(afterDelete).toBeNull();
  });

  it('2. DELETE /api/chats/:id deletes the targeted chat session via HTTP API', async () => {
    const testId = 'http-del-chat-' + Date.now();
    const session: ChatSession = {
      id: testId,
      goal: 'search for bus tickets',
      model: 'deepseek/deepseek-v4-flash-0731:free',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'completed',
      steps: [],
    };
    saveChatSession(session);

    // Call DELETE endpoint
    const res = await fetch(`${baseUrl}/api/chats/${testId}`, {
      method: 'DELETE',
    });
    expect(res.ok).toBe(true);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.deleted).toBe(true);

    // Verify chat no longer exists in storage
    expect(getChatSession(testId)).toBeNull();
  });

  it('3. POST /api/stop halts ongoing execution cleanly and returns ok: true', async () => {
    const stopRes = await fetch(`${baseUrl}/api/stop`, {
      method: 'POST',
    });

    expect(stopRes.ok).toBe(true);
    const data = await stopRes.json();
    expect(data.ok).toBe(true);
    expect(data.message).toContain('halted');
  });
});
