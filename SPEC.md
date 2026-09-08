# SPEC: 生地在庫管理システム

大丸白衣の生地・付属の調達から縫製までを管理する社内システムの仕様書。
キバタ (生機) の発注、染色、生地・付属の入荷、加工指示、縫製スケジュール、裁断・使用実績、
在庫追跡までを一つの在庫台帳の上で扱う。

> 過去データの引き継ぎは本仕様とは独立して扱う: `docs/data-migration.md`

---

## 1. 業務ドメインとフロー

キバタ (生機) → 染色 → 生地 → 自社工場 (徳島工場) で裁断・縫製、という流れ。
染色・生地発注には「自社管理在庫から (stock)」と「自社管理外ソースから (running)」の 2 系統がある。

1. **キバタ**: 自社管理分は発注 (納期管理) → 入荷 → キバタ在庫として管理する。
   自社管理外 (ランニング) のキバタは機屋・メーカー側にあり、在庫管理はしない (できない)。
   gray_fabrics のマスタ・在庫は自社管理分のみを扱う。
2. **染色**: キバタを染めて生地 (products) にする。
   - `stock`: 自社管理のキバタ在庫から染める → キバタ在庫を引き落とす
   - `running`: 自社管理外のキバタから染める → キバタ在庫と無関係に発注できる
   染め上がった生地は**外部在庫** (染工場・倉庫の預け在庫) になる。
3. **生地発注 (購入)**: 生地を取り寄せて送り先拠点に入荷させる。
   - `stock`: 染色で染め上がって外部在庫にある生地を取り寄せる → 外部在庫を引き落とす
   - `running`: メーカーが備蓄している**既成の生地**を購入する → 自社在庫の引き落としなし
   入荷したら送り先拠点の生地在庫 (onhand) が増える。送り先は拠点別に在庫追跡する。
4. **裁断**: 自社工場で製品を裁断し、使用生地量を拠点在庫から減らす。
   客先支給材は 0 円で受入計上する (無償支給材の預り在庫管理)。裁断時は自社材と同様に減算する。
5. **付属 (ファスナー・ボタンなど)**: 発注 → 入荷で送り先拠点の在庫が増え、
   現場が**使用報告**を入力して在庫から減らす。中間工程のないシンプルなフロー。
   単位は品目ごとに異なる (個・本・巻・m など)。
6. **加工指示書**: 「どの製品 (加工品) を・いくつ・いつまでに作るか」の指示。
   繰り返し作る製品は**加工品マスタ**に登録し、標準使用量 (簡易 BOM) も任意で持てる。
   指示書はマスタから選んで着数・納期を入れるだけで作成でき、標準使用量があれば
   予定明細 (生地・付属の予定使用数) が自動展開される (編集可)。
   裁断報告 (生地消費) と使用報告 (付属消費) は指示書に紐づき、
   **案件別の実使用量・材料費が集計できる**。単発案件は指示書なしでも報告可能 (紐付けは任意)。
   指示書自体は在庫仕訳を起こさない。
7. **縫製スケジュール**: 加工指示書を振るのは営業で、**希望納期**を入力する。
   実際の予定を決めるのは工場側で、**どの縫製班が・いつ始めて・いつ完了予定か**を入力する。
   縫製班は複数あり、班ごとの予定を**ガントチャート**で確認できる。
8. **引当**: 未完了の指示書の予定明細は**引当**として扱い、
   「有効在庫 = 実在庫 − 引当残」を表示する。裁断前の生地でも予約済みに見えるため、
   在庫が空いていると誤解した二重発注を防ぐ。実績 (裁断報告・使用報告) が入るぶん
   引当残は自動で減り、指示書の完了・キャンセルで残りが解放される。

---

## 2. 技術スタック

| 領域 | 技術 | 備考 |
|------|------|------|
| フレームワーク | Next.js 16 (App Router) | サーバーも Next.js (RSC + Server Actions)。別バックエンドは持たない |
| データベース | Supabase (PostgreSQL) | DB ホスティングとしてのみ使用。Supabase Auth / RLS は使わない |
| ORM | Drizzle ORM + drizzle-kit | スキーマは TypeScript 定義。VIEW / CHECK / トリガは SQL マイグレーションで補完 |
| 認証 | Firebase Authentication | セッションクッキー方式。Supabase Auth は使用しない |
| ストレージ | Firebase Storage | 画像等のファイル保存。パスを DB の text 列に保存 |
| UI | shadcn/ui + Tailwind CSS | |
| フォーム | react-hook-form + zod | zod スキーマをクライアント/サーバーで共有 |
| URL 状態 | nuqs | 検索条件・フィルタ・ページネーションを URL に持つ |
| グラフ | recharts | ダッシュボードの集計・ランキング |
| 日付 | date-fns | DB は `date` / `timestamptz` 型 |
| 通知 | react-toastify | Server Actions の成否表示 |
| AI チャット | Vercel AI SDK (`ai` + `@ai-sdk/anthropic` + `@ai-sdk/react`) | 在庫・発注データについて相談できるチャットアシスタント。モデルは Claude (最新世代) |
| テスト | Vitest + @testing-library/react + Playwright | TDD (Red → Green → Refactor) 必須 |
| パッケージ | pnpm | |

### Supabase 利用方針

- 接続は Next.js サーバーからのみ (Drizzle + postgres.js、Transaction pooler 経由)。
  クライアントから Supabase に直接アクセスしない。
- RLS は全テーブル有効化 + ポリシーなし (deny-all)。サーバーは service role 接続なので影響なし。
  anon key はクライアントに配らない。
- 認可はすべてアプリ層 (proxy + Server Actions 冒頭の権限チェック) で行う。

### Firebase 利用方針

- Auth: クライアントで ID トークン取得 → `/api/session` でセッションクッキー発行。
  `users.firebase_uid` で DB 上の職員レコードと紐付ける。
- Storage: ファイル保存のみに使用。

---

## 3. アーキテクチャ

