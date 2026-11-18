"""A local webhook receiver for the demo.

Run it next to the API, point endpoints at it, and watch how Relay behaves when
a receiver is healthy, briefly broken, or permanently down.

    python scripts/demo_receiver.py

Routes:
    POST /ok      always 200
    POST /flaky   500 for the first two calls, then 200
    POST /fail    always 500
    POST /slow    sleeps 12s, which is longer than the default 10s timeout
"""

from __future__ import annotations

import json
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = 9100
CALLS: dict[str, int] = {}


class Handler(BaseHTTPRequestHandler):
    server_version = "RelayDemoReceiver/1.0"

    def do_POST(self) -> None:  # noqa: N802 (stdlib naming)
        path = self.path.split("?", 1)[0]
        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length)
        CALLS[path] = CALLS.get(path, 0) + 1
        attempt = CALLS[path]

        try:
            payload = json.loads(body or b"{}")
        except json.JSONDecodeError:
            payload = {}

        received = {
            "path": path,
            "attempt": attempt,
            "event": self.headers.get("X-Relay-Event"),
            "delivery": self.headers.get("X-Relay-Delivery"),
            "signature": self.headers.get("X-Relay-Signature"),
            "payload": payload,
        }

        if path == "/ok":
            self._send(200, {"received": True, **received})
        elif path == "/flaky":
            if attempt <= 2:
                self._send(500, {"error": "temporary failure", **received})
            else:
                self._send(200, {"recovered": True, **received})
        elif path == "/fail":
            self._send(500, {"error": "permanent failure", **received})
        elif path == "/slow":
            time.sleep(12)
            self._send(200, {"slow": True})
        else:
            self._send(404, {"error": "unknown route"})

    def _send(self, status: int, payload: dict) -> None:
        raw = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def log_message(self, fmt: str, *args) -> None:
        print(f"[receiver] {self.address_string()} {fmt % args}")


if __name__ == "__main__":
    print(f"Demo receiver listening on http://127.0.0.1:{PORT}")
    print("Routes: /ok /flaky /fail /slow")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
