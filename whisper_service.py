"""
Persistent Python Whisper Daemon using faster-whisper (small.en) with CTranslate2 INT8 quantization.
Communicates via standard I/O (stdin/stdout) with JSON-Lines.
"""

import sys
import os
import json
import time

TECH_VOCAB_PROMPT = (
    "Software engineering, Python, React, TypeScript, Node.js, Docker, "
    "Kubernetes, PostgreSQL, SQL, APIs, database, invoices, files, browser, "
    "search, organize, local drive, summarize, audit, reconciliation"
)

def eprint(*args, **kwargs):
    sys.stderr.write(" ".join(str(a) for a in args) + "\n")
    sys.stderr.flush()

def main():
    model_name = os.environ.get("WHISPER_MODEL", "small.en")
    device = os.environ.get("WHISPER_DEVICE", "cpu")
    compute_type = os.environ.get("WHISPER_COMPUTE_TYPE", "int8")

    eprint(f"[Whisper Daemon] Initializing {model_name} on {device} ({compute_type})...")

    try:
        from faster_whisper import WhisperModel
        t0 = time.time()
        model = WhisperModel(model_name, device=device, compute_type=compute_type)
        eprint(f"[Whisper Daemon] Model loaded successfully in {time.time() - t0:.2f}s")
        sys.stdout.write(json.dumps({"type": "ready", "model": model_name}) + "\n")
        sys.stdout.flush()
    except Exception as e:
        eprint(f"[Whisper Daemon] Failed to load model: {e}")
        sys.stdout.write(json.dumps({"type": "error", "error": str(e)}) + "\n")
        sys.stdout.flush()
        sys.exit(1)

    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break

            line = line.strip()
            if not line:
                continue

            req = json.loads(line)
            req_id = req.get("id", "default")
            action = req.get("action", "transcribe")

            if action == "ping":
                sys.stdout.write(json.dumps({"type": "pong", "id": req_id}) + "\n")
                sys.stdout.flush()
                continue

            if action == "transcribe":
                audio_path = req.get("audio_path")
                if not audio_path or not os.path.exists(audio_path):
                    sys.stdout.write(json.dumps({
                        "type": "transcribe_result",
                        "id": req_id,
                        "success": False,
                        "error": f"Audio file not found: {audio_path}"
                    }) + "\n")
                    sys.stdout.flush()
                    continue

                t_start = time.time()
                segments, info = model.transcribe(
                    audio_path,
                    language="en",
                    task="transcribe",
                    temperature=0.0,
                    beam_size=5,
                    condition_on_previous_text=False,
                    vad_filter=True,
                    initial_prompt=TECH_VOCAB_PROMPT,
                    repetition_penalty=1.2,
                    no_repeat_ngram_size=3,
                    compression_ratio_threshold=2.4,
                    no_speech_threshold=0.6,
                )

                text_parts = [segment.text for segment in segments]
                text = " ".join(text_parts).strip()
                latency_ms = int((time.time() - t_start) * 1000)

                sys.stdout.write(json.dumps({
                    "type": "transcribe_result",
                    "id": req_id,
                    "success": True,
                    "text": text,
                    "language": info.language,
                    "duration": getattr(info, "duration", 0),
                    "latency_ms": latency_ms
                }) + "\n")
                sys.stdout.flush()

        except Exception as e:
            eprint(f"[Whisper Daemon] Error processing request: {e}")
            try:
                sys.stdout.write(json.dumps({
                    "type": "transcribe_result",
                    "id": req.get("id", "err"),
                    "success": False,
                    "error": str(e)
                }) + "\n")
                sys.stdout.flush()
            except Exception:
                pass

if __name__ == "__main__":
    main()
