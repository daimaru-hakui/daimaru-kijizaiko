#!/usr/bin/env bash
# SessionStart(startup) hook: セッション開始時にツールのバージョンを表示する

set -uo pipefail

echo "=== 開発環境 ==="
echo "Node.js : $(node -v 2>/dev/null || echo 'not found')"
echo "pnpm    : $(pnpm -v 2>/dev/null || echo 'not found')"
echo "git     : $(git --version 2>/dev/null || echo 'not found')"
echo "gh      : $(gh --version 2>/dev/null | head -1 || echo 'not found')"
echo "================"

exit 0
