import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';

export interface TranscribeResult {
  text: string;
  latencyMs: number;
  duration?: number;
}

export class WhisperService {
  private static instance: WhisperService | null = null;
  private pythonProcess: ChildProcess | null = null;
  private isModelReady: boolean = false;
  private pendingRequests: Map<string, {
    resolve: (res: TranscribeResult) => void;
    reject: (err: Error) => void;
    timer: NodeJS.Timeout;
  }> = new Map();
  private stdoutBuffer: string = '';

  public static getInstance(): WhisperService {
    if (!WhisperService.instance) {
      WhisperService.instance = new WhisperService();
    }
    return WhisperService.instance;
  }

  private constructor() {
    this.startDaemon();
  }

  private findPythonExecutable(): string {
    const candidatePaths = [
      process.env.PYTHON_PATH,
      path.resolve(process.cwd(), '.venv', 'Scripts', 'python.exe'),
      path.resolve(process.cwd(), '.venv', 'bin', 'python'),
      'C:\\Users\\Administrator\\Desktop\\Ai assistant\\.venv\\Scripts\\python.exe',
      'python',
      'python3',
    ].filter(Boolean) as string[];

    for (const p of candidatePaths) {
      if (p === 'python' || p === 'python3') {
        return p;
      }
      if (fs.existsSync(p)) {
        return p;
      }
    }

    return 'python';
  }

  private startDaemon(): void {
    const pythonExe = this.findPythonExecutable();
    const scriptPath = path.resolve(process.cwd(), 'whisper_service.py');

    if (!fs.existsSync(scriptPath)) {
      console.warn(`[WhisperService] whisper_service.py script not found at ${scriptPath}`);
      return;
    }

    try {
      this.pythonProcess = spawn(pythonExe, [scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1',
          WHISPER_MODEL: 'small.en',
          WHISPER_DEVICE: 'cpu',
          WHISPER_COMPUTE_TYPE: 'int8',
        },
      });

      this.pythonProcess.stdout?.on('data', (chunk: Buffer) => {
        this.stdoutBuffer += chunk.toString();
        const lines = this.stdoutBuffer.split('\n');
        this.stdoutBuffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const msg = JSON.parse(trimmed);
            this.handleDaemonMessage(msg);
          } catch {
            // Ignore non-json debug lines
          }
        }
      });

      this.pythonProcess.stderr?.on('data', (data: Buffer) => {
        const text = data.toString().trim();
        if (text) {
          console.log(`[Whisper Daemon] ${text}`);
        }
      });

      this.pythonProcess.on('exit', (code) => {
        console.warn(`[WhisperService] Python daemon exited with code ${code}`);
        this.isModelReady = false;
        this.pythonProcess = null;
      });

      this.pythonProcess.on('error', (err) => {
        console.error(`[WhisperService] Process error: ${err.message}`);
        this.isModelReady = false;
      });
    } catch (err: any) {
      console.error(`[WhisperService] Failed to start daemon: ${err.message}`);
    }
  }

  private handleDaemonMessage(msg: any): void {
    if (msg.type === 'ready') {
      this.isModelReady = true;
      console.log(`[WhisperService] Offline Speech Engine Ready (${msg.model})`);
      return;
    }

    if (msg.type === 'transcribe_result') {
      const pending = this.pendingRequests.get(msg.id);
      if (pending) {
        clearTimeout(pending.timer);
        this.pendingRequests.delete(msg.id);
        if (msg.success) {
          pending.resolve({
            text: msg.text || '',
            latencyMs: msg.latency_ms || 0,
            duration: msg.duration,
          });
        } else {
          pending.reject(new Error(msg.error || 'Transcription failed'));
        }
      }
    }
  }

  public isReady(): boolean {
    return this.isModelReady && !!this.pythonProcess;
  }

  /**
   * Transcribes in-memory WAV audio buffer using offline faster-whisper (small.en).
   */
  public async transcribeAudio(audioBuffer: Buffer): Promise<TranscribeResult> {
    if (!this.pythonProcess) {
      this.startDaemon();
    }

    const reqId = `req_${Date.now()}_${randomUUID().slice(0, 6)}`;
    const tempWavPath = path.join(os.tmpdir(), `agent_audio_${reqId}.wav`);

    await fs.promises.writeFile(tempWavPath, audioBuffer);

    return new Promise<TranscribeResult>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(reqId);
        fs.promises.unlink(tempWavPath).catch(() => {});
        reject(new Error('Whisper transcription timed out after 30 seconds'));
      }, 30000);

      this.pendingRequests.set(reqId, {
        resolve: (res) => {
          fs.promises.unlink(tempWavPath).catch(() => {});
          resolve(res);
        },
        reject: (err) => {
          fs.promises.unlink(tempWavPath).catch(() => {});
          reject(err);
        },
        timer,
      });

      const payload = JSON.stringify({
        action: 'transcribe',
        id: reqId,
        audio_path: tempWavPath,
      }) + '\n';

      this.pythonProcess?.stdin?.write(payload);
    });
  }

  public stop(): void {
    if (this.pythonProcess) {
      this.pythonProcess.kill();
      this.pythonProcess = null;
      this.isModelReady = false;
    }
  }
}
