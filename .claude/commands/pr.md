---
description: GitHub PR をConventional Commits タイトルと Test plan 付きで作成する
argument-hint: [base-branch]
allowed-tools: Bash(git log *), Bash(git diff *), Bash(git push *), Bash(gh pr *)
---

## ベースブランチとのコミット差分

!`git log ${1:-main}..HEAD --oneline`

## 変更ファイルの概要

!`git diff ${1:-main}...HEAD --stat`

## タスク

上記の情報を使って、以下のステップで PR を作成してください:

1. コミット一覧と変更ファイルを分析して PR タイトルを決める:
   - Conventional Commits 形式: `feat: <概要>` (70文字以内)
2. PR ボディを以下のフォーマットで作成する:
   ```markdown
   ## Summary
   - <変更の要点を箇条書きで1-3つ>

   ## Test plan
   - [ ] <テストした内容1>
   - [ ] <テストした内容2>

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   ```
3. リモートにプッシュ済みか確認し、必要なら `git push -u origin HEAD` を実行する
4. `gh pr create --title "<title>" --body "..."` で PR を作成する

ベースブランチのデフォルトは `main`。`$1` で上書き可能。
