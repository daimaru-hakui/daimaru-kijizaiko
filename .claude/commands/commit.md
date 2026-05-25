---
description: Conventional Commits に従ったコミットメッセージを作成してコミットする
allowed-tools: Bash(git status*), Bash(git diff *), Bash(git add *), Bash(git commit *)
---

## 現在の変更

!`git status --short`

## ステージ済みの差分

!`git diff --staged --stat`

## タスク

上記を確認して、以下のステップでコミットを行ってください:

1. ステージ済みの変更がない場合は `git status` を確認して必要なファイルをステージするよう提案する
2. 変更内容を分析して Conventional Commits の type を決める:
   - `feat` / `fix` / `refactor` / `test` / `docs` / `chore` / `perf` / `style`
3. コミットメッセージ案を提示する (日本語可):
   ```
   <type>(<scope>): <概要>
   
   <WHY を1-2行で説明。WHAT は書かない>
   ```
4. ユーザーが承認したら `git commit -m "<message>"` を実行する

### 禁止事項
- `feat` と `refactor` を1コミットに混在させない
- `--no-verify` は使わない
- 共有ブランチ (`main` 等) への `--amend` は使わない