```
app/            ルーティング層。ページは RSC でデータ取得
  <domain>/
    page.tsx        一覧・詳細 (RSC)
    actions.ts      Server Actions (認可チェック → zod parse → Drizzle トランザクション)
components/     UI 層。副作用は持たない
lib/
  db/           Drizzle スキーマ・接続・クエリ
  auth/         セッション検証・権限 (roles / permissions)
  validation/   zod スキーマ (フォームと Server Actions で共有)
drizzle/        マイグレーション SQL
```

- ビジネスロジック (在庫仕訳の起票ルール) は `lib/` の純粋関数 + Server Actions 内の
  DB トランザクションに置く。UI 層に I/O を直書きしない。
- 検索・フィルタ・期間指定は nuqs で URL に持ち、RSC が searchParams から WHERE を組む。
  絞り込みは SQL で行い、全件取得してクライアントで filter しない。
- 一覧はページネーション必須。
- 集計 (合計・ランキング・在庫導出) はすべて SQL 側で行う。

---

## 4. 認証・認可

権限フラグは users テーブルの boolean 6 列。

| フラグ | 権限 |
|--------|------|
| is_admin | 権限管理・全画面 |
| is_rd | R&D。マスタ登録、キバタ、設定、在庫調整 |
| is_sales | 営業。キバタ閲覧、加工指示書の作成 |
| is_accounting | 経理。金額確認 |
| is_tokushima | 工場。入荷確定、裁断報告、使用報告、縫製予定、在庫調整 |
| is_order | 発注操作 |

- 加工指示書の作成・希望納期入力は営業 (is_sales)、縫製予定 (班・開始予定日・予定完了日) の
  入力は工場側 (is_tokushima) が担当。画面と Server Actions の認可で役割を分離する。
- proxy (middleware 相当) でセッションクッキー検証 + 画面単位の認可。
- Server Actions は冒頭で必ずセッション検証 + 操作単位の認可を行う共通ラッパーを通す。
- 管理者 UID をコードにハードコードしない (users.is_admin で管理)。

---

## 5. データベース設計

### 5.1 設計原則

- **在庫の真実は台帳 `stock_movements` のみ**。マスタにカウンタ列を持たない。
  在庫表示は VIEW 経由で導出する。
- 業務イベント (発注・分納・裁断・使用報告・調整) は必ず台帳へ仕訳行を起票する。
  取り消し・編集は行削除でなく**逆仕訳** (movement_type='reversal') で履歴を保全する。
- **引当は台帳を動かさない**。台帳は物理的な入出庫の事実のみを記録し、
  「引当で減って見える在庫」は VIEW (有効在庫) で導出する。実在庫と有効在庫を混ぜない。
- ID は uuid (gen_random_uuid)。
- 数量 `numeric(12,2)`、単価 `numeric(10,2)`、業務日付 `date`、監査列 `timestamptz`。
- **数量の桁数方針**: 保存は小数第 2 位 (numeric なので浮動小数点誤差なし)。表示は一覧では
  第 1 位を基本、詳細・伝票では第 2 位。数量計算は SQL 側で行い、JS の number で加減算しない
  (Drizzle の numeric は文字列で受け、フォームは zod で第 2 位までを検証)。
  金額 (数量 × 単価) の円未満丸めは「明細ごとに丸めて合計」で統一する。
- 論理削除はマスタ系のみ `deleted_at timestamptz` (NULL=有効) + partial UNIQUE index。
  トランザクション系はキャンセル列/逆仕訳で対応し論理削除しない。
- アプリは在庫を VIEW 名でのみ参照する。将来パフォーマンスが問題になったら
  同名の集計テーブル (INSERT トリガで加算 UPSERT) に無痛で差し替える。

### 5.2 ENUM

```sql
CREATE TYPE order_type       AS ENUM ('gray_fabric', 'dyeing', 'purchase', 'accessory');
CREATE TYPE stock_source     AS ENUM ('stock', 'running');
-- stock   = 自社管理在庫から引き当て (染色: キバタ在庫 / 購入: 染め上がりの外部在庫)
-- running = 自社管理外ソースから。在庫の引き落としなし
--           (染色: 管理外キバタから染める / 購入: メーカー備蓄の既成生地を買う)
CREATE TYPE stock_kind       AS ENUM ('gf_wip', 'gf_stock',     -- キバタ: 仕掛/在庫
                                      'wip', 'external', 'arriving', 'onhand');
-- wip = 染色仕掛 / external = 外部預け在庫 / arriving = 入荷待ち
-- onhand = 送り先拠点の手持ち在庫。stock_movements.stock_place_id で拠点別に追跡する
-- arriving / onhand は生地と付属で共用 (どちらのエンティティかは FK で区別)
CREATE TYPE movement_type    AS ENUM ('order', 'delivery', 'cutting', 'usage', 'adjustment', 'reversal');
-- usage = 付属の使用報告
CREATE TYPE cutting_category AS ENUM ('self_stock', 'client_provided'); -- 自社在庫/客先支給
CREATE TYPE fiber_code       AS ENUM ('t','c','n','r','h','pu','w','ac','cu','si','as','z','f');
-- 繊維コード 13 種 (ポリエステル、綿、ナイロン など)。表示ラベルはアプリ定数で定義
```

### 5.3 テーブル定義

