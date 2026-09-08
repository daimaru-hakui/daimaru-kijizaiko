---
description: Vitest テスト規約。TypeScript/React ファイルを操作するときに自動ロード
paths:
  - "src/**/*.{ts,tsx}"
  - "apps/**/*.{ts,tsx}"
  - "packages/**/*.{ts,tsx}"
---

## テスト規約 (Vitest)

### ファイル配置

- 対象ファイルと同階層に `<name>.test.ts` / `<name>.test.tsx` を置く
- または `tests/` / `__tests__/` ディレクトリに集約 (プロジェクト慣習に従う)
- テストファイル名は `<対象>.test.ts` で統一

### テストの粒度

| 層 | 種別 | ツール |
|----|------|--------|
| 純粋ロジック (`lib/`, `core/`, `domain/`) | 単体テスト | Vitest, 外部依存なし |
| UI コンポーネント (`components/`) | ユーザー操作観点 | Vitest + @testing-library/react |
| I/O 境界 (DB, HTTP, ファイル) | 統合テスト | Vitest + 実 DB / MSW |

### 禁止事項

- **スナップショットテスト禁止**: DOM 変更のたびに壊れ、何を保証しているかが不明瞭
- **過剰なモック禁止**: I/O 境界以外はモックせず実装を直接テストする
- **テスト内に業務ロジックを書かない**: テストは「使い方のドキュメント」であること

### Vitest のベストプラクティス

```typescript
// 推奨: describe でグループ化、it で1アサーション1テスト
describe('calculateTotal', () => {
  it('税込み金額を返す', () => {
    expect(calculateTotal(1000, 0.1)).toBe(1100)
  })

  it('数量が0のとき0を返す', () => {
    expect(calculateTotal(0, 0.1)).toBe(0)
  })
})

// React コンポーネントのテスト
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

it('ボタンをクリックするとカウントが増える', async () => {
  render(<Counter />)
  await userEvent.click(screen.getByRole('button', { name: '増やす' }))
  expect(screen.getByText('1')).toBeInTheDocument()
})
```

### 実行コマンド

```bash
pnpm test              # 全テスト
pnpm test src/lib/     # パス指定
pnpm test --watch      # ウォッチモード
pnpm test --coverage   # カバレッジ付き
pnpm --filter <pkg> test  # monorepo のワークスペース指定
```
