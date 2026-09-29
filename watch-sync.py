#!/usr/bin/env python3
"""
CodeGraph Auto-Watcher & Live Sync.
Monitors project files for changes and automatically runs:
  1. codegraph sync
  2. python serve-viz.py --export
"""
import os
import subprocess
import time
import sys

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
IGNORE_DIRS = {".git", ".codegraph", "node_modules", ".venv", "__pycache__", "dist", "build"}
IGNORE_EXTS = {".db", ".db-wal", ".db-shm", ".json", ".log"}

def get_file_mtimes():
    mtimes = {}
    for root, dirs, files in os.walk(PROJECT_DIR):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith(".")]
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in IGNORE_EXTS or f.startswith("."):
                continue
            path = os.path.join(root, f)
            try:
                mtimes[path] = os.path.getmtime(path)
            except OSError:
                pass
    return mtimes

def sync():
    print(f"[{time.strftime('%H:%M:%S')}] Changes detected! Running codegraph sync...")
    try:
        subprocess.run(["codegraph", "sync"], cwd=PROJECT_DIR, check=False)
        subprocess.run([sys.executable, "serve-viz.py", "--export"], cwd=PROJECT_DIR, check=False)
        print(f"[{time.strftime('%H:%M:%S')}] Sync complete & visualizer data updated.")
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] Sync error: {e}")

def main():
    print(f"CodeGraph Auto-Watcher active for: {PROJECT_DIR}")
    print("Watching for code changes... (Press Ctrl+C to stop)")
    last_state = get_file_mtimes()

    while True:
        try:
            time.sleep(1.5)
            current_state = get_file_mtimes()
            if current_state != last_state:
                last_state = current_state
                sync()
        except KeyboardInterrupt:
            print("\nWatcher stopped.")
            break

if __name__ == "__main__":
    main()
