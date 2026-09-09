# daimaru-kijizaiko

大丸白衣の生地在庫管理システム。生地の発注・入荷・染色・裁断・在庫調整をトラッキングする社内ツール。

パッケージマネージャ: pnpm
テストフレームワーク: Vitest + @testing-library/react

@.claude/rules/testing.md
@.claude/rules/commits.md

---

## リニューアル (完了)

Next.js 16 + App Router + shadcn/ui + Firebase セッションクッキー認証への 5 フェーズ移行は完了し、main にマージ済み。
計画書: `/home/mukai/.claude/plans/next16-react-css-shadcnui-firebaseauth-noble-hammock.md`

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
pnpm emulator          # Firebase Emulator 起動
```

E2E は未整備。`playwright.config.ts` はあるが `e2e/` にテストが 1 本もないため `pnpm e2e` は動かない。

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
BACKEND_API_KEY=                # /api/cutting-reports (外部システム連携) 専用
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
  app/              エントリポイント・ルーティング層。page.tsx / layout.tsx / route.ts / actions.ts
  components/       UI 層。副作用は Server Action か lib/ 経由で呼ぶ
  hooks/            カスタム hooks
  lib/              純粋ロジック層。原則フレームワーク非依存
  proxy.ts          Next.js 16 の Proxy。全リクエストの認証・ロール認可
types/              型定義
tests/              I/O 境界の統合テスト用の足場 (msw / Firebase Emulator)
```

テストは対象と同階層に `<name>.test.ts(x)` で置く。`tests/` は実 DB / MSW を使う統合テスト専用。

### lib の例外 (I/O アダプタとして許容)

純粋ロジック層だが、次の 3 つだけは外部に依存してよい。ここを境界にして他の lib を純粋に保つ。

- `lib/firebase/{admin,client}.ts`: Firebase SDK の初期化
- `lib/auth/session.ts`: `next/headers` のクッキー読み取り
- `lib/download.ts`: ブラウザの DOM API (Blob ダウンロード)

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
- 管理者 UID をソースコードにハードコードする (権限は Firestore の users ドキュメントのフラグで判定する)
- Server Action を `ensureAuth` (ログイン確認) だけで通す。更新・削除は必ず `ensureRoles` と `lib/permissions.ts` でサーバー側の認可を行う
- `BACKEND_API_KEY` だけで API を認可する
  - 例外: `/api/cutting-reports` のみ。外部システム (daimaru-portal) がセッションクッキーを持てないため。ヘッダ方式への移行は portal 側の改修待ち