```sql
-- 職員 (Firebase Auth 連携)
CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid  text NOT NULL UNIQUE,
  name          text NOT NULL,
  rank          integer NOT NULL DEFAULT 1000,   -- 表示順
  is_admin      boolean NOT NULL DEFAULT false,
  is_rd         boolean NOT NULL DEFAULT false,
  is_sales      boolean NOT NULL DEFAULT false,
  is_accounting boolean NOT NULL DEFAULT false,
  is_tokushima  boolean NOT NULL DEFAULT false,
  is_order      boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

-- 仕入先
CREATE TABLE suppliers (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  kana       text NOT NULL DEFAULT '',
  comment    text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE UNIQUE INDEX suppliers_name_active ON suppliers (name) WHERE deleted_at IS NULL;

-- 送り先拠点
CREATE TABLE stock_places (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  kana        text NOT NULL DEFAULT '',
  address     text NOT NULL DEFAULT '',
  tel         text NOT NULL DEFAULT '',
  fax         text NOT NULL DEFAULT '',
  comment     text NOT NULL DEFAULT '',
  is_internal boolean NOT NULL DEFAULT false,   -- true = 自社工場 (裁断・縫製を行う拠点)
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);
CREATE UNIQUE INDEX stock_places_name_active ON stock_places (name) WHERE deleted_at IS NULL;

-- 保管場所
CREATE TABLE locations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  comment       text NOT NULL DEFAULT '',
  deleted_at    timestamptz
);
CREATE UNIQUE INDEX locations_name_active ON locations (name) WHERE deleted_at IS NULL;

-- 色 / 生地名称
CREATE TABLE colors (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL UNIQUE,
  display_order integer NOT NULL DEFAULT 0
);
CREATE TABLE material_names (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL UNIQUE,
  display_order integer NOT NULL DEFAULT 0
);

-- 付属カテゴリ (ファスナー、ボタンなど。設定画面で管理)
CREATE TABLE accessory_categories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL UNIQUE,
  display_order integer NOT NULL DEFAULT 0
);

-- 付属マスタ。在庫カウンタ列は持たない (台帳から導出)
CREATE TABLE accessories (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id    uuid NOT NULL REFERENCES accessory_categories(id),
  supplier_id    uuid NOT NULL REFERENCES suppliers(id),
  product_number text NOT NULL DEFAULT '',
  name           text NOT NULL,
  color          text NOT NULL DEFAULT '',
  size           text NOT NULL DEFAULT '',   -- ファスナーの長さ、ボタンの径など
  unit           text NOT NULL DEFAULT '個', -- 個 / 本 / 巻 / m など
  price          numeric(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  comment        text NOT NULL DEFAULT '',
  created_by     uuid REFERENCES users(id),
  updated_by     uuid REFERENCES users(id),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  deleted_at     timestamptz
);
CREATE UNIQUE INDEX accessories_identity_active
  ON accessories (category_id, name, color, size) WHERE deleted_at IS NULL;

-- キバタ (生機) マスタ。自社管理分のみ。在庫カウンタ列は持たない
CREATE TABLE gray_fabrics (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id    uuid NOT NULL REFERENCES suppliers(id),
  product_number text NOT NULL,
  product_name   text NOT NULL DEFAULT '',
  price          numeric(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  comment        text NOT NULL DEFAULT '',
  created_by     uuid REFERENCES users(id),
  updated_by     uuid REFERENCES users(id),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  deleted_at     timestamptz
);
CREATE UNIQUE INDEX gray_fabrics_number_active
  ON gray_fabrics (product_number) WHERE deleted_at IS NULL;

-- 生地マスタ。在庫カウンタ列は持たない
CREATE TABLE products (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type   smallint NOT NULL DEFAULT 1,
  staff_id       uuid REFERENCES users(id),        -- 担当者。NULL = R&D 管理
  supplier_id    uuid NOT NULL REFERENCES suppliers(id),
  gray_fabric_id uuid REFERENCES gray_fabrics(id), -- 任意 (自社管理キバタから染める生地のみ)
  product_number text NOT NULL,
  product_num    text NOT NULL DEFAULT '',
  product_name   text NOT NULL DEFAULT '',
  color_num      text NOT NULL DEFAULT '',
  color_name     text NOT NULL DEFAULT '',
  price          numeric(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  material_name  text NOT NULL DEFAULT '',         -- material_names から選択 (表示用)
  fabric_width   numeric(6,1),
  fabric_weight  numeric(8,2),
  fabric_length  numeric(8,1),
  features       text[] NOT NULL DEFAULT '{}',     -- 特徴チップ (表示専用)
  interfacing    boolean NOT NULL DEFAULT false,   -- 芯地
  lining         boolean NOT NULL DEFAULT false,   -- 裏地
  note_product   text NOT NULL DEFAULT '',
  note_fabric    text NOT NULL DEFAULT '',
  note_etc       text NOT NULL DEFAULT '',
  created_by     uuid REFERENCES users(id),
  updated_by     uuid REFERENCES users(id),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  deleted_at     timestamptz
);
CREATE UNIQUE INDEX products_number_color_active
  ON products (product_number, color_num) WHERE deleted_at IS NULL;

-- 混率明細
CREATE TABLE product_compositions (
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  fiber      fiber_code NOT NULL,
  percent    numeric(5,2) NOT NULL CHECK (percent > 0 AND percent <= 100),
  PRIMARY KEY (product_id, fiber)
);
-- 合計 <= 100 は zod (アプリ層) で検証

-- 生地 × 保管場所 (M:N)
CREATE TABLE product_locations (
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES locations(id),
  PRIMARY KEY (product_id, location_id)
);

-- 伝票連番 (種別ごと)
CREATE SEQUENCE seq_gray_fabric_order_serial;
CREATE SEQUENCE seq_dyeing_order_serial;
CREATE SEQUENCE seq_purchase_order_serial;
CREATE SEQUENCE seq_accessory_order_serial;
CREATE SEQUENCE seq_cutting_report_serial;
CREATE SEQUENCE seq_work_order_serial;

-- 発注 (キバタ / 染色 / 購入 / 付属 を統合)。quantity は発注総量で不変
CREATE TABLE orders (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_type     order_type NOT NULL,
  serial_number  integer NOT NULL,     -- BEFORE INSERT トリガで種別ごとの SEQUENCE から採番
  gray_fabric_id uuid REFERENCES gray_fabrics(id),
  product_id     uuid REFERENCES products(id),
  accessory_id   uuid REFERENCES accessories(id),
  stock_source   stock_source,        -- dyeing / purchase のみ
  quantity       numeric(12,2) NOT NULL CHECK (quantity > 0),
  price          numeric(10,2) NOT NULL DEFAULT 0,   -- 発注時点の単価を保存 (マスタ変更に影響されない)
  ordered_at     date NOT NULL,
  scheduled_at   date,                -- 入荷予定日
  comment        text NOT NULL DEFAULT '',
  canceled_at    timestamptz,         -- キャンセルは行削除しない
  created_by     uuid REFERENCES users(id),
  updated_by     uuid REFERENCES users(id),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_type, serial_number),
  CHECK ( (order_type = 'accessory') = (accessory_id IS NOT NULL) ),
  CHECK (
    CASE order_type
      WHEN 'gray_fabric' THEN gray_fabric_id IS NOT NULL AND product_id IS NULL
                              AND stock_source IS NULL
      WHEN 'dyeing'      THEN product_id IS NOT NULL AND stock_source IS NOT NULL
                              AND (stock_source = 'running' OR gray_fabric_id IS NOT NULL)
      WHEN 'purchase'    THEN product_id IS NOT NULL AND stock_source IS NOT NULL
                              AND gray_fabric_id IS NULL
      WHEN 'accessory'   THEN product_id IS NULL AND gray_fabric_id IS NULL
                              AND stock_source IS NULL
    END
  )
);
CREATE INDEX orders_product_idx    ON orders (product_id) WHERE product_id IS NOT NULL;
CREATE INDEX orders_gf_idx         ON orders (gray_fabric_id) WHERE gray_fabric_id IS NOT NULL;
CREATE INDEX orders_accessory_idx  ON orders (accessory_id) WHERE accessory_id IS NOT NULL;
CREATE INDEX orders_ordered_at_idx ON orders (order_type, ordered_at);

-- 分納明細 (入荷確定)
CREATE TABLE deliveries (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       uuid NOT NULL REFERENCES orders(id),
  quantity       numeric(12,2) NOT NULL CHECK (quantity > 0),
  price          numeric(10,2) NOT NULL DEFAULT 0,    -- 分納ごとの単価修正を許容
  fixed_at       date NOT NULL,                        -- 入荷確定日
  stock_place_id uuid REFERENCES stock_places(id),     -- 実物入荷を伴う発注 (purchase / accessory) の送り先
  accounting_confirmed boolean NOT NULL DEFAULT false, -- 経理の金額確定フラグ
  comment        text NOT NULL DEFAULT '',
  created_by     uuid REFERENCES users(id),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX deliveries_order_idx    ON deliveries (order_id);
CREATE INDEX deliveries_fixed_at_idx ON deliveries (fixed_at);

-- 加工品マスタ (繰り返し作る製品。加工指示書のテンプレート)
CREATE TABLE processed_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,               -- 製品名
  item_type  text NOT NULL DEFAULT '',    -- 品目区分
  client     text NOT NULL DEFAULT '',    -- 得意先・案件の既定値
  comment    text NOT NULL DEFAULT '',
  created_by uuid REFERENCES users(id),
  updated_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE UNIQUE INDEX processed_items_name_active
  ON processed_items (name, item_type) WHERE deleted_at IS NULL;

-- 標準使用量 (簡易 BOM)。任意 — 登録しなくても指示書は作れる
CREATE TABLE processed_item_materials (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  processed_item_id uuid NOT NULL REFERENCES processed_items(id) ON DELETE CASCADE,
  product_id        uuid REFERENCES products(id),
  accessory_id      uuid REFERENCES accessories(id),
  quantity_per_unit numeric(12,2) NOT NULL CHECK (quantity_per_unit > 0), -- 製品1着あたり使用量
  CHECK (num_nonnulls(product_id, accessory_id) = 1)
);
CREATE UNIQUE INDEX pim_product_uq
  ON processed_item_materials (processed_item_id, product_id)   WHERE product_id IS NOT NULL;
CREATE UNIQUE INDEX pim_accessory_uq
  ON processed_item_materials (processed_item_id, accessory_id) WHERE accessory_id IS NOT NULL;

-- 加工指示書 (裁断報告・使用報告の紐付け先。在庫仕訳は起こさない)
CREATE TABLE work_orders (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number     integer NOT NULL UNIQUE DEFAULT nextval('seq_work_order_serial'),
  processed_item_id uuid REFERENCES processed_items(id),  -- マスタから作成。単発案件は NULL
  project_name      text NOT NULL DEFAULT '',             -- 案件名
  item_name         text NOT NULL,                        -- 製品名 (マスタ選択時は引き継ぎ、編集可)
  item_type         text NOT NULL DEFAULT '',
  client            text NOT NULL DEFAULT '',
  quantity          numeric(12,2) NOT NULL CHECK (quantity > 0),  -- 予定製品数 (着数)
  due_date          date,                                 -- 希望納期 (営業が入力)
  completed_at      timestamptz,                          -- 完了は手動確定
  canceled_at       timestamptz,
  comment           text NOT NULL DEFAULT '',
  created_by        uuid REFERENCES users(id),
  updated_by        uuid REFERENCES users(id),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX wo_due_idx  ON work_orders (due_date);
CREATE INDEX wo_item_idx ON work_orders (processed_item_id) WHERE processed_item_id IS NOT NULL;

-- 指示書の予定明細 (マスタの標準使用量 × 着数で自動展開。編集可・任意)
CREATE TABLE work_order_materials (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id    uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  product_id       uuid REFERENCES products(id),
  accessory_id     uuid REFERENCES accessories(id),
  planned_quantity numeric(12,2) NOT NULL CHECK (planned_quantity > 0),
  CHECK (num_nonnulls(product_id, accessory_id) = 1)
);
CREATE INDEX wom_wo_idx ON work_order_materials (work_order_id);

-- 縫製班マスタ
CREATE TABLE sewing_teams (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  comment       text NOT NULL DEFAULT '',
  deleted_at    timestamptz
);
CREATE UNIQUE INDEX sewing_teams_name_active ON sewing_teams (name) WHERE deleted_at IS NULL;

-- 縫製予定 (工場側が入力。ガントチャートの元データ)
-- 1 指示書を複数班・複数期間に分割して割り当てられる
CREATE TABLE work_order_schedules (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id  uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  sewing_team_id uuid NOT NULL REFERENCES sewing_teams(id),
  start_date     date NOT NULL,             -- 実際に始める予定日
  end_date       date NOT NULL,             -- 予定完了日
  quantity       numeric(12,2),             -- この班に割り振る着数 (任意。分割時に使用)
  comment        text NOT NULL DEFAULT '',
  created_by     uuid REFERENCES users(id),
  updated_by     uuid REFERENCES users(id),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CHECK (start_date <= end_date)
);
CREATE INDEX wos_wo_idx    ON work_order_schedules (work_order_id);
CREATE INDEX wos_team_idx  ON work_order_schedules (sewing_team_id, start_date);
CREATE INDEX wos_range_idx ON work_order_schedules (start_date, end_date);

-- 裁断報告ヘッダ
CREATE TABLE cutting_reports (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number  integer NOT NULL UNIQUE DEFAULT nextval('seq_cutting_report_serial'),
  work_order_id  uuid REFERENCES work_orders(id),  -- 加工指示書 (任意。選択時は案件名等を引き継ぐ)
  staff_id       uuid REFERENCES users(id),
  process_number text NOT NULL DEFAULT '',
  cutting_date   date NOT NULL,
  item_name      text NOT NULL DEFAULT '',         -- ↓3列は指示書なし報告用のフォールバック
  item_type      text NOT NULL DEFAULT '',
  client         text NOT NULL DEFAULT '',
  total_quantity numeric(12,2) NOT NULL DEFAULT 0,   -- 製品数
  comment        text NOT NULL DEFAULT '',
  created_by     uuid REFERENCES users(id),
  updated_by     uuid REFERENCES users(id),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX cutting_reports_date_idx ON cutting_reports (cutting_date);
CREATE INDEX cr_wo_idx ON cutting_reports (work_order_id) WHERE work_order_id IS NOT NULL;

-- 裁断報告明細
CREATE TABLE cutting_report_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id  uuid NOT NULL REFERENCES cutting_reports(id) ON DELETE CASCADE,
  line_no    smallint NOT NULL,
  category   cutting_category NOT NULL,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity   numeric(12,2) NOT NULL CHECK (quantity >= 0),   -- 使用生地量
  UNIQUE (report_id, line_no)
);
CREATE INDEX cri_product_idx ON cutting_report_items (product_id);

-- 裁断報告の既読管理
CREATE TABLE cutting_report_reads (
  report_id uuid NOT NULL REFERENCES cutting_reports(id) ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES users(id),
  read_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (report_id, user_id)
);

-- 付属の使用報告 (消費イベント。現場が手入力する)
CREATE TABLE accessory_usages (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id  uuid REFERENCES work_orders(id),  -- 加工指示書 (任意)
  accessory_id   uuid NOT NULL REFERENCES accessories(id),
  stock_place_id uuid NOT NULL REFERENCES stock_places(id),
  quantity       numeric(12,2) NOT NULL CHECK (quantity > 0),
  used_at        date NOT NULL,
  comment        text NOT NULL DEFAULT '',
  created_by     uuid REFERENCES users(id),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX au_accessory_idx ON accessory_usages (accessory_id);
CREATE INDEX au_used_at_idx   ON accessory_usages (used_at);
CREATE INDEX au_wo_idx        ON accessory_usages (work_order_id) WHERE work_order_id IS NOT NULL;

-- ★ 在庫台帳 (本設計の中核・在庫の唯一の真実)
CREATE TABLE stock_movements (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id     uuid REFERENCES products(id),
  gray_fabric_id uuid REFERENCES gray_fabrics(id),
  accessory_id   uuid REFERENCES accessories(id),
  stock_kind     stock_kind NOT NULL,
  stock_place_id uuid REFERENCES stock_places(id),              -- onhand のとき必須 (拠点別追跡)
  quantity       numeric(12,2) NOT NULL CHECK (quantity <> 0),  -- 符号付き
  movement_type  movement_type NOT NULL,
  order_id       uuid REFERENCES orders(id),
  delivery_id    uuid REFERENCES deliveries(id),
  cutting_report_item_id uuid REFERENCES cutting_report_items(id),
  accessory_usage_id     uuid REFERENCES accessory_usages(id),
  reason         text,                       -- adjustment 時は必須
  occurred_at    timestamptz NOT NULL DEFAULT now(),
  created_by     uuid REFERENCES users(id),
  CHECK (num_nonnulls(product_id, gray_fabric_id, accessory_id) = 1),
  CHECK ( (product_id     IS NOT NULL AND stock_kind IN ('wip','external','arriving','onhand'))
       OR (gray_fabric_id IS NOT NULL AND stock_kind IN ('gf_wip','gf_stock'))
       OR (accessory_id   IS NOT NULL AND stock_kind IN ('arriving','onhand')) ),
  CHECK ( (stock_kind = 'onhand') = (stock_place_id IS NOT NULL) ),
  CHECK (movement_type <> 'adjustment' OR reason IS NOT NULL)
);
CREATE INDEX sm_product_kind_idx ON stock_movements (product_id, stock_kind) INCLUDE (quantity)
  WHERE product_id IS NOT NULL;
CREATE INDEX sm_accessory_kind_idx ON stock_movements (accessory_id, stock_kind) INCLUDE (quantity)
  WHERE accessory_id IS NOT NULL;
CREATE INDEX sm_gf_kind_idx ON stock_movements (gray_fabric_id, stock_kind) INCLUDE (quantity)
  WHERE gray_fabric_id IS NOT NULL;
CREATE INDEX sm_onhand_place_idx ON stock_movements (stock_place_id) INCLUDE (quantity)
  WHERE stock_kind = 'onhand';
CREATE INDEX sm_order_idx    ON stock_movements (order_id)    WHERE order_id IS NOT NULL;
CREATE INDEX sm_delivery_idx ON stock_movements (delivery_id) WHERE delivery_id IS NOT NULL;
```

