---
description: ESLint + Prettier で lint と format を実行し、残った警告を要約する
allowed-tools: Bash(pnpm lint*), Read, Grep
---

## Lint & Format 実行

!`pnpm lint --fix 2>&1 | tail -30 || echo "lint コマンド失敗"`

## タスク

上記の出力を確認して:

1. 自動修正できたエラー数を報告する
2. 自動修正できなかった警告/エラーをファイル別にグループ化して要約する
3. `error` 扱いのものは修正方針を提案する (勝手に変更しない)
4. `warning` 扱いのものは一覧を示すだけでよい

lint コマンドが存在しない場合は `pnpm exec eslint . --fix` を試みる。
