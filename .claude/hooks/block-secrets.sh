#!/usr/bin/env bash
# PreToolUse(Read) hook: 機密ファイルへのアクセスをブロックする
# permissions の deny と二重で守る

set -euo pipefail

INPUT=$(cat)

FILE_PATH=$(echo "$INPUT" | python3 -c "
import json, sys
data = json.load(sys.stdin)
# PreToolUse の入力形式: { tool_name, tool_input: { file_path, ... } }
print(data.get('tool_input', {}).get('file_path', ''))
" 2>/dev/null || echo "")

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# 機密ファイルパターン
PATTERNS=(
  '\.env$'
  '\.env\.'
  '/secrets/'
  '\.pem$'
  'id_rsa'
  'id_ed25519'
  '\.key$'
  'credentials\.json$'
  'service[-_]account.*\.json$'
)

for pattern in "${PATTERNS[@]}"; do
  if echo "$FILE_PATH" | grep -qE "$pattern"; then
    echo "BLOCKED: 機密ファイルへのアクセスを拒否しました: $FILE_PATH" >&2
    exit 2
  fi
done

exit 0