### 5.4 VIEW / トリガ

```sql
-- 生地在庫の導出 (アプリはこの VIEW だけを読む)
CREATE VIEW product_stock_balances AS
SELECT product_id,
  COALESCE(SUM(quantity) FILTER (WHERE stock_kind = 'wip'),      0) AS wip,
  COALESCE(SUM(quantity) FILTER (WHERE stock_kind = 'external'), 0) AS external_stock,
  COALESCE(SUM(quantity) FILTER (WHERE stock_kind = 'arriving'), 0) AS arriving_quantity,
  COALESCE(SUM(quantity) FILTER (WHERE stock_kind = 'onhand'),   0) AS onhand_stock  -- 全拠点合計
FROM stock_movements WHERE product_id IS NOT NULL GROUP BY product_id;

-- 拠点別在庫。「自社工場の在庫」= stock_places.is_internal 拠点の行
CREATE VIEW product_place_balances AS
SELECT product_id, stock_place_id, SUM(quantity) AS quantity
FROM stock_movements
WHERE stock_kind = 'onhand' AND product_id IS NOT NULL
GROUP BY product_id, stock_place_id;

-- 付属在庫 (全拠点合計と拠点別)
CREATE VIEW accessory_stock_balances AS
SELECT accessory_id,
  COALESCE(SUM(quantity) FILTER (WHERE stock_kind = 'arriving'), 0) AS arriving_quantity,
  COALESCE(SUM(quantity) FILTER (WHERE stock_kind = 'onhand'),   0) AS onhand_stock
FROM stock_movements WHERE accessory_id IS NOT NULL GROUP BY accessory_id;

CREATE VIEW accessory_place_balances AS
SELECT accessory_id, stock_place_id, SUM(quantity) AS quantity
FROM stock_movements
WHERE stock_kind = 'onhand' AND accessory_id IS NOT NULL
GROUP BY accessory_id, stock_place_id;

-- キバタ在庫の導出
CREATE VIEW gray_fabric_stock_balances AS
SELECT gray_fabric_id,
  COALESCE(SUM(quantity) FILTER (WHERE stock_kind = 'gf_wip'),   0) AS wip,
  COALESCE(SUM(quantity) FILTER (WHERE stock_kind = 'gf_stock'), 0) AS stock
FROM stock_movements WHERE gray_fabric_id IS NOT NULL GROUP BY gray_fabric_id;

-- 引当残 = 未完了指示書の予定量 − 同指示書に紐づく実績 (下限 0)
-- 実績: 生地は裁断報告明細、付属は使用報告を 指示書 × 品目 で集計して突合
CREATE VIEW work_order_reservations AS
SELECT wom.product_id, wom.accessory_id,
       SUM(GREATEST(wom.planned_quantity - COALESCE(actual.qty, 0), 0)) AS reserved
FROM work_order_materials wom
JOIN work_orders wo ON wo.id = wom.work_order_id
 AND wo.completed_at IS NULL AND wo.canceled_at IS NULL   -- 完了/キャンセルで引当解放
LEFT JOIN (
  SELECT cr.work_order_id, cri.product_id, NULL::uuid AS accessory_id, SUM(cri.quantity) AS qty
  FROM cutting_report_items cri JOIN cutting_reports cr ON cr.id = cri.report_id
  WHERE cr.work_order_id IS NOT NULL
  GROUP BY cr.work_order_id, cri.product_id
  UNION ALL
  SELECT au.work_order_id, NULL::uuid, au.accessory_id, SUM(au.quantity)
  FROM accessory_usages au
  WHERE au.work_order_id IS NOT NULL
  GROUP BY au.work_order_id, au.accessory_id
) actual ON actual.work_order_id = wom.work_order_id
        AND (actual.product_id IS NOT DISTINCT FROM wom.product_id)
        AND (actual.accessory_id IS NOT DISTINCT FROM wom.accessory_id)
GROUP BY wom.product_id, wom.accessory_id;

-- 有効在庫 = 実在庫 (拠点在庫合計) − 引当残。発注判断はこれを見る
CREATE VIEW product_available_balances AS
SELECT b.product_id,
       b.onhand_stock                                  AS onhand,     -- 実在庫
       COALESCE(r.reserved, 0)                         AS reserved,   -- 引当残
       b.onhand_stock - COALESCE(r.reserved, 0)        AS available   -- 有効在庫
FROM product_stock_balances b
LEFT JOIN work_order_reservations r ON r.product_id = b.product_id;

CREATE VIEW accessory_available_balances AS
SELECT b.accessory_id,
       b.onhand_stock                                  AS onhand,
       COALESCE(r.reserved, 0)                         AS reserved,
       b.onhand_stock - COALESCE(r.reserved, 0)        AS available
FROM accessory_stock_balances b
LEFT JOIN work_order_reservations r ON r.accessory_id = b.accessory_id;

-- 発注残・ステータス導出 (発注数量は不変。残量は分納の合計から導出する)
CREATE VIEW order_progress AS
SELECT o.id, o.order_type, o.serial_number,
       o.quantity - COALESCE(d.delivered, 0) AS remaining,
       CASE WHEN o.canceled_at IS NOT NULL THEN 'canceled'
            WHEN o.quantity <= COALESCE(d.delivered, 0) THEN 'completed'
            ELSE 'open' END AS status
FROM orders o
LEFT JOIN (SELECT order_id, SUM(quantity) delivered FROM deliveries GROUP BY order_id) d
  ON d.order_id = o.id;

-- 発注連番の種別別採番
CREATE FUNCTION assign_order_serial() RETURNS trigger AS $$
BEGIN
  IF NEW.serial_number IS NULL THEN
    NEW.serial_number := nextval(
      CASE NEW.order_type
        WHEN 'gray_fabric' THEN 'seq_gray_fabric_order_serial'
        WHEN 'dyeing'      THEN 'seq_dyeing_order_serial'
        WHEN 'purchase'    THEN 'seq_purchase_order_serial'
        WHEN 'accessory'   THEN 'seq_accessory_order_serial'
      END);
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;
CREATE TRIGGER orders_serial BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION assign_order_serial();
```

