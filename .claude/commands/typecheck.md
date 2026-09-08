---
description: TypeScript の型チェックを実行し、型エラーをファイルごとに要約する
allowed-tools: Bash(pnpm typecheck*), Bash(pnpm exec tsc *), Read, Grep
---

## 型チェック実行

!`pnpm typecheck 2>&1 || pnpm exec tsc --noEmit 2>&1`

## タスク

上記の出力を確認して:

1. エラー総数を報告する (`Found N error(s)`)
2. ファイルごとにエラーをグループ化して、エラーの種類と行番号を示す
3. 修正優先度の高いもの (型の根本定義に関わるもの) を上位に置く
4. 修正方針を提案する。勝手にコードを変更しない

エラーが0なら「型チェック通過 ✅」と報告する。
