# 旧アプリ (Firestore) からのデータ引き継ぎ計画

新アプリ (仕様: `SPEC.md`) は完全新規として設計する。本ドキュメントはそれとは独立した
「旧アプリ (daimaru-kijizaiko, Firestore) の過去データをどう引き継ぐか」の計画である。
引き継ぎは one-shot の移行スクリプト (firebase-admin で読み取り → Drizzle/SQL で投入) として実装する。

---

## 1. 引き継ぐもの / 引き継がないもの

| 対象 | 引き継ぎ | 方法 |
|------|---------|------|
| マスタ (生地・キバタ・仕入先・送り先・保管場所・色・組織名・ユーザー) | ○ 全件 | 対応テーブルへ変換投入 |
| 発注/入荷履歴 (grayFabric / fabricDyeing / fabricPurchase の Orders + Confirms) | ○ 全件 | orders + deliveries へ正規化 (下記 3-2) |
| 裁断報告 (明細・既読含む) | ○ 全件 | cutting_reports + cutting_report_items + cutting_report_reads |
| 在庫残高 | ○ 現在値のみ | 台帳への初期残高仕訳 (下記 3-1)。**履歴からのリプレイはしない** |
| 伝票連番 (serialNumbers 4 カウンタ) | ○ | SEQUENCE へ setval で継承 |
| 使用予定 (cuttingSchedules) | × | 機能廃止。進行中の予定は切替時に加工指示書として手動再登録 |
| 手動調整の履歴・理由 | × | 旧アプリが記録していないため復元不能 |
| 付属・加工指示書・縫製スケジュール関連 | — | 旧アプリに存在しない新機能。マスタは新規登録、付属の初期在庫は実地棚卸で投入 |

引き継ぎ後にできること: 生地ごとの使用数量集計・裁断ランキング・発注履歴の参照は
**過去分を含めて**動く (新アプリの集計は cutting_report_items / deliveries を直接読むため)。
過去の裁断報告は加工指示書に紐づかない「指示書なし報告」となり、案件別集計が効くのは移行後の入力から。

## 2. 移行用の対応付け (legacy_id)

移行マイグレーションで対象テーブル (suppliers, stock_places, locations, gray_fabrics,
products, orders, deliveries, cutting_reports) に `legacy_id text UNIQUE` 列を追加し、
Firestore doc ID を保存する。件数照合・在庫照合・再実行時の冪等性に使う。
検証完了後も残してよい (実害なし)。新アプリの SPEC には含めない (移行の都合であるため)。

## 3. 変換ルール

### 3-1. 在庫初期残高 (最重要)

履歴からのリプレイ再構築はしない (旧アプリでは手動上書き調整が重ねられており、
履歴の合算は現在値と一致しない)。**「現在値 = 正」**として、旧カウンタ値を
`movement_type='adjustment', reason='Firestore移行時初期残高'` の仕訳 1 本ずつで起票する。

- products の 4 種: wip / externalStock / arrivingQuantity / tokushimaStock
- grayFabrics の 2 種: wip / stock
- tokushimaStock は onhand@徳島工場 (is_internal 拠点) の初期残高として起票
- 徳島以外の拠点は旧アプリで追跡されていないため初期残高 0 (移行後の入荷から積み上げ)
- 発注残 (open orders) 分は旧カウンタに既に含まれているため、移行後の分納がそのまま打ち消して整合する

### 3-2. 発注履歴の正規化

旧アプリは分納のたびに Orders.quantity を残量へ上書きしている。復元式:

```
元の発注量 = 旧 Orders.quantity (残量) + Σ 対応する Confirms.quantity
```

- 突合キー: serialNumber + 発注種別
- quantity = 0 の残骸 doc も completed の発注として取り込む (status は order_progress VIEW が導出)
- Confirms は deliveries へ 1:1 で変換

### 3-3. データクレンジング

| 項目 | ルール |
|------|--------|
| 日付文字列 'YYYY-MM-DD' | `date` 型へ。空文字 → NULL。NOT NULL 列 (fixed_at, cutting_date) の欠損行は事前スキャンして目視確認 |
| stockType `'ranning'` | `'running'` へ。NULL/欠落も 'running' 扱い (旧 UI の既定と同じ) |
| staff = `'R&D'` (マジック文字列) | staff_id NULL へ。users に実在しない uid 参照も NULL 化してログ出力 |
| deletedAt の 3 状態 ('' / null / 欠落) | すべて NULL (有効)。値ありは timestamptz へ |
| colors / materialNames の二重管理 | 旧アプリは `colors`/`materialNames` コレクションと `components` 擬似 KV の両方を持つ (設定画面が書くのは components 側)。両者の diff を出力し、union + 目視確認で確定してから単一テーブルへ投入 |
| stockPlace (名前文字列) | stock_places.name で突合 (前後空白・全半角を正規化)。突合不能な値は stock_places へ自動追加 + レポート。'徳島工場' に is_internal=true |
| products.materials (13キー map) | product_compositions へ。値は文字列% → numeric。'' / 0 はスキップ。合計 > 100 は警告リスト化 |
| products.cuttingSchedules[] (双方向リンク配列) | 捨てる (使用予定は廃止) |

### 3-4. 連番の継承

serialNumbers 4 カウンタ (キバタ発注 / 染色発注 / 購入発注 / 裁断報告) を各 SEQUENCE へ
`setval` で継承する。旧実装 (`prepareSerialNumber`) はカウンタに「最後に使った値」を
保持しているため `setval(seq, 値, true)` (is_called=true)。

## 4. 事前検証 (移行スクリプト実行前)

1. **products の (品番, 色番) 重複チェック**: 新スキーマは
   `UNIQUE (product_number, color_num) WHERE deleted_at IS NULL` を張る想定。
   旧データに重複があれば、UNIQUE を外して警告運用にするか、データを直してから移行するかを決める。
2. NOT NULL 列に入る値の欠損スキャン (fixed_at, cutting_date, ordered_at)。
3. 参照整合チェック: Orders/Confirms の productId / grayFabricId / supplierId が
   実在するか。孤児参照はレポートして NULL 化 or 除外を判断。

## 5. 移行後の検証

- **件数照合**: コレクションごとの doc 数 = テーブル行数 (フィルタ条件込みで一致)。
- **在庫照合**: legacy_id 突合で「旧カウンタ値 vs 新 VIEW (product_stock_balances 等) の導出値」の
  diff が全件ゼロであること。
- **発注残照合**: order_progress の status='open' 集合が旧アプリの「quantity > 0」フィルタの
  集合と一致すること。
- 主要画面の目視確認: 生地一覧の在庫、発注履歴、裁断ランキングが旧アプリと一致するか。

## 6. 切替手順 (概要)

1. 新アプリをステージング環境で稼働、移行スクリプトをリハーサル実行 → 検証 (§5)
2. 切替日: 旧アプリを入力停止 → 本番移行実行 → 検証 → 新アプリ公開
3. 進行中の使用予定があれば加工指示書として手動再登録
4. 付属の初期在庫を実地棚卸して調整仕訳 (reason='付属初期在庫') で投入
5. 旧アプリは読み取り専用でしばらく残し、問題なければ停止