### 5.5 業務イベント → 仕訳ルール

Server Actions のトランザクション内で orders / deliveries / cutting_report_items /
accessory_usages の書き込みと**同時に**起票する。

| イベント | 仕訳行 (stock_movements) |
|---|---|
| キバタ発注 | +q gf_wip |
| キバタ分納 | −q gf_wip, +q gf_stock |
| 染色発注 (source=stock) | −q gf_stock, +q wip (自社管理キバタ在庫から染める) |
| 染色発注 (source=running) | +q wip のみ (自社管理外キバタから染める。キバタ在庫と無関係に発注可) |
| 染色分納 | −q wip, +q external (染め上がりは外部の預け在庫になる) |
| 購入発注 (source=stock) | −q external, +q arriving (染め上がり外部在庫からの取り寄せ) |
| 購入発注 (source=running) | +q arriving のみ (メーカー備蓄の既成生地の購入) |
| 購入分納 | −q arriving, +q onhand@送り先拠点 |
| 客先支給の受入 | +q onhand@自社工場、単価 0 円で計上 (無償支給材の預り在庫) |
| 裁断報告明細 | −q onhand@自社工場 (明細ごと。客先支給分も 0 円受入済みのため同様に減算する) |
| 付属発注 | +q arriving (付属) |
| 付属分納 | −q arriving, +q onhand@送り先拠点 |
| 付属使用報告 | −q onhand@拠点 (movement_type='usage'。現場が手入力) |
| 発注編集・キャンセル | movement_type='reversal' の逆符号行 (元の行は残す) |
| 手動調整 | movement_type='adjustment'、差分値を起票 (上書きでなく)、reason 必須。onhand は拠点指定必須 |

