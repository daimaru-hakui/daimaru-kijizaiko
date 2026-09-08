#!/usr/bin/env bash
# Stop hook: Claude がターンを終える前に型チェックを実行する
# 型エラーがある場合は exit 2 で完了報告をブロックする

set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

# tsconfig.json がなければ TypeScript プロジェクトではないのでスキップ
if [[ ! -f "tsconfig.json" ]]; then
  exit 0
fi

# package.json の scripts.typecheck があれば使う
if [[ -f "package.json" ]] && command -v pnpm &>/dev/null; then
  HAS_SCRIPT=$(python3 -c "
import json, sys
scripts = json.load(open('package.json')).get('scripts', {})
print('yes' if 'typecheck' in scripts else 'no')
" 2>/dev/null || echo "no")

  if [[ "$HAS_SCRIPT" == "yes" ]]; then
    if pnpm run typecheck 2>&1; then
      echo "型チェック通過 ✅"
      exit 0
    fi
    echo "型エラーが残っています ❌ 修正してから完了報告してください" >&2
    exit 2
  fi
fi

# typecheck スクリプトがない場合は tsc --noEmit を直接実行
if command -v pnpm &>/dev/null && pnpm exec tsc --noEmit 2>&1; then
  echo "型チェック通過 ✅"
  exit 0
fi

echo "型エラーが残っています ❌ 修正してから完了報告してください" >&2
exit 2
