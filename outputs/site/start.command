#!/bin/zsh

cd "$(dirname "$0")" || exit 1
PORT="${1:-8080}"

if command -v lsof >/dev/null 2>&1; then
  for PID in $(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null); do
    PROCESS_DIR=$(lsof -a -p "$PID" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' | head -1)
    if [ "$PROCESS_DIR" = "$(pwd)" ]; then
      echo "关闭旧的暮里服务 ${PID}…"
      kill "$PID" 2>/dev/null || true
      sleep 1
    fi
  done
fi

echo "暮里 MULI 正在 http://127.0.0.1:${PORT} 启动…"
python3 server.py "$PORT" --host 127.0.0.1 &
SERVER_PID=$!

sleep 1
open "http://127.0.0.1:${PORT}"

trap 'kill "$SERVER_PID" 2>/dev/null' EXIT INT TERM
wait "$SERVER_PID"