加工指示書・縫製予定は在庫仕訳を起こさない (引当は VIEW で導出)。

---

## 6. 画面・機能一覧

ナビは 8 セクション: 生地 / キバタ / 加工指示書 / 付属 / 工場 / 経理 / 調整 / 設定・権限。
加えてダッシュボードと AI チャット。

### 生地 (全ユーザー)
| 画面 | 内容 |
|------|------|
| /products | 生地一覧 + 在庫 (仕掛 / 外部 / 入荷待ち / 拠点在庫)。実在庫と別に引当残・有効在庫を表示 (発注判断は有効在庫を見る)。検索条件は nuqs で URL 化、SQL でフィルタ・ページネーション。CSV 出力 |
| /products/new | マスタ登録 (rd のみ)。混率は product_compositions へ |
| /products/[id] | 詳細・編集・在庫履歴 (台帳から生地ごとの入出庫履歴を表示)・送り先拠点別の在庫内訳 |
| /products/fabric-dyeing/orders | 染色仕掛一覧 (order_progress.status='open') + 発注・分納確定 |
| /products/fabric-dyeing/confirms | 染色履歴一覧 (deliveries、期間フィルタ) |
| /products/fabric-purchase/orders | 入荷予定一覧 + 発注・入荷確定 |
| /products/fabric-purchase/confirms | 入荷履歴一覧 |

