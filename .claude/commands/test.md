---
description: Vitest でテストを実行する。パスを渡すと絞り込める
argument-hint: [path or package-name]
allowed-tools: Bash(pnpm test*), Bash(pnpm --filter * test*), Read, Grep
---

## テスト実行

!`echo "引数: $ARGUMENTS"`

## タスク

以下の手順でテストを実行してください:

1. `$ARGUMENTS` が空なら `pnpm test` を実行する
2. `$ARGUMENTS` がパス形式 (`src/` や `./` 始まり、または `.test.` を含む) なら `pnpm test $ARGUMENTS` を実行する
3. `$ARGUMENTS` がパッケージ名に見える場合は `pnpm --filter $ARGUMENTS test` を実行する

テストが失敗した場合:
- 失敗しているテストファイルを Read して原因を特定する
- TDD の Green フェーズとして、最小限の修正を提案する
- 勝手に実装を変更しない (提案のみ)
