#!/usr/bin/env bash
# PostToolUse(Edit|Write) hook: 編集後に ESLint --fix を自動適用する

set -uo pipefail

INPUT=$(cat)

# PostToolUse の入力から変更されたファイルパスを取得
FILE_PATHS=$(echo "$INPUT" | python3 -c "
import json, sys, os
data = json.load(sys.stdin)
# tool_input.file_path または tool_input.path
tool_input = data.get('tool_input', {})
path = tool_input.get('file_path') or tool_input.get('path', '')
print(path)
" 2>/dev/null || echo "")

if [[ -z "$FILE_PATHS" ]]; then
  exit 0
fi

# TS/JS ファイルのみ対象
if ! echo "$FILE_PATHS" | grep -qE '\.(ts|tsx|js|jsx|mts|cts|mjs|cjs)$'; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

# eslint --fix を実行 (失敗しても Claude の動作は止めない)
if command -v pnpm &>/dev/null; then
  pnpm exec eslint --fix --quiet "$FILE_PATHS" 2>/dev/null || true
elif command -v npx &>/dev/null; then
  npx eslint --fix --quiet "$FILE_PATHS" 2>/dev/null || true
fi

exit 0
