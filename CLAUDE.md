# daimaru-kijizaiko

大丸白衣の生地在庫管理システム。生地の発注・入荷・染色・裁断・在庫調整をトラッキングする社内ツール。

パッケージマネージャ: pnpm
テストフレームワーク: Vitest + @testing-library/react + Playwright (E2E)

@.claude/rules/testing.md
@.claude/rules/commits.md

---

## リニューアル中 (renewal ブランチ)

現在 5 フェーズの大規模リニューアルを進行中。
計画書: `/home/mukai/.claude/plans/next16-react-css-shadcnui-firebaseauth-noble-hammock.md`

| フェーズ | 内容 | 状態 |
|---------|------|------|
| Phase 1 | テスト基盤構築 & 環境整備 | 🔄 進行中 |
| Phase 2 | Next.js 16 + 依存アップグレード | ⬜ 未着手 |
| Phase 3 | Firebase Auth セッションクッキー化 + proxy.ts 認可 | ⬜ 未着手 |
| Phase 4 | App Router 移行 + Chakra→shadcn/ui | ⬜ 未着手 |
| Phase 5 | リファクタリング仕上げ | ⬜ 未着手 |

---

## 起動方法

```bash
pnpm install
pnpm dev          # 開発サーバー (http://localhost:3000)
pnpm build        # 本番ビルド
pnpm start        # 本番サーバー
```

### テスト

```bash
pnpm test              # Vitest 全テスト実行
pnpm test:watch        # ウォッチモード
pnpm test:coverage     # カバレッジ付き
pnpm e2e               # Playwright E2E テスト
pnpm emulator          # Firebase Emulator 起動
```

### 型チェック / Lint

```bash
pnpm typecheck         # tsc --noEmit
pnpm lint              # ESLint
pnpm lint:fix          # ESLint + 自動修正
```

---

## 環境変数

`.env.local` に以下を設定:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_SERVICE_ACCOUNT_KEY=  # JSON 文字列
BACKEND_API_KEY=                # Phase 3 で廃止予定
```

---

## 開発フロー: TDD 必須

新しい機能・バグ修正は **必ず Red → Green → Refactor** のサイクルで進める。

1. **Red**: 落ちるテストを1本書く
2. **Green**: 最小実装でテストを通す (設計の先取り禁止)
3. **Refactor**: 重複を畳む。テストは緑のまま

---

## DRY 原則 (3回ルール)

- 2回目: 共通化を「検討」する。まだ実施しなくてよい
- **3回目が来たとき**: 必ず共通化する
- 先取り抽象化は禁止 (YAGNI)

---

## ディレクトリ構成と責務

```
src/
  app/              (Phase 4 以降) エントリポイント・ルーティング層
  pages/            (Phase 3 まで) Pages Router のページと API ルート
  components/       UI 層。副作用は lib/ 経由で呼ぶ
  hooks/            カスタム hooks
  lib/              (Phase 4 以降) 純粋ロジック層。フレームワーク非依存
  types/            型定義
store/              Zustand store (Phase 5 で縮小予定)
tests/              テストファイル
e2e/                Playwright E2E テスト
firebase/           Firebase 初期化 (Phase 2 で src/lib/firebase/ へ移設)
```

---

## 使用すべき Skill

| Skill | 起動タイミング |
|-------|--------------|
| `frontend-design` | 新規 UI コンポーネントを書く / レイアウトを決めるとき |
| `vercel-react-best-practices` | React / Next.js のコードを書く・レビューするとき |

---

## 完了報告前チェックリスト

- [ ] テストが緑 (該当機能の単体/統合テスト)
- [ ] lint / format が緑
- [ ] typecheck が緑 (または @ts-expect-error TODO(phase5) でトリアージ済み)
- [ ] build が緑
- [ ] 新規ロジックに対応するテストがある (TDD 原則)

---

## やってはいけないこと

- テストを書かずに実装を進める (必ず Red を先に書く)
- 2回しか出ていない共通化を先取りで抽象化する
- UI / エントリ層にビジネスロジックや I/O を直書きする
- `main` ブランチへの直接 push
- `--no-verify` でコミットフックを skip する
- 管理者 UID をソースコードにハードコードする (Phase 3 で解消)
- `BACKEND_API_KEY` だけで API を認可する (Phase 3 で解消)
