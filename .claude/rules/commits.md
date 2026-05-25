---
description: Conventional Commits 規約とブランチ運用。git 操作を行うときに自動ロード
paths:
  - ".git/**"
  - "**/.git/**"
---

## コミット規約: Conventional Commits

### フォーマット

```
<type>(<scope>): <subject>

[body]  ← 任意。WHY を説明する。WHAT は書かない
```

### type 一覧

| type | 用途 |
|------|------|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `refactor` | 動作を変えないリファクタリング |
| `test` | テスト追加・修正 |
| `docs` | ドキュメントのみ |
| `chore` | ビルド設定・依存更新など |
| `perf` | パフォーマンス改善 |
| `style` | フォーマットのみ (ロジック変更なし) |

### 例

```
feat(auth): ユーザー認証画面を追加
fix(api): タイムアウト時にリトライしない問題を修正
test(auth): パスワードリセットのエッジケースを追加
refactor: メール送信処理を mailer.ts に集約
docs: README にセットアップ手順を追記
chore: eslint を v9 へ更新
perf: 一覧取得クエリにインデックスを追加
```

### コミット作法

- 小さく頻繁にコミットする (1コミット = 1トピック)
- `feat` と `refactor` を同一コミットに混在させない
- WIP コミットはマージ前に整理する (`git rebase -i` で squash)
- `--no-verify` でコミットフックを skip しない
- 共有ブランチ (`main` 等) への `--force-push` と `--amend` は禁止

---

## ブランチ運用

- `main` (または `master`): 常にデプロイ/リリース可能な状態を維持する
- 機能ブランチ: `feat/<short-name>` 例: `feat/user-auth`
- バグ修正ブランチ: `fix/<short-name>` 例: `fix/timeout-retry`
- 直接 `main` に push しない。PR レビュー後にマージ (squash merge 推奨)