### キバタ (rd / sales)
| 画面 | 内容 |
|------|------|
| /gray-fabrics | キバタ一覧 + 在庫 (仕掛 / 在庫) |
| /gray-fabrics/new | マスタ登録 (rd) |
| /gray-fabrics/orders | 仕掛一覧 + 発注・入荷確定 |
| /gray-fabrics/confirms | 仕掛履歴 |

### 加工指示書
| 画面 | 内容 |
|------|------|
| /work-orders | 指示書一覧 (案件名・製品名・納期・進捗で検索。予定 vs 実績の消化率表示) |
| /work-orders/new | 作成 (sales)。加工品マスタを選択して着数を入れると、標準使用量 × 着数で生地・付属の予定使用数が自動展開 (編集可)。単発案件はマスタなしで直接入力 |
| /work-orders/[id] | 詳細: 予定明細と、紐づく裁断報告・使用報告の実績、案件別材料費の集計、縫製予定の割当 (工場側が班・開始予定日・予定完了日を入力) |
| /work-orders/gantt | 縫製ガントチャート: 行 = 縫製班、バー = 割当 (開始予定日 → 予定完了日)。バーに製品名・着数を表示し、希望納期を超える割当は警告色。週/月表示切替、未割当の指示書リストから割当作成。外部ライブラリに頼らず CSS Grid ベースで自作 (日付 × 班のグリッド) |
| /processed-items | 加工品マスタ CRUD + 標準使用量 (製品 1 着あたりの生地 m 数・付属個数) の編集 |

### 付属 (ファスナー・ボタンなど)
| 画面 | 内容 |
|------|------|
| /accessories | 付属一覧 + 在庫 (入荷待ち / 拠点在庫 / 引当残 / 有効在庫)。カテゴリ・仕入先・色・サイズでフィルタ |
| /accessories/new | マスタ登録 (カテゴリ・品番・色・サイズ・単位・単価) |
| /accessories/orders | 発注一覧 + 発注・入荷確定 (orders / deliveries を生地と共用。分納対応) |
| /accessories/confirms | 入荷履歴一覧 |
| /accessories/usages | 使用報告の一覧・入力 (どの付属を・どの拠点で・いくつ使ったか)。加工指示書を選択すると予定明細から品目・数量がプリセットされる |

### 工場 (tokushima / admin)
| 画面 | 内容 |
|------|------|
| /tokushima/fabric-purchase/orders | 入荷予定一覧 (工場向けビュー) |
| /tokushima/fabric-purchase/confirms | 入荷履歴 |
| /tokushima/cutting-reports | 裁断報告書一覧 (既読管理は cutting_report_reads) |
| /tokushima/cutting-reports/new | 裁断報告書作成 (明細行 = cutting_report_items)。加工指示書を選択すると案件名・製品名を引き継ぎ、予定明細から生地・数量がプリセットされる (指示書なしの単発報告も可) |
| /tokushima/cutting-reports/history | 裁断生地一覧 (生地別の裁断集計) |

