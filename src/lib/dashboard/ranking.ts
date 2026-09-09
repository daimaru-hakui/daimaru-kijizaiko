import type { CuttingReportType, SerializableHistory } from '../../../types'

/** 生地 1 件分の集計値 (数量または金額) */
export type RankingRow = { productId: string; value: number }

/** グラフに渡す 1 行。ラベルは「品番 色」 */
export type RankingChartRow = { label: string; value: number }

export type ProductLabelMap = Record<string, { productNumber: string; colorName: string }>

/** 開始日・終了日 (YYYY-MM-DD) を含む期間内か */
function isWithinPeriod(date: string, startDay: string, endDay: string): boolean {
  const time = new Date(date).getTime()
  return new Date(startDay).getTime() <= time && time <= new Date(endDay).getTime()
}

/** 生地ごとに value を合計し、大きい順に並べる。同点は先に現れた生地が前 */
function sumByProduct(rows: RankingRow[]): RankingRow[] {
  const totals = new Map<string, number>()
  for (const { productId, value } of rows) {
    totals.set(productId, (totals.get(productId) ?? 0) + value)
  }
  return Array.from(totals, ([productId, value]) => ({ productId, value })).sort(
    (a, b) => b.value - a.value,
  )
}

/** 金額は円未満を四捨五入して表示する */
function roundValues(rows: RankingRow[]): RankingRow[] {
  return rows.map((row) => ({ ...row, value: Math.round(row.value) }))
}

/** 期間内の裁断報告書から使用した生地の明細だけを取り出す */
function cuttingProductsInPeriod(
  reports: CuttingReportType[],
  startDay: string,
  endDay: string,
): CuttingReportType['products'] {
  return reports
    .filter((report) => isWithinPeriod(report.cuttingDate, startDay, endDay))
    .flatMap((report) => report.products)
}

function purchasesInPeriod(
  histories: SerializableHistory[],
  startDay: string,
  endDay: string,
): SerializableHistory[] {
  return histories.filter((history) => isWithinPeriod(history.fixedAt, startDay, endDay))
}

/** 生地使用数量ランキング */
export function rankCuttingQuantity(
  reports: CuttingReportType[],
  startDay: string,
  endDay: string,
): RankingRow[] {
  return sumByProduct(
    cuttingProductsInPeriod(reports, startDay, endDay).map((product) => ({
      productId: product.productId,
      value: product.quantity,
    })),
  )
}

/** 生地使用金額ランキング。裁断報告書は単価を持たないため生地マスタの単価を掛ける。引けない生地は 0 円 */
export function rankCuttingPrice(
  reports: CuttingReportType[],
  startDay: string,
  endDay: string,
  priceMap: Record<string, number>,
): RankingRow[] {
  return roundValues(
    sumByProduct(
      cuttingProductsInPeriod(reports, startDay, endDay).map((product) => ({
        productId: product.productId,
        value: product.quantity * (priceMap[product.productId] ?? 0),
      })),
    ),
  )
}

/** 生地購入数量ランキング (入荷確定日で期間を見る) */
export function rankPurchaseQuantity(
  histories: SerializableHistory[],
  startDay: string,
  endDay: string,
): RankingRow[] {
  return sumByProduct(
    purchasesInPeriod(histories, startDay, endDay).map((history) => ({
      productId: history.productId,
      value: history.quantity,
    })),
  )
}

/** 生地購入金額ランキング。入荷履歴は確定時の単価を持つのでそれを使う */
export function rankPurchasePrice(
  histories: SerializableHistory[],
  startDay: string,
  endDay: string,
): RankingRow[] {
  return roundValues(
    sumByProduct(
      purchasesInPeriod(histories, startDay, endDay).map((history) => ({
        productId: history.productId,
        value: history.price * history.quantity,
      })),
    ),
  )
}

/** 上位 limit 件を「品番 色」のラベル付きにする。品番が引けない生地は ID をそのまま出す */
export function toChartRows(
  ranking: RankingRow[],
  limit: number,
  productsMap: ProductLabelMap,
): RankingChartRow[] {
  return ranking.slice(0, limit).map(({ productId, value }) => {
    const product = productsMap[productId]
    const label = [product?.productNumber ?? productId, product?.colorName]
      .filter(Boolean)
      .join(' ')
    return { label, value }
  })
}
