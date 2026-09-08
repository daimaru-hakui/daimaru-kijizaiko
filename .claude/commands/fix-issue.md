---
description: GitHub Issue を読み込み、TDD で修正ブランチを作って実装する
argument-hint: <issue-number>
allowed-tools: Bash(gh issue view *), Bash(git checkout *), Bash(git switch *), Bash(pnpm test*), Read, Edit, Write, Grep, Glob
---

## Issue の内容

!`gh issue view $1 --json title,body,labels,assignees`

## タスク

上記の Issue を確認して、以下のステップで実装を進めてください:

1. **ブランチ作成**: Issue の内容から適切なブランチ名を決めて作成する
   - バグ修正: `fix/<short-name>` (例: `fix/timeout-retry`)
   - 機能追加: `feat/<short-name>` (例: `feat/user-auth`)
   - `git switch -c <branch-name>`

2. **TDD で実装**:
   - **Red**: Issue の再現テストを先に書く。失敗することを `pnpm test` で確認する
   - **Green**: 最小実装でテストを通す
   - **Refactor**: 重複を畳む。テストは緑のまま

3. **完了確認チェックリスト**:
   - [ ] テストが緑
   - [ ] lint が緑 (`pnpm lint`)
   - [ ] type-check が緑 (`pnpm typecheck`)
   - [ ] Issue の要件をすべて満たしているか

4. Issue 番号を参照したコミットメッセージを提案する:
   ```
   fix(<scope>): <概要>
   
   Closes #$1
   ```

Issue 番号が渡されていない場合は `$ARGUMENTS を指定してください (例: /fix-issue 42)` と返す。