### 経理 (accounting)
| 画面 | 内容 |
|------|------|
| /accounting-dept/orders | 金額確認 (deliveries.accounting_confirmed = false) |
| /accounting-dept/confirms | 処理済み |

### 調整 (rd / tokushima)
| 画面 | 内容 |
|------|------|
| /adjustment/products | 在庫調整: 上書きでなく「差分 + 理由必須」の調整仕訳を起票。onhand は拠点を指定。調整履歴も表示 |
| /adjustment/gray-fabrics | 同上 (rd のみ) |
| /adjustment/accessories | 付属の在庫調整 (同上) |

### 設定 (rd) / 権限 (admin)
| 画面 | 内容 |
|------|------|
| /settings/suppliers, /stock-places, /material-names, /colors, /locations, /accessory-categories, /sewing-teams | マスタ CRUD |
| /settings/auth | 権限管理 (users の boolean 6 列) |

### AI チャット (/chat)
- Vercel AI SDK による社内データ相談チャット。「この生地の在庫推移は?」「今月の裁断量トップは?」
  のような質問に、DB を参照して回答する。
- 構成:
  - クライアント: `@ai-sdk/react` の `useChat` + shadcn/ui のチャット UI
  - サーバー: Route Handler (`/api/chat`) で `streamText` ストリーミング応答
  - モデル: `@ai-sdk/anthropic` 経由の Claude (最新世代を使用)
  - ツール (tool calling): **読み取り専用**の DB 照会関数のみ公開する
    (生地検索、在庫残高、在庫履歴、発注残、裁断/購入集計)。書き込み系ツールは提供しない
- **チャット履歴は DB に保存しない**。会話履歴は sessionStorage に保持する
  (タブ単位・タブを閉じると消える。chats/messages 系のテーブルは作らない)
  - `useChat` の messages を sessionStorage と同期し、リロード時に復元する
  - 履歴はブラウザ内にのみ存在するため、機微データの保存範囲もブラウザ内で完結する
- 認可: セッションクッキー必須。ツールが返すデータはログインユーザーの閲覧権限内に限定
- API キー (`ANTHROPIC_API_KEY`) はサーバー環境変数のみ。クライアントに露出させない

### ダッシュボード (/dashboard)
- 在庫サマリ: `product_stock_balances` × price の集計 SQL 1 本
- 付属サマリ: `accessory_stock_balances` の合計と発注残
- ランキング 4 本 (裁断量 / 裁断額 / 購入量 / 購入額): GROUP BY + LIMIT の SQL。描画は recharts

---

## 7. バリデーション方針

- zod スキーマを `lib/validation/` に置き、react-hook-form (`zodResolver`) と
  Server Actions の入力検証で**同一スキーマを共有**する。
- Server Actions は必ず: セッション検証 → 認可 → `schema.parse(input)` → Drizzle トランザクション。
- DB 制約 (CHECK / FK / UNIQUE) は最後の砦。ユーザー向けエラーは zod 層で返す。
- 混率合計 ≤ 100% は zod の `refine` で検証。

---

## 8. 実装時に決める事項

1. **客先支給の 0 円受入の起票画面**: 購入フローに price=0 で乗せるか、専用の受入画面を作るか。
2. **マイナス在庫の扱い**: 推奨は「保存は許可するが一覧・入力時に警告表示」
   (入力順序の都合で一時的なマイナスは実務上発生するため、拒否より警告が現実的)。

---

## 9. 追加候補機能 (初期リリースには含めない。優先度順)

台帳方式 (stock_movements) を採用した時点で、以下はすべて追加テーブルほぼなしで実現できる。
YAGNI 原則に従い、必要と判断したものから着手する。

### 優先度高 (低コスト・高効果)

1. **納期遅延アラート**: `order_progress.status='open' AND scheduled_at < CURRENT_DATE` を
   ダッシュボードに表示するだけ。追加テーブル不要。
2. **発注点 (最低在庫) アラート**: products に `reorder_point numeric` を 1 列追加し、
   有効在庫 + 入荷待ちが下回ったらダッシュボードで警告。定番品 (running) の欠品防止に直結。
3. **在庫推移グラフ**: 台帳の時系列 SUM で任意期間の残高推移を描画 (recharts)。

### 優先度中 (業務が回り始めてから)

4. **実地棚卸機能**: 拠点ごとに実数を一括入力 → 差異を一括調整仕訳 + 棚卸記録として保存。
   stocktakes / stocktake_items テーブルを追加。台帳とセットで初めて監査に耐える。
5. **月次在庫レポート (経理向け)**: 台帳は `occurred_at <= 月末` の SUM で任意時点の残高を
   復元できるため、月末残高 (数量 × 単価) の帳票は画面 1 枚で済む。
6. **入荷予定カレンダー**: scheduled_at ベースの週/月ビュー。工場の受入計画に。

### 優先度低 (要件が固まってから。先取りしない)

7. **染色ロット管理**: 染ロットごとの色ブレ追跡。テーブル・画面とも複雑化が大きいので
   現場から要望が出てから。
8. **在庫金額評価 (移動平均法など)**: 経理が在庫評価額の厳密さを求めたら、
   deliveries の実際単価から移動平均を計算する形へ。
9. **価格改定履歴**: product_price_history テーブル。原価分析の要望が出たら。

---

## 10. 開発規約

- **TDD 必須**: Red → Green → Refactor。仕訳起票ロジック (§5.5) と引当計算は
  テストで仕様として固定する。
- DRY 3 回ルール / YAGNI (先取り抽象化禁止)。
- Conventional Commits。main 直 push 禁止、PR レビュー後に squash merge。
- 完了報告前: テスト緑 / lint 緑 / typecheck 緑 / build 緑。
