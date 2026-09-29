#!/usr/bin/env python3
"""
CodeGraph Live Visualizer Server & Data Exporter.
Usage:
  python serve-viz.py          # export data + run live server at http://localhost:9742
  python serve-viz.py --export # only export codegraph-data.json
"""
import http.server
import json
import os
import sqlite3
import sys
import webbrowser

DB_PATH = os.path.join(os.path.dirname(__file__), ".codegraph", "codegraph.db")
JSON_PATH = os.path.join(os.path.dirname(__file__), "codegraph-data.json")
HTML_PATH = os.path.join(os.path.dirname(__file__), "codegraph-viz.html")
PORT = 9742

def export_data():
    if not os.path.exists(DB_PATH):
        return {"files_count": 0, "nodes": [], "edges": [], "db_size": "0 MB"}

    db_size = f"{os.path.getsize(DB_PATH) / (1024*1024):.2f} MB"
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    cur = con.cursor()

    try:
        files = cur.execute("SELECT path, language, size, node_count FROM files").fetchall()
        nodes = cur.execute("SELECT id, kind, name, qualified_name, file_path, language, start_line, end_line, signature, docstring FROM nodes").fetchall()
        edges = cur.execute("SELECT source, target, kind FROM edges").fetchall()
    except Exception as e:
        print(f"Error reading DB: {e}")
        files, nodes, edges = [], [], []

    data = {
        "files_count": len(files),
        "db_size": db_size,
        "nodes": [dict(n) for n in nodes],
        "edges": [dict(e) for e in edges]
    }
    con.close()

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    return data

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path in ("/", "/index.html"):
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            with open(HTML_PATH, "rb") as f:
                self.wfile.write(f.read())
        elif self.path == "/api/graph":
            data = export_data()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(data).encode("utf-8"))
        else:
            super().do_GET()

def main():
    export_data()
    print(f"Exported {JSON_PATH}")

    if "--export" in sys.argv:
        return

    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = http.server.HTTPServer(("127.0.0.1", PORT), Handler)
    url = f"http://127.0.0.1:{PORT}"
    print(f"CodeGraph Visualizer running at: {url}")
    try:
        webbrowser.open(url)
    except Exception:
        pass
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")

if __name__ == "__main__":
    main()
