#!/usr/bin/env python3
"""Static server with a small same-origin proxy for the Wufazhuce RSS feed."""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import re
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
RSS_URL = "https://rsshub.rssforever.com/wufazhuce/one"
RSS_CACHE_SECONDS = 300
DATA_DIR = ROOT / "data"
MEDIA_DIR = ROOT / "media"
STATE_PATH = DATA_DIR / "site-state.json"
STATE_LOCK = threading.Lock()
MAX_REQUEST_BYTES = 50 * 1024 * 1024

DATA_DIR.mkdir(exist_ok=True)
MEDIA_DIR.mkdir(exist_ok=True)


def load_state() -> dict:
    if not STATE_PATH.exists():
        return {
            "initialized": False,
            "revision": 0,
            "updatedAt": None,
            "settings": {},
            "posts": [],
        }
    try:
        data = json.loads(STATE_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {
            "initialized": False,
            "revision": 0,
            "updatedAt": None,
            "settings": {},
            "posts": [],
        }
    data["initialized"] = True
    return data


def save_state(payload: dict) -> dict:
    settings = payload.get("settings")
    posts = payload.get("posts")
    if not isinstance(settings, dict) or not isinstance(posts, list):
        raise ValueError("State must contain settings and posts")

    clean_posts = []
    for raw_post in posts[:200]:
        if not isinstance(raw_post, dict):
            continue
        post = dict(raw_post)
        data_url = post.pop("coverData", "")
        if isinstance(data_url, str) and data_url.startswith("data:image/"):
            match = re.match(r"data:image/(png|jpeg|jpg|webp|gif|svg\+xml);base64,(.+)", data_url, re.S)
            if match:
                extension = {"jpeg": "jpg", "svg+xml": "svg"}.get(match.group(1), match.group(1))
                try:
                    image_bytes = base64.b64decode(match.group(2), validate=True)
                    if len(image_bytes) <= 12 * 1024 * 1024:
                        digest = hashlib.sha256(image_bytes).hexdigest()[:16]
                        filename = f"{digest}.{extension}"
                        (MEDIA_DIR / filename).write_bytes(image_bytes)
                        post["cover"] = f"/media/{filename}"
                        post["coverKey"] = ""
                except (ValueError, OSError):
                    pass
        cover = post.get("cover", "")
        if not isinstance(cover, str):
            post["cover"] = ""
        clean_posts.append(post)

    previous = load_state()
    state = {
        "initialized": True,
        "revision": int(previous.get("revision", 0)) + 1,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "settings": settings,
        "posts": clean_posts,
    }
    temporary = STATE_PATH.with_suffix(".tmp")
    temporary.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    temporary.replace(STATE_PATH)
    return state


class JournalHandler(SimpleHTTPRequestHandler):
    rss_cache: tuple[float, bytes] = (0.0, b"")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/wufazhuce-rss":
            query = urllib.parse.parse_qs(parsed.query)
            self.send_rss(force=query.get("refresh") == ["1"])
            return
        if parsed.path == "/api/state":
            self.send_json(load_state())
            return
        if parsed.path.startswith("/data/"):
            self.send_error(404)
            return
        super().do_GET()

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_cors_headers()
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Max-Age", "86400")
        self.end_headers()

    def do_PUT(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path != "/api/state":
            self.send_error(404)
            return
        try:
            payload = self.read_json()
            with STATE_LOCK:
                state = save_state(payload)
            self.send_json(state)
        except ValueError as error:
            self.send_json({"error": str(error)}, status=400)
        except OSError:
            self.send_json({"error": "Unable to save state"}, status=500)

    def do_POST(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path != "/api/settings":
            self.send_error(404)
            return
        try:
            payload = self.read_json()
            settings = payload.get("settings")
            if not isinstance(settings, dict):
                raise ValueError("Settings must be an object")
            with STATE_LOCK:
                current = load_state()
                current["settings"] = settings
                state = save_state(current)
            self.send_json(state)
        except ValueError as error:
            self.send_json({"error": str(error)}, status=400)
        except OSError:
            self.send_json({"error": "Unable to save settings"}, status=500)

    def read_json(self) -> dict:
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            raise ValueError("Invalid content length")
        if content_length <= 0 or content_length > MAX_REQUEST_BYTES:
            raise ValueError("Request body is too large")
        try:
            payload = json.loads(self.rfile.read(content_length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            raise ValueError("Invalid JSON")
        if not isinstance(payload, dict):
            raise ValueError("JSON body must be an object")
        return payload

    def send_json(self, payload: dict, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def send_cors_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Private-Network", "true")

    def send_rss(self, force: bool = False) -> None:
        cached_at, cached_body = type(self).rss_cache
        fresh = time.time() - cached_at < RSS_CACHE_SECONDS
        if cached_body and fresh and not force:
            self.send_xml(cached_body, cache_status="HIT")
            return

        request = urllib.request.Request(
            RSS_URL,
            headers={
                "Accept": "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
                "User-Agent": "MULI-Journal/1.0",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=15) as response:
                body = response.read()
            if not body.lstrip().startswith(b"<?xml"):
                raise ValueError("Upstream did not return RSS XML")
            type(self).rss_cache = (time.time(), body)
            self.send_xml(body, cache_status="MISS")
        except (urllib.error.URLError, TimeoutError, ValueError) as error:
            if cached_body:
                self.send_xml(cached_body, cache_status="STALE")
                return
            message = f'{{"error":"RSS unavailable","detail":{str(error)!r}}}'.encode()
            self.send_response(502)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(message)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(message)

    def send_xml(self, body: bytes, cache_status: str) -> None:
        self.send_response(200)
        self.send_cors_headers()
        self.send_header("Content-Type", "application/xml; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", f"public, max-age={RSS_CACHE_SECONDS}")
        self.send_header("X-RSS-Cache", cache_status)
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt: str, *args) -> None:
        print(f"[{self.log_date_time_string()}] {fmt % args}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the MULI journal locally.")
    parser.add_argument("port", nargs="?", type=int, default=8080)
    parser.add_argument("--host", default="127.0.0.1")
    args = parser.parse_args()

    server = ThreadingHTTPServer((args.host, args.port), JournalHandler)
    print(f"MULI journal running at http://{args.host}:{args.port}")
    print(f"RSS proxy: http://{args.host}:{args.port}/api/wufazhuce-rss")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
